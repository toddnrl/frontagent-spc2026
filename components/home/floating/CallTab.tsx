"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { getEmbedOrganizationId } from "../../../lib/organization";
import { getAgentApiBaseUrl } from "../../../lib/agentApiBase";
import { loadActiveCallSession, saveCallSession } from "../../../lib/callSessionStorage";
import { ShaderOrb } from "./ShaderOrb";

const API_BASE = getAgentApiBaseUrl();
const ORG_ID = getEmbedOrganizationId();
const ADMIN_MESSAGE_POLL_INTERVAL_MS = 4000;
const MIN_RECORDING_MS = 500;
const MAX_RECORDING_MS = 15000;
const MIN_AUDIO_BYTES = 1024;
const VAD_INTERVAL_MS = 80;
const VAD_START_THRESHOLD = 0.035;
const VAD_STOP_THRESHOLD = 0.02;
// 말이 끝나면 더 빨리 턴을 종료해 즉답 느낌을 준다(너무 짧으면 말 중간 끊김).
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

const orbTransition = {
  layout: { type: "tween" as const, duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
};

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
  isTextMode?: boolean;
  enableSharedLayout?: boolean;
  onTextModeChange?: (enabled: boolean) => void;
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
type TextMessage = {
  id: string;
  role: "user" | "agent" | "admin";
  senderName?: string;
  text: string;
  isPending?: boolean;
};

type ConversationMessageRecord = {
  id: string;
  sender_type: string;
  sender_name?: string | null;
  message: string;
  created_at?: string | null;
};

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

async function fetchConversationMessages(
  conversationId: string,
  organizationId: string,
): Promise<ConversationMessageRecord[]> {
  const params = new URLSearchParams({ organization_id: organizationId });
  const res = await fetch(`${API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

function mapRecordToTextMessage(record: ConversationMessageRecord): TextMessage {
  return {
    id: record.id,
    role: record.sender_type === "customer" ? "user" : record.sender_type === "admin" ? "admin" : "agent",
    senderName: record.sender_type === "admin" ? record.sender_name ?? "상담사" : undefined,
    text: record.message,
  };
}

export function CallTab({
  organizationId = ORG_ID,
  sessionIdPrefix = "web_call_",
  userId = null,
  isTextMode = false,
  enableSharedLayout = true,
  onTextModeChange,
  onTrace,
  onCallDuration,
  onConversationUpdate,
}: CallTabProps = {}) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callSeconds, setCallSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textMessages, setTextMessages] = useState<TextMessage[]>([]);
  const [isSendingText, setIsSendingText] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [isTextCallActive, setIsTextCallActive] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("pipeline");
  const [hasMediaStream, setHasMediaStream] = useState(false);
  const callStatusRef = useRef<CallStatus>("idle");
  const isVoiceCallActiveRef = useRef(false);
  const callSecondsRef = useRef(0);
  const pipelineStatusRef = useRef<PipelineStatus>("idle");
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const handledCallIdsRef = useRef(new Set<string>());
  // AI가 should_end_session을 받았을 때, 마지막 인사 음성이 다 끝날 때까지
  // 끊지 않고 기다리기 위한 플래그. 다음 response.done(음성 출력 완료)에서 소비된다.
  const pendingAgentEndSessionRef = useRef(false);
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
  const callAbortControllerRef = useRef<AbortController | null>(null);
  const textAbortControllerRef = useRef<AbortController | null>(null);
  const holdingMessageIndexRef = useRef(0);
  const pipelineTurnIdRef = useRef(0);
  const activeTurnAbortControllerRef = useRef<AbortController | null>(null);
  const pendingInterruptContextRef = useRef<string | null>(null);
  const lastTranscriptRef = useRef<string | null>(null);
  const lastAnswerRef = useRef<string | null>(null);
  const discardRecordingRef = useRef(false);
  const audioUrlRef = useRef<string | null>(null);
  const sessionIdRef = useRef(`${sessionIdPrefix}${crypto.randomUUID()}`);
  const conversationIdRef = useRef<string | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const setVoiceCallActive = (active: boolean) => {
    isVoiceCallActiveRef.current = active;
    setIsVoiceCallActive(active);
  };

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [textMessages]);

  useEffect(() => {
    const stored = loadActiveCallSession(organizationId, userId);
    if (!stored?.conversationId) return;

    sessionIdRef.current = stored.sessionId;
    conversationIdRef.current = stored.conversationId;

    fetchConversationMessages(stored.conversationId, organizationId)
      .then((records) => {
        records.forEach((record) => seenMessageIdsRef.current.add(record.id));
        setTextMessages(records.map(mapRecordToTextMessage));
        if (records.length > 0) {
          setIsTextCallActive(true);
        }
      })
      .catch(() => {
        // 복원 실패 시 새 상담처럼 빈 화면으로 시작한다.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      if (!conversationIdRef.current) return;
      try {
        const records = await fetchConversationMessages(conversationIdRef.current, organizationId);
        const newAdminRecords = records.filter(
          (record) => record.sender_type === "admin" && !seenMessageIdsRef.current.has(record.id),
        );
        if (newAdminRecords.length === 0) return;
        newAdminRecords.forEach((record) => seenMessageIdsRef.current.add(record.id));
        setTextMessages((messages) => [...messages, ...newAdminRecords.map(mapRecordToTextMessage)]);
      } catch {
        // polling 실패는 조용히 무시한다.
      }
    }, ADMIN_MESSAGE_POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [organizationId]);

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
    if (!isVoiceCallActiveRef.current || callStatus !== "active") return;

    const interval = window.setInterval(() => {
      let nextSeconds = 0;
      setCallSeconds((seconds) => {
        nextSeconds = Math.min(seconds + 1, 59 * 60 + 59);
        return nextSeconds;
      });
      onCallDuration?.(formatCallDuration(nextSeconds), nextSeconds);
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
    if (!isVoiceCallActiveRef.current || callStatusRef.current !== "active") return;
    onTrace?.({
      id: "voice_idle_end",
      title: "무응답 종료",
      status: "warning",
      detail: "일정 시간 사용자 응답이 없어 통화를 종료했습니다.",
    });
    callStatusRef.current = "ended";
    emitCallEndedTrace();
    releaseCallResources();
    setVoiceCallActive(false);
    setCallStatus("ended");
    notifyCallEnded();
  };

  const schedulePipelineIdleTimeouts = () => {
    clearPipelineIdleTimers();
    idleWarningPlayedRef.current = false;
    if (!isVoiceCallActiveRef.current || callStatusRef.current !== "active" || voiceMode !== "pipeline") return;

    idleWarningTimerRef.current = window.setTimeout(() => {
      if (!isVoiceCallActiveRef.current || callStatusRef.current !== "active" || pipelineStatusRef.current !== "listening") return;
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
        if (isVoiceCallActiveRef.current && callStatusRef.current === "active" && pipelineStatusRef.current === "speaking") {
          setPipelineStatus("listening");
        }
      });

      idleEndTimerRef.current = window.setTimeout(endCallByIdleTimeout, IDLE_END_AFTER_WARNING_MS);
    }, IDLE_WARNING_MS);
  };

  const releaseCallResources = () => {
    discardRecordingRef.current = true;
    clearPipelineIdleTimers();
    callAbortControllerRef.current?.abort();
    callAbortControllerRef.current = null;
    textAbortControllerRef.current?.abort();
    textAbortControllerRef.current = null;
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
    setHasMediaStream(false);

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setIsSendingText(false);
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
      if (!isVoiceCallActiveRef.current || callStatusRef.current !== "active") return;
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
    isVoiceCallActiveRef.current && callStatusRef.current === "active" && pipelineTurnIdRef.current === turnId;

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
    onTranscript?: (transcript: string) => void,
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
    // requestPipelineTurnStream은 녹음 종료 이벤트에서만 호출되는 비동기 함수라
    // 렌더 경로에서 실행되지 않는다(react-hooks/purity는 컴포넌트 본문에 정의된
    // 함수를 보수적으로 렌더 가능 경로로 취급해 오탐한다).
    // eslint-disable-next-line react-hooks/purity
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
          onTranscript?.(transcript);
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
    options: { turnId?: number; signal?: AbortSignal; requireActiveCall?: boolean } = {},
  ) => {
    if (options.requireActiveCall && (!isVoiceCallActiveRef.current || callStatusRef.current !== "active")) return;
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
    if (options.requireActiveCall && (!isVoiceCallActiveRef.current || callStatusRef.current !== "active")) return;
    if (options.turnId !== undefined && !isCurrentPipelineTurn(options.turnId)) return;

    const speechBlob = await speechResponse.blob();
    if (options.requireActiveCall && (!isVoiceCallActiveRef.current || callStatusRef.current !== "active")) return;
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
      await playSpeech("안녕하세요. 무엇을 도와드릴까요?", "voice_opening", "상담 시작 안내", {
        signal: callAbortControllerRef.current?.signal,
        requireActiveCall: true,
      });
    } catch (greetingError) {
      if (greetingError instanceof DOMException && greetingError.name === "AbortError") return;
      const message = greetingError instanceof Error ? greetingError.message : "상담 시작 안내 음성 생성 실패";
      setError(message);
      onTrace?.({ id: "voice_opening_failed", title: "상담 시작 안내 실패", status: "warning", detail: message });
    } finally {
      stopRingbackTone();
      if (isVoiceCallActiveRef.current && callStatusRef.current === "active") {
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
    const data = (await response.json()) as {
      message?: unknown;
      conversation_id?: unknown;
      should_end_session?: unknown;
    };
    if (typeof data.conversation_id === "string" && data.conversation_id.trim()) {
      publishConversationUpdate(data.conversation_id.trim(), message.trim() || undefined);
    }
    if (typeof data.message !== "string" || !data.message.trim()) {
      throw new Error("AI 응답이 비어 있습니다.");
    }
    return { answer: data.message, shouldEndSession: data.should_end_session === true };
  };

  // realtime 통화 중 search_knowledge/task_action tool 결과를 받아오는 webhook.
  // /chat(LangGraph 전체)과 달리 search_knowledge는 지식검색만 직접 처리해
  // 더 빠르고, task_action만 LangGraph 전체(예약 등 실제 작업)를 탄다.
  const requestWebCallToolAnswer = async (
    toolName: "search_knowledge" | "task_action",
    message: string,
  ) => {
    const endpoint = toolName === "search_knowledge" ? "search-knowledge" : "task-action";
    const response = await fetch(`${API_BASE}/web-call/realtime/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: organizationId,
        session_id: sessionIdRef.current,
        message,
      }),
    });

    if (!response.ok) throw new Error(`AI 응답 실패 (HTTP ${response.status})`);
    const data = (await response.json()) as {
      answer?: unknown;
      conversation_id?: unknown;
      should_end_session?: unknown;
    };
    if (typeof data.conversation_id === "string" && data.conversation_id.trim()) {
      publishConversationUpdate(data.conversation_id.trim(), message.trim() || undefined);
    }
    if (typeof data.answer !== "string" || !data.answer.trim()) {
      throw new Error("AI 응답이 비어 있습니다.");
    }
    return { answer: data.answer, shouldEndSession: data.should_end_session === true };
  };

  // AI가 통화를 마무리하기로 판단했을 때(should_end_session) 쓰는 종료 경로.
  // 사용자가 버튼으로 끊는 endCall과 달리, 마지막 인사를 끝까지 음성으로
  // 들려준 뒤 끊어야 하므로 호출자가 음성 재생이 끝난 시점에 호출한다.
  const endCallByAgent = () => {
    if (!isVoiceCallActiveRef.current || callStatusRef.current !== "active") return;
    onTrace?.({
      id: "voice_agent_end",
      title: "AI 통화 종료",
      status: "active",
      detail: "AI가 상담을 마무리하여 통화를 종료했습니다.",
    });
    callStatusRef.current = "ended";
    emitCallEndedTrace();
    releaseCallResources();
    setVoiceCallActive(false);
    setCallStatus("ended");
    notifyCallEnded();
  };

  const sendRealtimeEvent = (event: Record<string, unknown>) => {
    const channel = dataChannelRef.current;
    if (!channel || channel.readyState !== "open") return;
    channel.send(JSON.stringify(event));
  };

  const setRealtimeMicrophoneEnabled = (enabled: boolean) => {
    mediaStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  };

  const requestRealtimeResponse = (event: Record<string, unknown> = { type: "response.create" }) => {
    setRealtimeMicrophoneEnabled(false);
    sendRealtimeEvent(event);
  };

  const sendRealtimeTextMessage = (message: string) => {
    // realtime 통화 중 텍스트 입력은 음성 턴과 동일한 data channel로 주입해야
    // 모델이 음성으로 답한다. 별도 REST(/voice/speech)로 합성하면 WebRTC 오디오
    // 트랙을 들고 있는 audioElementRef와 충돌해 소리가 안 나거나 끊긴다.
    sendRealtimeEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: message }],
      },
    });
    requestRealtimeResponse();
  };

  const queryAgent = async (call: RealtimeFunctionCall) => {
    if (handledCallIdsRef.current.has(call.call_id)) return;
    handledCallIdsRef.current.add(call.call_id);
    setPipelineStatus("processing");

    let message = "";
    try {
      const args = JSON.parse(call.arguments) as { message?: unknown };
      if (typeof args.message === "string") message = args.message.trim();
    } catch {
      // 아래 공통 오류 처리에서 사용자용 안내를 음성으로 반환한다.
    }

    let answer = "죄송합니다. 말씀하신 내용을 이해하지 못했습니다. 다시 말씀해 주세요.";
    const toolName = call.name === "search_knowledge" ? "search_knowledge" : "task_action";

    if (message) {
      setTextMessages((messages) => [...messages, { id: `user_${Date.now()}`, role: "user", text: message }]);
      try {
        const result = await requestWebCallToolAnswer(toolName, message);
        answer = result.answer;
        if (result.shouldEndSession) pendingAgentEndSessionRef.current = true;
      } catch (requestError) {
        const detail = requestError instanceof Error ? requestError.message : "요청 실패";
        setError(`AI 응답 연결 오류: ${detail}`);
        answer = "죄송합니다. 상담 시스템 연결이 원활하지 않습니다. 잠시 후 다시 말씀해 주세요.";
      }
    }
    setTextMessages((messages) => [...messages, { id: `agent_${Date.now()}`, role: "agent", text: answer }]);

    sendRealtimeEvent({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify({ answer }),
      },
    });
    requestRealtimeResponse({
      type: "response.create",
      response: {
        tool_choice: "none",
        instructions: "함수 결과의 answer만 자연스러운 한국어 음성으로 읽어라. 내용을 추가하거나 변경하지 마라.",
      },
    });
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
      setRealtimeMicrophoneEnabled(true);
      setError(realtimeError.error?.message ?? "실시간 음성 처리 오류가 발생했습니다.");
      return;
    }

    if (
      event.type === "response.audio.delta" ||
      event.type === "response.audio_transcript.delta" ||
      event.type === "output_audio_buffer.started"
    ) {
      setRealtimeMicrophoneEnabled(false);
      setPipelineStatus("speaking");
      return;
    }

    if (
      event.type === "input_audio_buffer.speech_stopped" ||
      event.type === "conversation.item.input_audio_transcription.completed" ||
      event.type === "response.created" ||
      event.type === "response.output_item.added" ||
      event.type === "response.audio.done" ||
      event.type === "output_audio_buffer.stopped" ||
      event.type === "input_audio_buffer.speech_started"
    ) {
      if (
        event.type === "input_audio_buffer.speech_stopped" ||
        event.type === "conversation.item.input_audio_transcription.completed" ||
        event.type === "response.created" ||
        event.type === "response.output_item.added"
      ) {
        setPipelineStatus("processing");
        return;
      }
      if (event.type !== "input_audio_buffer.speech_started") {
        setRealtimeMicrophoneEnabled(true);
        setPipelineStatus("listening");
      }
    }

    if (event.type !== "response.done") return;
    const output = (event as RealtimeResponseDoneEvent).response?.output ?? [];
    const isWebCallTool = (item: RealtimeFunctionCall | { type: string }) =>
      item.type === "function_call" &&
      "name" in item &&
      (item.name === "search_knowledge" || item.name === "task_action");
    const hasFunctionCall = output.some(isWebCallTool);
    if (hasFunctionCall) {
      output.forEach((item) => {
        if (isWebCallTool(item)) {
          setPipelineStatus("processing");
          void queryAgent(item as RealtimeFunctionCall);
        }
      });
      return;
    }

    // function_call이 없는 response.done은 직전 답변을 음성으로 다 읽은
    // 시점이다 - AI가 종료를 요청했다면 여기서 끊어야 마지막 인사가 잘리지 않는다.
    if (pendingAgentEndSessionRef.current) {
      pendingAgentEndSessionRef.current = false;
      endCallByAgent();
    }
  };

  const sendTextMessage = async () => {
    const message = textInput.trim();
    if (!message || isSendingText) return;
    textAbortControllerRef.current?.abort();
    const textAbortController = new AbortController();
    textAbortControllerRef.current = textAbortController;

    // sendTextMessage는 전송 버튼 클릭 핸들러에서만 호출되어 렌더 경로와 무관하다.
    // eslint-disable-next-line react-hooks/purity
    const agentMessageId = `agent_${Date.now() + 1}`;
    if (callStatusRef.current !== "active" && callStatusRef.current !== "connecting") {
      setCallStatus("active");
      callStatusRef.current = "active";
      setCallSeconds(0);
      setIsTextCallActive(true);
      setVoiceCallActive(false);
      onTrace?.({
        id: "voice_call_start",
        title: "상담 시작",
        status: "done",
        detail: "텍스트 상담이 시작되었습니다.",
      });
      persistCallSession(message);
    }
    onTextModeChange?.(true);
    setTextInput("");
    setError(null);

    if (isVoiceCallActiveRef.current && callStatusRef.current === "active" && voiceMode === "realtime") {
      // realtime 통화 중에는 LangGraph를 직접 부르지 않는다 - 모델이 data
      // channel 메시지를 받아 스스로 search_knowledge/task_action을 호출하고
      // 음성으로 답하며, queryAgent가 사용자/AI 메시지를 textMessages에 직접 기록한다.
      sendRealtimeTextMessage(message);
      return;
    }

    setPipelineStatus("processing");
    setTextMessages((messages) => [
      ...messages,
      { id: `user_${Date.now()}`, role: "user", text: message },
      { id: agentMessageId, role: "agent", text: "", isPending: true },
    ]);
    setIsSendingText(true);

    try {
      const { answer, shouldEndSession } = await requestAgentAnswer(message, textAbortController.signal);
      if (textAbortController.signal.aborted || callStatusRef.current !== "active") return;
      lastAnswerRef.current = answer;
      persistCallSession(answer);

      // 텍스트로 시작한 대화는 음성 합성을 기다리지 않고 즉시 답변을 보여준다.
      setTextMessages((messages) =>
        messages.map((item) => (item.id === agentMessageId ? { ...item, text: answer, isPending: false } : item)),
      );

      if (shouldEndSession) {
        endCallByAgent();
        return;
      }

      if (isVoiceCallActiveRef.current && callStatusRef.current === "active" && mediaStreamRef.current) {
        setPipelineStatus("listening");
        schedulePipelineIdleTimeouts();
      } else if (isVoiceCallActiveRef.current && callStatusRef.current === "active") {
        setPipelineStatus("listening");
      } else {
        setPipelineStatus("idle");
      }
    } catch (textError) {
      if (textAbortController.signal.aborted || callStatusRef.current !== "active") return;
      const messageText = textError instanceof Error ? textError.message : "메시지 전송에 실패했습니다.";
      setError(messageText);
      setPipelineStatus(isVoiceCallActiveRef.current && callStatusRef.current === "active" ? "idle" : pipelineStatusRef.current);
      setTextMessages((messages) =>
        messages.map((item) =>
          item.id === agentMessageId
            ? { ...item, text: `응답을 받지 못했습니다. (${messageText})`, isPending: false }
            : item,
        ),
      );
    } finally {
      if (textAbortControllerRef.current === textAbortController) {
        textAbortControllerRef.current = null;
        setIsSendingText(false);
      }
    }
  };

  const processRecordedAudio = async (audioBlob: Blob, turnId: number, signal: AbortSignal) => {
    if (!isCurrentPipelineTurn(turnId)) return;
    setPipelineStatus("processing");
    setError(null);
    // processRecordedAudio는 MediaRecorder.onstop 콜백에서만 호출되어 렌더 경로와 무관하다.
    // eslint-disable-next-line react-hooks/purity
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
      const { transcript, answer, conversationId } = await requestPipelineTurnStream(
        audioBlob,
        turnId,
        signal,
        interruptContext,
        (liveTranscript) => {
          if (!isCurrentPipelineTurn(turnId)) return;
          setTextMessages((messages) => [
            ...messages,
            { id: `user_${Date.now()}`, role: "user", text: liveTranscript },
          ]);
        },
      );
      if (!isCurrentPipelineTurn(turnId)) return;

      if (conversationId) {
        publishConversationUpdate(conversationId, transcript);
      }

      lastTranscriptRef.current = transcript;
      lastAnswerRef.current = answer;
      setTextMessages((messages) => [...messages, { id: `agent_${Date.now()}`, role: "agent", text: answer }]);
      onTrace?.({
        id: "voice_answer",
        title: "AI 응답",
        status: "done",
        detail: answer,
        // eslint-disable-next-line react-hooks/purity -- processRecordedAudio는 렌더 경로와 무관(위 참고)
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
      setPipelineStatus(isVoiceCallActiveRef.current && callStatusRef.current === "active" ? "listening" : "idle");
      if (isVoiceCallActiveRef.current && callStatusRef.current === "active") schedulePipelineIdleTimeouts();
      onTrace?.({
        id: "voice_answer",
        title: "AI 응답",
        status: "warning",
        detail: message,
        // eslint-disable-next-line react-hooks/purity -- processRecordedAudio는 렌더 경로와 무관(위 참고)
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
    // startPipelineRecording은 VAD 인터벌 콜백에서만 호출되어 렌더 경로와 무관하다.
    // eslint-disable-next-line react-hooks/purity
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
      if (!isVoiceCallActiveRef.current || currentCallStatus !== "active") return;

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

  const startCall = async () => {
    if (isVoiceCallActiveRef.current && (callStatusRef.current === "connecting" || callStatusRef.current === "active")) return;

    releaseCallResources();
    handledCallIdsRef.current.clear();
    const callAbortController = new AbortController();
    callAbortControllerRef.current = callAbortController;
    conversationIdRef.current = null;
    sessionIdRef.current = `${sessionIdPrefix}${crypto.randomUUID()}`;
    persistCallSession();
    setVoiceCallActive(true);
    callStatusRef.current = "connecting";
    setCallStatus("connecting");
    setCallSeconds(0);
    setError(null);

    try {
      const configParams = new URLSearchParams({ organization_id: organizationId });
      const configResponse = await fetch(`${API_BASE}/voice/config?${configParams}`, {
        signal: callAbortController.signal,
      });
      if (!configResponse.ok) throw new Error(`음성 설정 조회 실패 (HTTP ${configResponse.status})`);
      const configData = (await configResponse.json()) as { mode?: string };
      if (callAbortController.signal.aborted) return;
      // 음성 통화는 STT->LLM->TTS pipeline(600~900ms)이 아니라 OpenAI Realtime
      // API(음성<->음성 직결, 250~500ms)를 우선한다. 서버가 조직 설정에 따라
      // mode를 내려주므로 그 값을 그대로 따른다.
      const configuredMode: VoiceMode = configData.mode === "realtime" ? "realtime" : "pipeline";
      setVoiceMode(configuredMode);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = mediaStream;
      setHasMediaStream(true);

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
      dataChannel.onopen = () => {
        if (callStatusRef.current === "connecting") {
          setCallStatus("active");
          callStatusRef.current = "active";
          emitCallStartedTrace();
        }
        // 사용자가 먼저 말하기를 기다리지 않고, 연결되면 상담원처럼 먼저 인사한다.
        // tool_choice: none으로 보내 인사 turn에는 search_knowledge/task_action이
        // 호출되지 않게 한다.
        requestRealtimeResponse({
          type: "response.create",
          response: {
            tool_choice: "none",
            instructions: "통화가 막 연결됐다. \"안녕하세요. 무엇을 도와드릴까요?\" 같은 짧은 인사를 먼저 건네라.",
          },
        });
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const realtimeParams = new URLSearchParams({
        organization_id: organizationId,
        session_id: sessionIdRef.current,
      });
      const realtimeResponse = await fetch(`${API_BASE}/web-call/realtime?${realtimeParams}`, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        signal: callAbortController.signal,
        body: offer.sdp,
      });

      if (!realtimeResponse.ok) throw new Error(`통화 연결 실패 (HTTP ${realtimeResponse.status})`);
      const answerSdp = await realtimeResponse.text();
      await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === "connected") {
          if (callStatusRef.current === "active") return;
          setCallStatus("active");
          callStatusRef.current = "active";
          emitCallStartedTrace();
        }
        if (["failed", "closed"].includes(peerConnection.connectionState)) {
          if (callStatusRef.current === "ended") return;
          callStatusRef.current = "ended";
          emitCallEndedTrace();
          releaseCallResources();
          setVoiceCallActive(false);
          setCallStatus("ended");
          notifyCallEnded();
        }
      };

      if (peerConnection.connectionState === "connected") {
        setCallStatus("active");
        callStatusRef.current = "active";
        emitCallStartedTrace();
      }
    } catch (callError) {
      if (callError instanceof DOMException && callError.name === "AbortError") return;
      releaseCallResources();
      setVoiceCallActive(false);
      callStatusRef.current = "ended";
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
    if (callStatusRef.current !== "active" && callStatusRef.current !== "connecting") return;
    callStatusRef.current = "ended";
    emitCallEndedTrace();
    releaseCallResources();
    setVoiceCallActive(false);
    setIsTextCallActive(false);
    setCallStatus("ended");
    notifyCallEnded();
  };

  const isCallRunning = isVoiceCallActive && (callStatus === "connecting" || callStatus === "active");
  const pipelineStatusLabels = {
    idle: "듣는 중입니다...",
    listening: isTextCallActive && !hasMediaStream ? "텍스트 입력을 기다리는 중입니다..." : "듣는 중입니다...",
    recording: "듣는 중입니다...",
    processing: "생각하는 중입니다...",
    speaking: "말하는 중입니다...",
  };
  const pipelineStatusLabel = pipelineStatusLabels[pipelineStatus];
  const isSpeaking = isVoiceCallActive && callStatus === "active" && pipelineStatus === "speaking";
  const voiceStatusLabel = isCallRunning
    ? callStatus === "connecting"
      ? "연결 중입니다..."
      : pipelineStatusLabel
    : "통화를 시작하거나 아래에 메시지를 입력할 수 있습니다.";
  const composer = (
    <div className="absolute bottom-0 left-0 right-0 px-1 pb-1">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-5 pr-2 shadow-[0_8px_24px_rgb(0,0,0,0.08)] transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
        <input
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) void sendTextMessage();
          }}
          placeholder="또는 메시지 보내기..."
          className="min-w-0 flex-1 bg-transparent py-2 text-[14px] font-bold text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => void sendTextMessage()}
          disabled={!textInput.trim() || isSendingText}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-300"
          aria-label="메시지 전송"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
        {isCallRunning && (
          <button
            onClick={endCall}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="통화 끊기"
          >
            <PhoneIcon className="h-5 w-5 rotate-[135deg]" />
          </button>
        )}
      </div>
    </div>
  );

  const renderTextMessage = (message: TextMessage) => (
    <div
      key={message.id}
      className={`flex max-w-[86%] flex-col ${message.role === "user" ? "ml-auto items-end" : "items-start"}`}
    >
      {message.role === "admin" && (
        <div className="mb-1 px-1 text-[11px] font-extrabold text-emerald-600">
          {message.senderName ?? "상담사"}
        </div>
      )}
      <div
        className={`whitespace-pre-line rounded-[16px] px-3 py-2 text-[13px] font-bold leading-relaxed ${
          message.role === "user"
            ? "rounded-br-[4px] bg-blue-500 text-white"
            : message.role === "admin"
              ? "rounded-bl-[4px] bg-emerald-50 text-emerald-900"
              : "rounded-bl-[4px] bg-gray-100 text-gray-800"
        }`}
      >
        {message.isPending ? (
          <span className="flex items-center gap-1 py-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
          </span>
        ) : (
          message.text
        )}
      </div>
    </div>
  );

  const conversationView = (
    <div className="relative flex h-full flex-col pb-20">
      <div ref={messageListRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-1 py-2">
        {textMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-8 text-center text-[12px] font-bold leading-relaxed text-gray-400">
            메시지를 입력하면 텍스트 상담이 시작됩니다.
          </div>
        ) : (
          textMessages.map(renderTextMessage)
        )}
      </div>

      {composer}
    </div>
  );

  const voiceView = (
    <div className="relative flex h-full flex-col pb-20">
      {!isCallRunning ? (
        <div className="shrink-0 space-y-3">
          {error && (
            <div className="rounded-[14px] bg-red-50 px-3 py-2 text-center text-[11px] font-bold text-red-500">
              {error}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 items-center justify-center px-2 py-4">
        <div className="flex w-full flex-col items-center text-center">
          <motion.div
            layoutId={enableSharedLayout ? "floating-call-orb" : undefined}
            transition={orbTransition}
            onClick={isCallRunning ? undefined : startCall}
            className={`relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-[#40c9f4] shadow-[0_22px_56px_rgb(14,165,233,0.3)] ${
              isCallRunning ? "" : "cursor-pointer hover:scale-[1.02]"
            }`}
            role={isCallRunning ? undefined : "button"}
            tabIndex={isCallRunning ? undefined : 0}
            aria-label={isCallRunning ? undefined : "통화 시작"}
            onKeyDown={(event) => {
              if (isCallRunning) return;
              if (event.key === "Enter" || event.key === " ") startCall();
            }}
          >
            <ShaderOrb active={isSpeaking} />
            <span
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.18] mix-blend-soft-light [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.85)_1px,transparent_0)] [background-size:4px_4px]"
            />
            <span className="absolute inset-0 bg-white/5" />
            {callStatus === "connecting" && (
              <span className="absolute h-20 w-20 animate-ping rounded-full bg-white/45" />
            )}
            {!isCallRunning && (
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-950 shadow-[0_10px_28px_rgb(0,0,0,0.12)] transition-colors">
                <PhoneIcon className="h-7 w-7" />
              </span>
            )}
          </motion.div>
          <div className="mt-8 flex min-h-[36px] max-w-[300px] items-center justify-center text-[12px] font-bold leading-relaxed text-gray-400">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={voiceStatusLabel}
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {voiceStatusLabel}
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence initial={false}>
            {isCallRunning && (
              <motion.div
                key="call-duration"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mt-3 font-mono text-[18px] font-extrabold text-gray-700"
              >
                {formatCallDuration(callSeconds)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {composer}
    </div>
  );

  return isTextMode ? conversationView : voiceView;
}
