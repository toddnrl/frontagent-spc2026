"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PhoneIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { getEmbedOrganizationId } from "../../../lib/organization";
import { getAgentApiBaseUrl } from "../../../lib/agentApiBase";
import { saveCallSession } from "../../../lib/callSessionStorage";

const API_BASE = getAgentApiBaseUrl();
const ORG_ID = getEmbedOrganizationId();
const MIN_RECORDING_MS = 500;
const MAX_RECORDING_MS = 15000;
const MIN_AUDIO_BYTES = 1024;
const VAD_INTERVAL_MS = 80;
const VAD_START_THRESHOLD = 0.035;
const VAD_STOP_THRESHOLD = 0.02;
// 말이 끝나면 더 빨리 턴을 종료해 realtime 같은 즉답 느낌을 준다(너무 짧으면 말 중간 끊김).
const VAD_SILENCE_MS = 600;
const BARGE_IN_START_THRESHOLD = 0.055;
const BARGE_IN_MIN_FRAMES = 3;
const IDLE_WARNING_MS = 30000;
const IDLE_END_AFTER_WARNING_MS = 15000;
const HOLDING_MESSAGES = [
  "확인해보겠습니다.",
  "관련 내용을 확인하고 말씀드리겠습니다.",
  "조금만 기다려 주세요. 확인 중입니다.",
];

export interface VoiceTraceEvent {
  id: string;
  title: string;
  status: "done" | "active" | "warning";
  detail: string;
  elapsedMs?: number;
  items?: unknown[];
}

interface CallTabProps {
  organizationId?: string;
  sessionIdPrefix?: string;
  userId?: string | null;
  onTrace?: (event: VoiceTraceEvent) => void;
  onCallDuration?: (label: string, seconds: number) => void;
  onConversationUpdate?: (payload: {
    conversationId: string | null;
    sessionId: string;
    preview?: string;
  }) => void;
}

type CallStatus = "idle" | "connecting" | "active" | "ended";
type VoiceMode = "pipeline" | "realtime";
type PipelineStatus = "idle" | "listening" | "recording" | "processing" | "speaking";

interface RealtimeFunctionCall {
  type: "function_call";
  name: string;
  call_id: string;
  arguments: string;
}

interface RealtimeResponseDoneEvent {
  type: "response.done";
  response?: {
    output?: Array<RealtimeFunctionCall | { type: string }>;
  };
}

interface RealtimeErrorEvent {
  type: "error";
  error?: { message?: string };
}

const formatCallDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const audioFileNameForMimeType = (mimeType: string) => {
  if (mimeType.includes("mp4")) return "utterance.mp4";
  if (mimeType.includes("mpeg")) return "utterance.mp3";
  if (mimeType.includes("ogg")) return "utterance.ogg";
  if (mimeType.includes("wav")) return "utterance.wav";
  return "utterance.webm";
};

const audioUploadLabel = (audioBlob: Blob) => {
  const type = audioBlob.type || "recorded audio";
  return `${type} · ${Math.round(audioBlob.size / 1024)}KB`;
};

const audioUploadFileName = (audioBlob: Blob) => audioFileNameForMimeType(audioBlob.type || "audio/webm");

export function CallTab({
  organizationId = ORG_ID,
  sessionIdPrefix = "web_call_",
  userId = null,
  onTrace,
  onCallDuration,
  onConversationUpdate,
}: CallTabProps = {}) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callSeconds, setCallSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("pipeline");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const callStatusRef = useRef<CallStatus>("idle");
  const callSecondsRef = useRef(0);
  const pipelineStatusRef = useRef<PipelineStatus>("idle");
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const ringbackAudioContextRef = useRef<AudioContext | null>(null);
  const ringbackTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const stopRecordingTimerRef = useRef<number | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const maxRecordingTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartedAtRef = useRef<number | null>(null);
  const speechFramesRef = useRef(0);
  const bargeInFramesRef = useRef(0);
  const idleWarningTimerRef = useRef<number | null>(null);
  const idleEndTimerRef = useRef<number | null>(null);
  const idleWarningPlayedRef = useRef(false);
  const holdingMessageIndexRef = useRef(0);
  const pipelineTurnIdRef = useRef(0);
  const activeTurnAbortControllerRef = useRef<AbortController | null>(null);
  const pendingInterruptContextRef = useRef<string | null>(null);
  const lastTranscriptRef = useRef<string | null>(null);
  const lastAnswerRef = useRef<string | null>(null);
  const discardRecordingRef = useRef(false);
  const audioUrlRef = useRef<string | null>(null);
  const handledCallIdsRef = useRef(new Set<string>());
  const sessionIdRef = useRef(`${sessionIdPrefix}${crypto.randomUUID()}`);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    callSecondsRef.current = callSeconds;
  }, [callSeconds]);

  const emitCallStartedTrace = () => {
    onCallDuration?.("00:00", 0);
    onTrace?.({
      id: "voice_call_start",
      title: "통화 시작",
      status: "done",
      detail: "웹 음성 상담이 연결되었습니다.",
    });
    void notifyCallStarted();
  };

  const emitCallEndedTrace = () => {
    const seconds = callSecondsRef.current;
    onTrace?.({
      id: "voice_call_end",
      title: "통화 종료",
      status: "done",
      detail: `통화 시간 ${formatCallDuration(seconds)}`,
      elapsedMs: seconds * 1000,
    });
  };

  useEffect(() => {
    pipelineStatusRef.current = pipelineStatus;
  }, [pipelineStatus]);

  useEffect(() => {
    if (callStatus !== "active") return;

    const interval = window.setInterval(() => {
      setCallSeconds((seconds) => {
        const next = Math.min(seconds + 1, 59 * 60 + 59);
        onCallDuration?.(formatCallDuration(next), next);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [callStatus, onCallDuration]);

  const clearPipelineIdleTimers = () => {
    if (idleWarningTimerRef.current !== null) window.clearTimeout(idleWarningTimerRef.current);
    idleWarningTimerRef.current = null;
    if (idleEndTimerRef.current !== null) window.clearTimeout(idleEndTimerRef.current);
    idleEndTimerRef.current = null;
  };

  const endCallByIdleTimeout = () => {
    if (callStatusRef.current !== "active") return;
    onTrace?.({
      id: "voice_idle_end",
      title: "무응답 종료",
      status: "warning",
      detail: "일정 시간 사용자 응답이 없어 통화를 종료했습니다.",
    });
    emitCallEndedTrace();
    releaseCallResources();
    setCallStatus("ended");
    notifyCallEnded();
  };

  const schedulePipelineIdleTimeouts = () => {
    clearPipelineIdleTimers();
    idleWarningPlayedRef.current = false;
    if (callStatusRef.current !== "active" || voiceMode !== "pipeline") return;

    idleWarningTimerRef.current = window.setTimeout(() => {
      if (callStatusRef.current !== "active" || pipelineStatusRef.current !== "listening") return;
      idleWarningPlayedRef.current = true;
      onTrace?.({
        id: "voice_idle_warning",
        title: "무응답 안내",
        status: "warning",
        detail: "사용자 응답이 없어 종료 예정 안내를 재생합니다.",
      });
      void playSpeech(
        "말씀이 없으시면 잠시 후 통화를 종료하겠습니다.",
        "voice_idle_warning",
        "무응답 종료 안내",
      ).finally(() => {
        if (callStatusRef.current === "active" && pipelineStatusRef.current === "speaking") {
          setPipelineStatus("listening");
        }
      });

      idleEndTimerRef.current = window.setTimeout(endCallByIdleTimeout, IDLE_END_AFTER_WARNING_MS);
    }, IDLE_WARNING_MS);
  };

  const releaseCallResources = () => {
    discardRecordingRef.current = true;
    clearPipelineIdleTimers();
    if (stopRecordingTimerRef.current !== null) window.clearTimeout(stopRecordingTimerRef.current);
    stopRecordingTimerRef.current = null;
    if (vadIntervalRef.current !== null) window.clearInterval(vadIntervalRef.current);
    vadIntervalRef.current = null;
    if (maxRecordingTimerRef.current !== null) window.clearTimeout(maxRecordingTimerRef.current);
    maxRecordingTimerRef.current = null;
    stopRingbackTone();
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    silenceStartedAtRef.current = null;
    speechFramesRef.current = 0;
    bargeInFramesRef.current = 0;
    activeTurnAbortControllerRef.current?.abort();
    activeTurnAbortControllerRef.current = null;
    pipelineTurnIdRef.current += 1;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];

    dataChannelRef.current?.close();
    dataChannelRef.current = null;

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setPipelineStatus("idle");
  };

  useEffect(() => releaseCallResources, []);

  const stopRingbackTone = () => {
    if (ringbackTimerRef.current !== null) window.clearInterval(ringbackTimerRef.current);
    ringbackTimerRef.current = null;
    void ringbackAudioContextRef.current?.close();
    ringbackAudioContextRef.current = null;
  };

  const startRingbackTone = () => {
    stopRingbackTone();
    const audioContext = new AudioContext();
    ringbackAudioContextRef.current = audioContext;

    const playPulse = () => {
      if (callStatusRef.current !== "active") return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 440;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.7);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.75);
    };

    playPulse();
    ringbackTimerRef.current = window.setInterval(playPulse, 1700);
  };

  const interruptPipelineTurn = () => {
    clearPipelineIdleTimers();
    pipelineTurnIdRef.current += 1;
    activeTurnAbortControllerRef.current?.abort();
    activeTurnAbortControllerRef.current = null;
    stopRingbackTone();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };

  const beginPipelineTurn = () => {
    interruptPipelineTurn();
    const controller = new AbortController();
    activeTurnAbortControllerRef.current = controller;
    return { turnId: pipelineTurnIdRef.current, signal: controller.signal };
  };

  const isCurrentPipelineTurn = (turnId: number) =>
    callStatusRef.current === "active" && pipelineTurnIdRef.current === turnId;

  const persistCallSession = (preview?: string) => {
    const nextPreview = preview?.trim() || lastTranscriptRef.current?.trim() || undefined;
    saveCallSession({
      sessionId: sessionIdRef.current,
      conversationId: conversationIdRef.current,
      organizationId,
      userId,
      savedAt: Date.now(),
      preview: nextPreview,
    });
    onConversationUpdate?.({
      conversationId: conversationIdRef.current,
      sessionId: sessionIdRef.current,
      preview: nextPreview,
    });
  };

  const publishConversationUpdate = (conversationId: string, preview?: string) => {
    if (conversationIdRef.current === conversationId && !preview?.trim()) return;
    conversationIdRef.current = conversationId;
    persistCallSession(preview);
  };

  const notifyCallStarted = async () => {
    try {
      const response = await fetch(`${API_BASE}/voice/call/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          session_id: sessionIdRef.current,
          channel: "web_call",
        }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { conversation_id?: unknown };
      if (typeof data.conversation_id === "string" && data.conversation_id.trim()) {
        publishConversationUpdate(data.conversation_id.trim());
      }
    } catch {
      // 시작 기록 API가 없거나 실패해도 통화 흐름은 계속한다.
    }
  };

  const sendRealtimeEvent = (event: Record<string, unknown>) => {
    const channel = dataChannelRef.current;
    if (!channel || channel.readyState !== "open") return;
    channel.send(JSON.stringify(event));
  };

  const parseSsePayload = (payload: string) => {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return {};
    }
  };

  const nextHoldingMessage = () => {
    const message = HOLDING_MESSAGES[holdingMessageIndexRef.current % HOLDING_MESSAGES.length];
    holdingMessageIndexRef.current += 1;
    return message;
  };

  const blobFromBase64 = (base64: string, contentType: string) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: contentType });
  };

  const voiceTraceStepTitle = (step: string) => {
    const titles: Record<string, string> = {
      conversation: "대화 세션",
      decision: "의도 분석",
      intent: "의도 분석",
      knowledge: "지식 확인",
      rule: "규칙 평가",
      rules: "규칙 평가",
      response: "응답 생성",
      final: "최종 응답",
    };
    return titles[step] ?? "처리 단계";
  };

  const requestPipelineTurnStream = async (
    audioBlob: Blob,
    turnId: number,
    signal: AbortSignal,
    interruptContext: string | null,
  ) => {
    const formData = new FormData();
    formData.append("organization_id", organizationId);
    formData.append("session_id", sessionIdRef.current);
    formData.append("audio", audioBlob, audioUploadFileName(audioBlob));
    if (interruptContext) formData.append("interrupt_context", interruptContext);

    const response = await fetch(`${API_BASE}/voice/pipeline/turn/stream`, {
      method: "POST",
      headers: { Accept: "text/event-stream" },
      signal,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        response.status === 422
          ? "음성이 감지되지 않았습니다. 마이크 가까이에서 1초 이상 말씀해 주세요."
          : `음성 처리 실패 (HTTP ${response.status})`,
      );
    }
    if (!response.body) throw new Error("음성 처리 스트림을 열 수 없습니다.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let transcript = "";
    let streamedText = "";
    let finalAnswer = "";
    let streamConversationId: string | null = null;
    let knowledgeNoticePromise: Promise<void> | null = null;
    let didPlayKnowledgeNotice = false;
    let lastSseEventAt = performance.now();

    const emitPipelineTrace = (event: VoiceTraceEvent) => {
      const now = performance.now();
      const elapsedSincePrevious = Math.round(now - lastSseEventAt);
      lastSseEventAt = now;
      onTrace?.({
        ...event,
        elapsedMs: event.elapsedMs ?? elapsedSincePrevious,
      });
    };

    // 백엔드가 문장 단위로 보내는 audio 청크를 index 순서로 모아 끊김 없이 순차 재생한다.
    const audioChunks = new Map<number, Blob>();
    let nextAudioIndex = 0;
    let audioStreamEnded = false;
    let playerActive = false;
    let knowledgeNoticeAwaited = false;
    let resolvePlayback: (() => void) | null = null;
    const playbackDone = new Promise<void>((resolve) => {
      resolvePlayback = resolve;
    });

    const finalizePlaybackIfDone = () => {
      const drained = !audioChunks.has(nextAudioIndex) && audioChunks.size === 0;
      if (!isCurrentPipelineTurn(turnId) || (audioStreamEnded && drained && !playerActive)) {
        resolvePlayback?.();
        resolvePlayback = null;
      }
    };

    const playQueuedAudio = async () => {
      if (playerActive) return;
      playerActive = true;
      try {
        // 보류 안내(확인 중...) 음성이 있으면 답변 청크보다 먼저 끝까지 재생한다.
        if (!knowledgeNoticeAwaited && knowledgeNoticePromise) {
          knowledgeNoticeAwaited = true;
          await knowledgeNoticePromise;
        }
        while (isCurrentPipelineTurn(turnId)) {
          const chunk = audioChunks.get(nextAudioIndex);
          if (!chunk) break; // 다음 청크 도착 시(또는 audio_end 시) 다시 깨운다.
          audioChunks.delete(nextAudioIndex);
          nextAudioIndex += 1;
          await playAudioBlob(chunk, turnId);
        }
      } finally {
        playerActive = false;
        finalizePlaybackIfDone();
      }
    };

    const handleEvent = async (raw: string) => {
      const lines = raw.split(/\r?\n/);
      const event = lines.find((line) => line.startsWith("event:"))?.slice(6).trim() ?? "message";
      const payload = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!payload) return;

      const data = parseSsePayload(payload);
      if (typeof data.conversation_id === "string" && data.conversation_id.trim()) {
        streamConversationId = data.conversation_id.trim();
        publishConversationUpdate(streamConversationId, transcript || undefined);
      }

      if (event === "transcript") {
        transcript = typeof data.text === "string" ? data.text.trim() : "";
        if (transcript) {
          lastTranscriptRef.current = transcript;
          emitPipelineTrace({ id: "voice_stt", title: "음성 인식", status: "done", detail: transcript });
        }
        return;
      }

      if (event === "trace") {
        const step = typeof data.step === "string" ? data.step : "";
        const detail = typeof data.detail === "string" ? data.detail : "";
        emitPipelineTrace({
          id: `voice_${step || "trace"}`,
          title: voiceTraceStepTitle(step),
          status: "done",
          detail,
          items: Array.isArray(data.items) ? data.items : [],
        });
        return;
      }

      if (event === "knowledge_start") {
        emitPipelineTrace({
          id: "voice_knowledge_start",
          title: "지식 확인 시작",
          status: "active",
          detail: "답변에 필요한 정보를 확인합니다.",
          items: Array.isArray(data.queries) ? data.queries : [],
        });

        if (!didPlayKnowledgeNotice && isCurrentPipelineTurn(turnId)) {
          didPlayKnowledgeNotice = true;
          knowledgeNoticePromise = playSpeech(nextHoldingMessage(), "voice_knowledge_notice", "지식 확인 안내", { turnId, signal })
            .catch((noticeError) => {
              const noticeDetail = noticeError instanceof Error ? noticeError.message : "지식 확인 안내 음성 생성 실패";
              onTrace?.({ id: "voice_knowledge_notice_failed", title: "지식 확인 안내 실패", status: "warning", detail: noticeDetail });
            })
            .finally(() => {
              if (isCurrentPipelineTurn(turnId)) setPipelineStatus("processing");
            });
        }
        return;
      }

      if (event === "delta" && typeof data.delta === "string") {
        streamedText += data.delta;
        return;
      }

      if (event === "audio" && typeof data.audio_base64 === "string") {
        const contentType = typeof data.content_type === "string" ? data.content_type : "audio/wav";
        const index = typeof data.index === "number" ? data.index : nextAudioIndex;
        audioChunks.set(index, blobFromBase64(data.audio_base64, contentType));
        void playQueuedAudio();
        return;
      }

      if (event === "audio_end") {
        audioStreamEnded = true;
        void playQueuedAudio();
        return;
      }

      if (event === "result") {
        if (typeof data.transcript === "string") transcript = data.transcript.trim();
        if (typeof data.answer === "string") finalAnswer = data.answer.trim();
        return;
      }

      if (event === "ai_disabled" && typeof data.message === "string") {
        finalAnswer = data.message.trim();
        return;
      }

      if (event === "error") {
        throw new Error(typeof data.message === "string" ? data.message : "음성 처리에 실패했습니다.");
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events.filter(Boolean)) await handleEvent(event);
    }
    buffer += decoder.decode();
    if (buffer.trim()) await handleEvent(buffer);

    if (knowledgeNoticePromise) await knowledgeNoticePromise;
    // audio_end가 없는 경로(에러 등)에서도 재생 대기가 풀리도록 종료를 보장한다.
    audioStreamEnded = true;
    void playQueuedAudio();
    finalizePlaybackIfDone();
    await playbackDone;

    const answer = finalAnswer || streamedText;
    if (!transcript.trim()) throw new Error("음성 인식 결과가 비어 있습니다.");
    if (!answer.trim()) throw new Error("AI 응답이 비어 있습니다.");
    return {
      transcript: transcript.trim(),
      answer: answer.trim(),
      conversationId: streamConversationId ?? conversationIdRef.current,
    };
  };

  const playAudioBlob = async (audioBlob: Blob, turnId?: number) => {
    if (turnId !== undefined && !isCurrentPipelineTurn(turnId)) return;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const audioUrl = URL.createObjectURL(audioBlob);
    audioUrlRef.current = audioUrl;

    if (turnId !== undefined && !isCurrentPipelineTurn(turnId)) return;
    stopRingbackTone();
    const audio = audioElementRef.current ?? document.createElement("audio");
    audioElementRef.current = audio;
    audio.src = audioUrl;
    setPipelineStatus("speaking");
    await audio.play();
    await new Promise<void>((resolve) => {
      // ended/error는 물론, barge-in이 pause()로 끊을 때도 즉시 await를 풀어준다.
      const finish = () => resolve();
      audio.onended = finish;
      audio.onerror = finish;
      audio.onpause = finish;
    });
  };

  const playSpeech = async (
    text: string,
    traceId = "voice_tts",
    traceTitle = "음성 생성",
    options: { turnId?: number; signal?: AbortSignal } = {},
  ) => {
    const stepStartedAt = performance.now();
    onTrace?.({ id: traceId, title: traceTitle, status: "active", detail: "TTS 처리 중" });

    const speechResponse = await fetch(`${API_BASE}/voice/speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: options.signal,
      body: JSON.stringify({
        organization_id: organizationId,
        session_id: sessionIdRef.current,
        channel: "web_call",
        text,
      }),
    });
    if (!speechResponse.ok) throw new Error(`음성 생성 실패 (HTTP ${speechResponse.status})`);
    if (options.turnId !== undefined && !isCurrentPipelineTurn(options.turnId)) return;

    const speechBlob = await speechResponse.blob();
    if (options.turnId !== undefined && !isCurrentPipelineTurn(options.turnId)) return;
    onTrace?.({
      id: traceId,
      title: traceTitle,
      status: "done",
      detail: text,
      items: [text],
      elapsedMs: Math.round(performance.now() - stepStartedAt),
    });

    await playAudioBlob(speechBlob, options.turnId);
  };

  const playOpeningGreeting = async () => {
    try {
      startRingbackTone();
      await playSpeech("안녕하세요. 무엇을 도와드릴까요?", "voice_opening", "상담 시작 안내");
    } catch (greetingError) {
      const message = greetingError instanceof Error ? greetingError.message : "상담 시작 안내 음성 생성 실패";
      setError(message);
      onTrace?.({ id: "voice_opening_failed", title: "상담 시작 안내 실패", status: "warning", detail: message });
    } finally {
      stopRingbackTone();
      if (callStatusRef.current === "active") {
        setPipelineStatus("listening");
        schedulePipelineIdleTimeouts();
      }
    }
  };

  const requestAgentAnswer = async (message: string, signal?: AbortSignal) => {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        organization_id: organizationId,
        session_id: sessionIdRef.current,
        message,
        stream: false,
        channel: "web_call",
      }),
    });

    if (!response.ok) throw new Error(`AI 응답 실패 (HTTP ${response.status})`);
    const data = (await response.json()) as { message?: unknown; conversation_id?: unknown };
    if (typeof data.conversation_id === "string" && data.conversation_id.trim()) {
      publishConversationUpdate(data.conversation_id.trim(), message.trim() || undefined);
    }
    if (typeof data.message !== "string" || !data.message.trim()) {
      throw new Error("AI 응답이 비어 있습니다.");
    }
    return data.message;
  };

  const queryAgent = async (call: RealtimeFunctionCall) => {
    if (handledCallIdsRef.current.has(call.call_id)) return;
    handledCallIdsRef.current.add(call.call_id);

    let message = "";
    try {
      const args = JSON.parse(call.arguments) as { message?: unknown };
      if (typeof args.message === "string") message = args.message.trim();
    } catch {
      // 아래 공통 오류 처리에서 사용자용 안내를 음성으로 반환한다.
    }

    let answer = "죄송합니다. 말씀하신 내용을 이해하지 못했습니다. 다시 말씀해 주세요.";

    if (message) {
      try {
        answer = await requestAgentAnswer(message);
      } catch (requestError) {
        const detail = requestError instanceof Error ? requestError.message : "요청 실패";
        setError(`AI 응답 연결 오류: ${detail}`);
        answer = "죄송합니다. 상담 시스템 연결이 원활하지 않습니다. 잠시 후 다시 말씀해 주세요.";
      }
    }

    sendRealtimeEvent({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify({ answer }),
      },
    });
    sendRealtimeEvent({
      type: "response.create",
      response: {
        tool_choice: "none",
        instructions: "함수 결과의 answer만 자연스러운 한국어 음성으로 읽어라. 내용을 추가하거나 변경하지 마라.",
      },
    });
  };

  const processRecordedAudio = async (audioBlob: Blob, turnId: number, signal: AbortSignal) => {
    if (!isCurrentPipelineTurn(turnId)) return;
    setPipelineStatus("processing");
    setError(null);
    const totalStartedAt = performance.now();

    try {
      onTrace?.({
        id: "voice_audio_prepare",
        title: "음성 업로드 준비",
        status: "done",
        detail: audioUploadLabel(audioBlob),
      });

      const interruptContext = pendingInterruptContextRef.current;
      pendingInterruptContextRef.current = null;
      const { transcript, answer, conversationId } = await requestPipelineTurnStream(audioBlob, turnId, signal, interruptContext);
      if (!isCurrentPipelineTurn(turnId)) return;

      if (conversationId) {
        publishConversationUpdate(conversationId, transcript);
      }

      lastTranscriptRef.current = transcript;
      lastAnswerRef.current = answer;
      onTrace?.({
        id: "voice_answer",
        title: "AI 응답",
        status: "done",
        detail: answer,
        elapsedMs: Math.round(performance.now() - totalStartedAt),
        items: [transcript],
      });

      if (isCurrentPipelineTurn(turnId)) {
        setPipelineStatus("listening");
        schedulePipelineIdleTimeouts();
      }
    } catch (pipelineError) {
      if (pipelineError instanceof DOMException && pipelineError.name === "AbortError") return;
      if (!isCurrentPipelineTurn(turnId)) return;
      const message = pipelineError instanceof Error ? pipelineError.message : "음성 처리에 실패했습니다.";
      setError(message);
      setPipelineStatus(callStatusRef.current === "active" ? "listening" : "idle");
      if (callStatusRef.current === "active") schedulePipelineIdleTimeouts();
      onTrace?.({
        id: "voice_answer",
        title: "AI 응답",
        status: "warning",
        detail: message,
        elapsedMs: Math.round(performance.now() - totalStartedAt),
        items: lastTranscriptRef.current ? [lastTranscriptRef.current] : [],
      });
    }
  };

  const stopPipelineRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    const elapsedMs = performance.now() - recordingStartedAtRef.current;
    const stop = () => {
      stopRecordingTimerRef.current = null;
      if (maxRecordingTimerRef.current !== null) window.clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
      if (recorder.state === "recording") {
        recorder.requestData();
        recorder.stop();
      }
    };

    if (elapsedMs < MIN_RECORDING_MS) {
      stopRecordingTimerRef.current = window.setTimeout(stop, MIN_RECORDING_MS - elapsedMs);
    } else {
      stop();
    }
  };

  const startPipelineRecording = () => {
    clearPipelineIdleTimers();
    const stream = mediaStreamRef.current;
    if (!stream || mediaRecorderRef.current?.state === "recording") return;
    beginPipelineTurn();

    const preferredMimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    const nextRecorder = new MediaRecorder(stream, preferredMimeType ? { mimeType: preferredMimeType } : undefined);
    recordedChunksRef.current = [];
    discardRecordingRef.current = false;
    recordingStartedAtRef.current = performance.now();
    nextRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    nextRecorder.onstop = () => {
      const durationMs = performance.now() - recordingStartedAtRef.current;
      const audioBlob = new Blob(recordedChunksRef.current, {
        type: nextRecorder.mimeType || "audio/webm",
      });
      mediaRecorderRef.current = null;
      recordedChunksRef.current = [];
      silenceStartedAtRef.current = null;
      speechFramesRef.current = 0;
      if (discardRecordingRef.current) return;
      onTrace?.({
        id: "voice_recording",
        title: "마이크 녹음",
        status: audioBlob.size >= MIN_AUDIO_BYTES ? "done" : "warning",
        detail: `${(durationMs / 1000).toFixed(1)}초 · ${Math.round(audioBlob.size / 1024)}KB · ${audioBlob.type}`,
        elapsedMs: Math.round(durationMs),
      });
      const turnId = pipelineTurnIdRef.current;
      const signal = activeTurnAbortControllerRef.current?.signal;
      if (audioBlob.size >= MIN_AUDIO_BYTES && signal) void processRecordedAudio(audioBlob, turnId, signal);
      else {
        setError("녹음된 음성이 너무 짧습니다. 마이크 권한을 확인하고 다시 말씀해 주세요.");
        setPipelineStatus("listening");
        schedulePipelineIdleTimeouts();
      }
    };
    mediaRecorderRef.current = nextRecorder;
    nextRecorder.start(250);
    maxRecordingTimerRef.current = window.setTimeout(stopPipelineRecording, MAX_RECORDING_MS);
    setPipelineStatus("recording");
  };

  const startPipelineVad = async (stream: MediaStream) => {
    if (vadIntervalRef.current !== null) window.clearInterval(vadIntervalRef.current);

    const AudioContextClass = window.AudioContext;
    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    setPipelineStatus("listening");

    const samples = new Uint8Array(analyser.fftSize);
    vadIntervalRef.current = window.setInterval(() => {
      const currentCallStatus = callStatusRef.current;
      const currentPipelineStatus = pipelineStatusRef.current;
      if (currentCallStatus !== "active") return;

      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / samples.length);
      const now = performance.now();

      if (currentPipelineStatus === "listening") {
        if (rms >= VAD_START_THRESHOLD) speechFramesRef.current += 1;
        else speechFramesRef.current = 0;
        if (speechFramesRef.current >= 2) startPipelineRecording();
        return;
      }

      if (currentPipelineStatus === "processing" || currentPipelineStatus === "speaking") {
        if (rms >= BARGE_IN_START_THRESHOLD) bargeInFramesRef.current += 1;
        else bargeInFramesRef.current = 0;
        if (bargeInFramesRef.current >= BARGE_IN_MIN_FRAMES) {
          bargeInFramesRef.current = 0;
          pendingInterruptContextRef.current = JSON.stringify({
            interrupted_status: currentPipelineStatus,
            previous_user_message: lastTranscriptRef.current,
            previous_assistant_answer: lastAnswerRef.current,
          });
          onTrace?.({ id: "voice_barge_in", title: "사용자 끼어들기", status: "active", detail: "이전 응답을 중단하고 새 발화를 듣습니다." });
          startPipelineRecording();
        }
        return;
      }

      if (currentPipelineStatus !== "recording") return;
      if (rms < VAD_STOP_THRESHOLD) {
        silenceStartedAtRef.current ??= now;
        if (now - silenceStartedAtRef.current >= VAD_SILENCE_MS) stopPipelineRecording();
      } else {
        silenceStartedAtRef.current = null;
      }
    }, VAD_INTERVAL_MS);
  };

  const handleRealtimeEvent = (rawEvent: string) => {
    let event: RealtimeResponseDoneEvent | RealtimeErrorEvent | { type?: string };
    try {
      event = JSON.parse(rawEvent);
    } catch {
      return;
    }

    if (event.type === "error") {
      const realtimeError = event as RealtimeErrorEvent;
      setError(realtimeError.error?.message ?? "실시간 음성 처리 오류가 발생했습니다.");
      return;
    }

    if (event.type !== "response.done") return;
    const output = (event as RealtimeResponseDoneEvent).response?.output ?? [];
    output.forEach((item) => {
      if (item.type === "function_call" && "name" in item && item.name === "query_agent") {
        void queryAgent(item as RealtimeFunctionCall);
      }
    });
  };

  const startCall = async () => {
    if (callStatus === "connecting" || callStatus === "active") return;

    releaseCallResources();
    handledCallIdsRef.current.clear();
    conversationIdRef.current = null;
    sessionIdRef.current = `${sessionIdPrefix}${crypto.randomUUID()}`;
    persistCallSession();
    setCallStatus("connecting");
    setCallSeconds(0);
    setError(null);

    try {
      const configParams = new URLSearchParams({ organization_id: organizationId });
      const configResponse = await fetch(`${API_BASE}/voice/config?${configParams}`);
      if (!configResponse.ok) throw new Error(`음성 설정 조회 실패 (HTTP ${configResponse.status})`);
      const voiceConfig = (await configResponse.json()) as { mode?: unknown };
      const configuredMode: VoiceMode = voiceConfig.mode === "realtime" ? "realtime" : "pipeline";
      setVoiceMode(configuredMode);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = mediaStream;

      if (configuredMode === "pipeline") {
        audioElementRef.current = document.createElement("audio");
        setCallStatus("active");
        callStatusRef.current = "active";
        emitCallStartedTrace();
        setPipelineStatus("speaking");
        await startPipelineVad(mediaStream);
        void playOpeningGreeting();
        return;
      }

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElementRef.current = audioElement;
      peerConnection.ontrack = (event) => {
        audioElement.srcObject = event.streams[0];
      };

      mediaStream.getTracks().forEach((track) => peerConnection.addTrack(track, mediaStream));

      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;
      dataChannel.onmessage = (event) => handleRealtimeEvent(String(event.data));
      dataChannel.onerror = () => setError("음성 데이터 채널 오류가 발생했습니다.");

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const params = new URLSearchParams({
        organization_id: organizationId,
        session_id: sessionIdRef.current,
      });
      const response = await fetch(`${API_BASE}/voice/realtime?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      if (!response.ok) throw new Error(`통화 연결 실패 (HTTP ${response.status})`);
      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === "connected") {
          setCallStatus("active");
          emitCallStartedTrace();
        }
        if (["failed", "disconnected", "closed"].includes(peerConnection.connectionState)) {
          emitCallEndedTrace();
          releaseCallResources();
          setCallStatus("ended");
          notifyCallEnded();
        }
      };

      if (peerConnection.connectionState === "connected") {
        setCallStatus("active");
        emitCallStartedTrace();
      }
    } catch (callError) {
      releaseCallResources();
      const message = callError instanceof Error ? callError.message : "통화 연결에 실패했습니다.";
      setError(message);
      setCallStatus("ended");
    }
  };

  const notifyCallEnded = () => {
    fetch(`${API_BASE}/voice/call/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: organizationId,
        session_id: sessionIdRef.current,
      }),
    }).catch(() => {
      // 통화 종료 기록 실패는 사용자 흐름을 막지 않는다. 통화 목록에서
      // call_ended_at이 없는 항목으로 남을 뿐이다.
    });
  };

  const endCall = () => {
    emitCallEndedTrace();
    releaseCallResources();
    setCallStatus("ended");
    notifyCallEnded();
  };

  const isCallRunning = callStatus === "connecting" || callStatus === "active";
  const pipelineStatusLabel = {
    idle: "통화를 시작하면 자동으로 듣습니다.",
    listening: "말씀해 주세요. 음성을 자동으로 감지합니다.",
    recording: "듣고 있습니다. 말을 멈추면 자동으로 처리합니다.",
    processing: "지식과 규칙을 확인하고 있습니다...",
    speaking: "상담원이 답변하고 있습니다.",
  }[pipelineStatus];

  return (
    <div className="relative flex h-full flex-col pb-24">
      {!isCallRunning ? (
        <div className="shrink-0 space-y-3">
          <div className="rounded-[18px] bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white">
                <PhoneIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[14px] font-extrabold text-gray-900">웹 음성 상담 연결</div>
                <div className="mt-0.5 text-[12px] font-bold text-gray-500">마이크를 사용해 AI 상담원과 통화합니다</div>
              </div>
            </div>
          </div>
          {callStatus === "ended" && (
            <div className="rounded-[18px] bg-gray-50 p-4 text-center">
              <div className="text-[14px] font-extrabold text-gray-900">통화가 종료되었습니다</div>
              <div className="mt-1 text-[12px] font-bold text-gray-500">필요하면 다시 연결할 수 있어요.</div>
            </div>
          )}
          {error && (
            <div className="rounded-[14px] bg-red-50 px-3 py-2 text-center text-[11px] font-bold text-red-500">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="shrink-0 rounded-[16px] bg-gray-50 p-3 text-center">
          <div className="text-[12px] font-bold text-gray-400">마이크로 상담원과 통화 중입니다</div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center">
        {isCallRunning ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              {callStatus === "connecting" && <span className="absolute h-full w-full animate-ping rounded-full bg-blue-200 opacity-40" />}
              <UserCircleIcon className="relative h-11 w-11" />
            </div>
            <div className="mt-5 text-[20px] font-extrabold text-gray-900">상담원</div>
            <div className="mt-1 text-[13px] font-bold text-gray-500">
              {callStatus === "connecting" ? "마이크 및 음성 연결 중..." : voiceMode === "pipeline" ? pipelineStatusLabel : "통화 중"}
            </div>
            <div className="mt-3 font-mono text-[28px] font-extrabold text-gray-900">{formatCallDuration(callSeconds)}</div>
            <div className="mt-5 flex h-7 items-center gap-1">
              {[14, 22, 12, 26, 18, 30, 16, 24, 13].map((height, index) => (
                <motion.span
                  key={index}
                  animate={callStatus === "active" ? { height: [height * 0.45, height, height * 0.65] } : { height: 8 }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.07 }}
                  className="w-1 rounded-full bg-blue-400"
                />
              ))}
            </div>
            <div className="mt-4 text-[12px] font-bold leading-relaxed text-gray-400">
              {callStatus === "connecting" ? "브라우저 마이크 권한을 허용해 주세요." : voiceMode === "pipeline" ? "자동 음성 감지 기반 STT → LangGraph → TTS 방식" : "실시간 WebRTC 방식"}
            </div>
          </div>
        ) : null}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-1">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={isCallRunning ? endCall : startCall}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-white ${
              isCallRunning ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <PhoneIcon className={`h-7 w-7 ${isCallRunning ? "rotate-[135deg]" : ""}`} />
          </button>
          <div className="text-[12px] font-extrabold text-gray-500">{isCallRunning ? "통화 끊기" : "통화 시작"}</div>
        </div>
      </div>
    </div>
  );
}
