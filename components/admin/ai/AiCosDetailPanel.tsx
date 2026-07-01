"use client";

import {
  Activity,
  ArrowUp,
  Bot,
  CheckCircle2,
  Clock,
  Database,
  GitBranch,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import type { FormEvent, ReactNode } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { loadActiveCallSession } from "../../../lib/callSessionStorage";
import { getAgentApiBaseUrl } from "../../../lib/agentApiBase";
import { mapConversationMessagesToVoiceLog } from "../../../lib/voiceLogFromMessages";
import { fetchConversationMessages } from "./conversationsApi";
import { CallTab } from "../../home/floating/CallTab";
import type { VoiceTraceEvent } from "../../home/floating/CallTab";
import { TraceGraph } from "./TraceGraph";
import type { TraceStep } from "./TraceGraph";
import type { AiCosSection } from "./types";

const taskItems = [
  {
    id: "appointment-change",
    name: "예약 변경",
    successRate: "93%",
  },
  {
    id: "refund-request",
    name: "환불 접수",
    successRate: "86%",
  },
  {
    id: "handoff-agent",
    name: "상담원 연결",
    successRate: "98%",
  },
];

const agentRuns = [
  { id: "run-1842", intent: "예약 변경", status: "성공" },
  { id: "run-1841", intent: "환불 문의", status: "확인필요" },
  { id: "run-1840", intent: "가격 문의", status: "성공" },
];

export function AiCosDetailPanel({
  activeSection,
  organizationId,
  user = null,
}: {
  activeSection: AiCosSection;
  organizationId: string;
  user?: User | null;
}) {
  if (activeSection === "rules" || activeSection === "knowledge") {
    return (
      <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] bg-white px-5 py-6">
        <DetailHeader activeSection={activeSection} />
        <AiPreviewChat key={organizationId} organizationId={organizationId} user={user} />
      </aside>
    );
  }

  return (
    <aside className="min-h-0 min-w-0 overflow-y-auto rounded-[20px] bg-white px-5 py-6">
      <DetailHeader activeSection={activeSection} />
      {activeSection === "test" && <TestDetail />}
      {activeSection === "overview" && <OverviewDetail />}
      {activeSection === "tasks" && <TasksDetail />}
      {activeSection === "logs" && <LogsDetail />}
      {activeSection === "monitoring" && <MonitoringDetail />}
      {activeSection === "status" && <StatusDetail />}
      {activeSection === "docs" && <DocsDetail />}
      {activeSection === "settings" && <SettingsDetail />}
    </aside>
  );
}

function DetailHeader({ activeSection }: { activeSection: AiCosSection }) {
  if (activeSection === "rules" || activeSection === "knowledge") {
    return (
      <div className="mb-7">
        <h2 className="text-[24px] font-bold">미리보기</h2>
      </div>
    );
  }

  const titleMap: Record<AiCosSection, string> = {
    test: "테스트 상세",
    overview: "운영 상태",
    knowledge: "지식 상세",
    rules: "규칙 상세",
    tasks: "태스크 상세",
    logs: "Agent Runs",
    monitoring: "API 분석",
    status: "상태 점검",
    docs: "개발 문서",
    settings: "Agent 프로필",
  };

  return (
    <div className="mb-7">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#f2f2f2]">
        <Sparkles className="h-5 w-5 text-blue-500" />
      </div>
      <h2 className="text-[24px] font-bold">{titleMap[activeSection]}</h2>
      <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-500">
        선택한 AI CoS 화면의 주요 상태와 다음 작업을 확인합니다.
      </p>
    </div>
  );
}

function TestDetail() {
  return (
    <>
      <DetailBlock title="테스트 입력">
        <MetricRow label="Intent" value="reservation" />
        <MetricRow label="Expected Task" value="check_available_slots" />
        <MetricRow label="Trace 저장" value="켜짐" />
      </DetailBlock>
      <DetailBlock title="검증 기준">
        <ChecklistItem text="Router가 intent를 올바르게 분류" />
        <ChecklistItem text="규칙이 지식보다 먼저 적용" />
        <ChecklistItem text="태스크 실행 조건과 제외 조건 확인" />
      </DetailBlock>
    </>
  );
}

function OverviewDetail() {
  return (
    <>
      <DetailBlock title="오늘 요약">
        <MetricRow label="처리 상담" value="237건" />
        <MetricRow label="자동 해결" value="218건" />
        <MetricRow label="상담원 전환" value="19건" />
        <MetricRow label="평균 지연" value="1.18s" />
      </DetailBlock>
      <DetailBlock title="현재 파이프라인">
        <TimelineItem icon={<Database className="h-4 w-4" />} title="Redis Session" text="상담 상태 정상 저장" />
        <TimelineItem icon={<ShieldCheck className="h-4 w-4" />} title="Rule Engine" text="12개 규칙 적용 가능" />
        <TimelineItem icon={<GitBranch className="h-4 w-4" />} title="Task Workflow" text="8개 태스크 활성" />
      </DetailBlock>
    </>
  );
}

function AiPreviewChat({
  organizationId,
  user = null,
}: {
  organizationId: string;
  user?: User | null;
}) {
  type LogEntry = {
    id: number;
    from: "customer" | "agent";
    text: string;
    time: string;
    matchedRules: boolean;
    meta?: string;
    resultIntent?: string;
    traceSteps?: TraceStep[];
  };
  type ChatResponse = {
    intent: string;
    message: string | null;
    applied_rules: RuleTraceItem[];
    used_knowledge: Array<Record<string, unknown>>;
    knowledge_context: Array<Record<string, unknown>>;
  };

  const [activeTab, setActiveTab] = useState<"customer" | "log">("customer");
  const [previewChannel, setPreviewChannel] = useState<"chat" | "call">("chat");
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [voiceLog, setVoiceLog] = useState<LogEntry[]>([]);
  const [callDurationLabel, setCallDurationLabel] = useState<string | null>(null);
  const [syncedConversationId, setSyncedConversationId] = useState<string | null>(null);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const logScrollRef = useRef<HTMLDivElement>(null);
  const [initialSessionId] = useState(() => `rule_preview_${Date.now()}`);
  const sessionIdRef = useRef<string>(initialSessionId);
  const conversationIdRef = useRef<string | null>(null);
  const customerTraceStepsRef = useRef<TraceStep[][]>([]);
  const userId = user?.id ?? null;
  const voiceTurnRef = useRef<{
    customerEntryId: number;
    agentEntryId: number;
    traceSteps: TraceStep[];
    previousStepAt: number;
  } | null>(null);
  const updateLogEntry = (entries: LogEntry[], id: number, patch: Partial<LogEntry>) =>
    entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));

  const refreshVoiceLogFromServer = useCallback(
    async (conversationId?: string | null) => {
      const targetConversationId = conversationId ?? conversationIdRef.current;
      if (!targetConversationId) return;

      try {
        const messages = await fetchConversationMessages(organizationId, targetConversationId);
        conversationIdRef.current = targetConversationId;
        setSyncedConversationId(targetConversationId);
        setVoiceLog(
          mapConversationMessagesToVoiceLog(messages, customerTraceStepsRef.current),
        );
      } catch {
        // 서버 동기화 실패 시 메모리 로그를 유지한다.
      }
    },
    [organizationId],
  );

  const handleConversationUpdate = useCallback(
    (payload: { conversationId: string | null; sessionId: string }) => {
      if (!payload.conversationId) return;
      conversationIdRef.current = payload.conversationId;
      setSyncedConversationId(payload.conversationId);
      void refreshVoiceLogFromServer(payload.conversationId);
    },
    [refreshVoiceLogFromServer],
  );

  useEffect(() => {
    const activeSession = loadActiveCallSession(organizationId, userId);
    if (!activeSession?.conversationId) return;
    conversationIdRef.current = activeSession.conversationId;
    void refreshVoiceLogFromServer(activeSession.conversationId);
  }, [organizationId, userId, refreshVoiceLogFromServer]);

  const applyVoiceTraceStep = (
    current: TraceStep[],
    event: VoiceTraceEvent,
    previousStepAt: number,
  ): { steps: TraceStep[]; previousStepAt: number } => {
    const now = Date.now();
    const stepElapsedMs = Math.round(event.elapsedMs ?? Math.max(0, now - previousStepAt));
    const resolveActiveStatus = event.status === "warning" ? ("warning" as const) : ("done" as const);
    const existing = current.find((step) => step.id === event.id);

    let nextSteps: TraceStep[];

    if (existing) {
      nextSteps = current.map((step) =>
        step.id === event.id
          ? {
              ...step,
              title: event.title,
              status: event.status,
              detail: event.detail || step.detail,
              items: event.items ?? step.items,
              elapsedMs: event.elapsedMs !== undefined ? Math.round(event.elapsedMs) : step.elapsedMs ?? stepElapsedMs,
            }
          : step.status === "active" && step.id !== event.id
            ? { ...step, status: resolveActiveStatus }
            : step,
      );
    } else {
      nextSteps = [
        ...current.map((step) =>
          step.status === "active" ? { ...step, status: resolveActiveStatus } : step,
        ),
        {
          id: event.id,
          title: event.title,
          status: event.status,
          detail: event.detail,
          items: event.items,
          startedAt: now - stepElapsedMs,
          elapsedMs: stepElapsedMs,
        },
      ];
    }

    return {
      steps: normalizeVoiceTraceSteps(nextSteps),
      previousStepAt: event.elapsedMs !== undefined ? now : previousStepAt,
    };
  };

  const startVoiceTurn = () => {
    if (voiceTurnRef.current) return;

    const customerEntryId = Date.now();
    const agentEntryId = customerEntryId + 1;
    voiceTurnRef.current = {
      customerEntryId,
      agentEntryId,
      traceSteps: [],
      previousStepAt: customerEntryId,
    };

    setVoiceLog((current) => [
      ...current,
      {
        id: customerEntryId,
        from: "customer",
        text: "음성 인식 중...",
        time: formatChatTime(customerEntryId),
        matchedRules: false,
        traceSteps: [],
      },
      {
        id: agentEntryId,
        from: "agent",
        text: "처리중...",
        time: formatChatTime(customerEntryId),
        matchedRules: false,
        meta: "streaming",
      },
    ]);
  };

  const handleVoiceTrace = (event: VoiceTraceEvent) => {
    if (event.id === "voice_call_start") {
      customerTraceStepsRef.current = [];
      voiceTurnRef.current = null;
      setVoiceLog([]);
      setCallDurationLabel(null);
      return;
    }

    if (event.id === "voice_call_end") {
      setCallDurationLabel(event.detail);
      setVoiceLog((current) => [
        ...current,
        {
          id: Date.now(),
          from: "agent",
          text: "통화가 종료되었습니다.",
          time: formatChatTime(),
          matchedRules: false,
          meta: event.elapsedMs ? `통화 시간 · ${formatElapsed(event.elapsedMs)}` : event.detail,
        },
      ]);
      voiceTurnRef.current = null;
      return;
    }

    if (event.id === "voice_opening" && event.status === "done") {
      const greeting =
        typeof event.items?.[0] === "string"
          ? event.items[0]
          : "안녕하세요. 무엇을 도와드릴까요?";
      setVoiceLog((current) => [
        ...current,
        {
          id: Date.now(),
          from: "agent",
          text: greeting,
          time: formatChatTime(),
          matchedRules: false,
          meta: event.elapsedMs ? formatElapsed(event.elapsedMs) : undefined,
          traceSteps: [
            {
              id: event.id,
              title: event.title,
              status: "done",
              detail: event.detail,
              items: event.items,
              elapsedMs: event.elapsedMs,
            },
          ],
        },
      ]);
      return;
    }

    const lifecycleEventIds = new Set([
      "voice_call_start",
      "voice_call_end",
      "voice_opening",
      "voice_opening_failed",
    ]);

    if (event.id === "voice_recording" && event.status === "done") {
      startVoiceTurn();
    }

    if (event.id === "voice_failed") {
      setVoiceLog((current) => {
        const lastCustomer = [...current].reverse().find((entry) => entry.from === "customer");
        if (!lastCustomer || lastCustomer.traceSteps?.some((step) => step.id === "voice_failed")) {
          return current;
        }
        return updateLogEntry(current, lastCustomer.id, {
          traceSteps: normalizeVoiceTraceSteps([
            ...(lastCustomer.traceSteps ?? []),
            {
              id: event.id,
              title: event.title,
              status: "warning",
              detail: event.detail,
            },
          ]),
        });
      });
      return;
    }

    if (event.id === "voice_answer_preview" && voiceTurnRef.current) {
      // 답변 텍스트가 정해진 즉시(TTS 재생 전) agent 메시지를 채운다 - AI가
      // 말하는 동안에도 trace 패널에 응답 내용이 비어 보이지 않게 한다.
      const turn = voiceTurnRef.current;
      setVoiceLog((current) =>
        updateLogEntry(current, turn.agentEntryId, { text: event.detail }),
      );
      return;
    }

    if (voiceTurnRef.current && !lifecycleEventIds.has(event.id) && event.id !== "voice_answer") {
      const turn = voiceTurnRef.current;
      const { steps, previousStepAt } = applyVoiceTraceStep(turn.traceSteps, event, turn.previousStepAt);
      voiceTurnRef.current = { ...turn, traceSteps: steps, previousStepAt };

      setVoiceLog((current) =>
        updateLogEntry(current, turn.customerEntryId, {
          traceSteps: steps,
          ...(event.id === "voice_stt" && event.detail ? { text: event.detail } : {}),
          ...(event.id === "voice_recording" && event.elapsedMs
            ? { meta: `녹음 ${formatElapsed(event.elapsedMs)}` }
            : {}),
        }),
      );
    }

    if (
      event.id === "voice_answer" &&
      (event.status === "done" || event.status === "warning") &&
      voiceTurnRef.current
    ) {
      const turn = voiceTurnRef.current;
      const { steps } = applyVoiceTraceStep(turn.traceSteps, event, turn.previousStepAt);
      const transcript = typeof event.items?.[0] === "string" ? event.items[0] : "";
      const answer =
        event.status === "warning"
          ? "응답 생성에 실패했습니다. 잠시 후 다시 말씀해 주세요."
          : event.detail;
      const totalMeta = event.elapsedMs ? formatElapsed(event.elapsedMs) : undefined;

      setVoiceLog((current) => {
        const customerText =
          transcript ||
          current.find((entry) => entry.id === turn.customerEntryId)?.text ||
          "(인식 실패)";
        let next = updateLogEntry(current, turn.customerEntryId, {
          text: customerText,
          traceSteps: steps,
        });
        next = updateLogEntry(next, turn.agentEntryId, {
          text: answer,
          time: formatChatTime(),
          meta:
            event.status === "warning"
              ? `실패 · ${event.detail}`
              : totalMeta,
        });
        return next;
      });
      customerTraceStepsRef.current.push(steps);
      voiceTurnRef.current = null;
      if (conversationIdRef.current) {
        void refreshVoiceLogFromServer();
      }
    }
  };

  const handleCallDuration = (label: string) => {
    setCallDurationLabel(`통화 시간 ${label}`);
  };

  useEffect(() => {
    if (activeTab !== "customer") return;
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeTab, previewChannel, log]);

  useEffect(() => {
    if (activeTab !== "log") return;
    const el = logScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeTab, previewChannel, log, voiceLog, traceSteps]);

  const handleSend = async (message: string) => {
    const text = message.trim();
    if (!text || isSending) return;

    const responseEntryId = Date.now();
    let previousStepAt = responseEntryId;
    const sentTime = formatChatTime(responseEntryId);
    const pendingTraceSteps: TraceStep[] = [
      {
        id: "request",
        title: "요청 수신",
        status: "done",
        detail: `organization=${organizationId}`,
        items: [text],
        startedAt: responseEntryId,
        elapsedMs: 0,
      },
    ];
    const customerEntry = {
      id: responseEntryId - 1,
      from: "customer" as const,
      text,
      time: sentTime,
      matchedRules: false,
      traceSteps: pendingTraceSteps,
    };
    const thinkingEntry = {
      id: responseEntryId,
      from: "agent" as const,
      text: "생각중...",
      time: sentTime,
      matchedRules: false,
      meta: "streaming 준비중",
    };
    setLog((current) => [...current, customerEntry, thinkingEntry]);
    setInput("");
    setIsSending(true);
    setError(null);
    setTraceSteps(pendingTraceSteps);

    try {
      let streamedText = "";
      const result = await runRulePreviewChat(text, organizationId, sessionIdRef.current, {
        onStart: () => {
          setLog((current) =>
            updateLogEntry(current, responseEntryId, {
              text: "응답 작성중...",
              meta: "streaming",
            }),
          );
        },
        onDelta: (delta) => {
          streamedText += delta;
          setLog((current) =>
            updateLogEntry(current, responseEntryId, {
              text: streamedText || "응답 작성중...",
              meta: "streaming",
            }),
          );
        },
        onTraceStep: (stepId: string, status: "active" | "done" | "warning", detail: string, items: unknown[]) => {
          const stepTitles: Record<string, string> = {
            connected: "WebSocket 연결",
            received: "메시지 수신",
            conversation: "대화 세션",
            decision: "의도 분석",
            intent: "의도 분석",
            knowledge: "지식 검색",
            rule: "규칙 평가",
            rules: "규칙 평가",
            response: "응답 생성",
            final: "최종 응답 메타",
            done: "처리 완료",
          };
          const title = stepTitles[stepId] ?? stepId;
          const now = Date.now();
          const stepElapsedMs = now - previousStepAt;
          previousStepAt = now;

          const applyStep = (current: TraceStep[]): TraceStep[] => {
            const existing = current.find((s: TraceStep) => s.id === stepId);
            if (existing) {
              return current.map((s: TraceStep) =>
                s.id === stepId ? { ...s, status, detail, items, elapsedMs: stepElapsedMs } : s,
              );
            }
            return [
              ...current.map((s: TraceStep) => (s.status === "active" ? { ...s, status: "done" as const } : s)),
              { id: stepId, title, status, detail, items, startedAt: now - stepElapsedMs, elapsedMs: stepElapsedMs },
            ];
          };

          setTraceSteps(applyStep);
          setLog((entries: LogEntry[]) =>
            updateLogEntry(entries, responseEntryId - 1, {
              traceSteps: applyStep(
                entries.find((e) => e.id === responseEntryId - 1)?.traceSteps ?? [],
              ),
            }),
          );
        },
      });
      setLastResult(result);
      const totalElapsedMs = Date.now() - responseEntryId;
      const hasMatchedRules = getRuleNames(result.applied_rules).length > 0;
      // 실시간 trace steps 그대로 유지 — log entry에 최종 intent만 반영
      setLog((entries: LogEntry[]) =>
        updateLogEntry(entries, responseEntryId - 1, {
          resultIntent: result.intent,
        }),
      );
      setLog((current) =>
        updateLogEntry(current, responseEntryId, {
          text: result.message ?? "AI 자동응답이 꺼져 있어 관리자 응답을 기다립니다.",
          time: formatChatTime(),
          matchedRules: hasMatchedRules,
          meta: `intent=${result.intent} · rules=${result.applied_rules.length} · ${formatElapsed(totalElapsedMs)}`,
        }),
      );
    } catch (previewError) {
      const message = previewError instanceof Error ? previewError.message : "테스트 실패";
      const totalElapsedMs = Date.now() - responseEntryId;
      setError(message);
      setTraceSteps([
        {
          id: "request",
          title: "요청 수신",
          status: "done",
          detail: `organization=${organizationId}`,
          items: [text],
        },
        { id: "failed", title: "API 호출 실패", status: "warning", detail: message },
      ]);
      setLog((current) =>
        updateLogEntry(current, responseEntryId - 1, {
          traceSteps: [
            {
              id: "request",
              title: "요청 수신",
              status: "done",
              detail: `organization=${organizationId}`,
              items: [text],
            },
            { id: "failed", title: "API 호출 실패", status: "warning", detail: message },
          ],
        }),
      );
      setLog((current) =>
        updateLogEntry(current, responseEntryId, {
          text: `실제 /chat API 호출 실패: ${message}`,
          time: formatChatTime(),
          matchedRules: false,
          meta: `실패 · ${formatElapsed(totalElapsedMs)}`,
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isComposing) return;

    const formData = new FormData(event.currentTarget);
    const text = String(formData.get("message") ?? "");
    if (!text.trim() || isSending) return;

    setInput("");
    void handleSend(text);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center gap-1 rounded-full bg-[#f2f2f2] p-1">
        <button
          onClick={() => setActiveTab("customer")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition-colors ${
            activeTab === "customer" ? "bg-white shadow-sm" : "text-gray-400"
          }`}
        >
          <Bot className="h-4 w-4" />
          고객 화면
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition-colors ${
            activeTab === "log" ? "bg-white shadow-sm" : "text-gray-400"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          대화 로그
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-1 rounded-[12px] border border-gray-100 p-1">
        <button
          type="button"
          onClick={() => setPreviewChannel("chat")}
          className={`rounded-[9px] px-3 py-2 text-[11px] font-extrabold ${previewChannel === "chat" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
        >
          채팅 {activeTab === "customer" ? "테스트" : "로그"}
        </button>
        <button
          type="button"
          onClick={() => setPreviewChannel("call")}
          className={`flex items-center justify-center gap-1 rounded-[9px] px-3 py-2 text-[11px] font-extrabold ${previewChannel === "call" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
        >
          <PhoneCall className="h-3.5 w-3.5" /> 통화 {activeTab === "customer" ? "테스트" : "로그"}
        </button>
      </div>

      <div
        className={
          activeTab === "customer" && previewChannel === "call"
            ? "min-h-0 flex-1 overflow-y-auto"
            : "hidden"
        }
      >
        <CallTab
          organizationId={organizationId}
          sessionIdPrefix="rule_preview_call_"
          userId={userId}
          onTrace={handleVoiceTrace}
          onCallDuration={handleCallDuration}
          onConversationUpdate={handleConversationUpdate}
        />
      </div>

      {activeTab === "customer" ? (
        previewChannel === "call" ? (
          null
        ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={chatScrollRef} className="flex-1 space-y-2 overflow-y-auto px-1 py-2">
            {log.length === 0 ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="mt-3 text-[15px] font-extrabold text-gray-900">
                  메시지를 입력해보세요
                </div>
                <div className="mt-1 text-[12px] font-bold leading-relaxed text-gray-400">
                  실제 응답과 처리 로그를 함께 확인합니다.
                </div>
              </div>
            ) : (
              log.map((entry) =>
                entry.from === "customer" ? (
                  <div
                    key={entry.id}
                    className="ml-auto flex max-w-[86%] flex-col items-end"
                  >
                    <div className="whitespace-pre-line rounded-[16px] rounded-br-[4px] bg-blue-500 px-3 py-2 text-[13px] font-bold leading-relaxed text-white">
                      {entry.text}
                    </div>
                    <div className="mt-1 px-1 text-[10px] font-bold text-gray-400">{entry.time}</div>
                  </div>
                ) : (
                  <div
                    key={entry.id}
                    className="flex max-w-[86%] flex-col items-start"
                  >
                    {isThinkingMessage(entry) ? (
                      <div className="flex items-center gap-1 rounded-[16px] rounded-bl-[4px] bg-gray-100 px-3 py-3">
                        {[0, 1, 2].map((dot) => (
                          <motion.span
                            key={dot}
                            animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.14 }}
                            className="h-1.5 w-1.5 rounded-full bg-gray-400"
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`whitespace-pre-line rounded-[16px] rounded-bl-[4px] px-3 py-2 text-[13px] font-bold leading-relaxed ${
                          entry.matchedRules ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {entry.text}
                      </div>
                    )}
                    <div className="mt-1 px-1 text-[10px] font-bold text-gray-400">{entry.time}</div>
                  </div>
                ),
              )
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-3 flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm"
          >
            <input
              name="message"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={(event) => {
                setIsComposing(false);
                setInput(event.currentTarget.value);
              }}
              placeholder="메시지를 입력하세요"
              className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              aria-label="전송"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
          {error && (
            <p className="mt-2 line-clamp-2 text-[12px] font-semibold text-amber-600">
              {error}
            </p>
          )}
        </div>
        )
      ) : previewChannel === "call" ? (
        <div ref={logScrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {callDurationLabel && (
            <div className="rounded-[12px] bg-blue-50 px-3 py-2 text-center text-[11px] font-bold text-blue-600">
              {callDurationLabel}
            </div>
          )}
          {syncedConversationId && (
            <p className="px-1 text-[10px] font-bold text-gray-400">
              {userId
                ? "로그인한 계정 기준으로 저장된 미리보기 통화입니다."
                : "이 브라우저에 저장된 미리보기 통화입니다."}
            </p>
          )}
          {voiceLog.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-gray-200 px-4 py-8 text-center">
              <p className="text-[13px] font-bold text-gray-400">
                통화 테스트를 시작하면 말한 내용과 AI 처리 로그가 순서대로 표시됩니다.
              </p>
            </div>
          ) : (
            <PreviewConversationLog entries={voiceLog} />
          )}
        </div>
      ) : (
        <div ref={logScrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {log.length === 0 && (
            <div className="rounded-[14px] border border-dashed border-gray-200 px-4 py-8 text-center">
              <p className="text-[13px] font-bold text-gray-400">
                메시지를 보내면 실제 대화 사이에 AI 처리 로그가 순서대로 표시됩니다.
              </p>
            </div>
          )}

          {log.length > 0 && <PreviewConversationLog entries={log} />}
        </div>
      )}
    </div>
  );
}


function parseStreamingEvent(value: string): {
  type: string;
  [key: string]: unknown;
} {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : { type: "unknown" };
  } catch {
    return { type: "unknown" };
  }
}

function readStreamingString(value: unknown) {
  return typeof value === "string" ? value : "";
}

type RuleTraceItem = string | Record<string, unknown>;

function readStreamingRuleArray(value: unknown): RuleTraceItem[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is RuleTraceItem =>
          typeof item === "string" || (typeof item === "object" && item !== null),
      )
    : [];
}

function readStreamingObjectArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
}

const chatTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatChatTime(value: number | Date = Date.now()) {
  return chatTimeFormatter.format(value);
}

const VOICE_TRACE_ORDER: Record<string, number> = {
  voice_recording: 10,
  voice_audio_prepare: 20,
  voice_stt: 30,
  voice_conversation: 40,
  voice_rules: 50,
  voice_rule: 55,
  voice_decision: 60,
  voice_intent: 65,
  voice_knowledge_start: 70,
  voice_knowledge_notice: 80,
  voice_knowledge: 90,
  voice_response: 100,
  voice_final: 110,
  voice_answer: 200,
  voice_turn: 200,
  voice_failed: 210,
};

function voiceTraceRank(stepId: string) {
  if (stepId in VOICE_TRACE_ORDER) return VOICE_TRACE_ORDER[stepId];
  if (stepId.startsWith("voice_")) return 95;
  return 120;
}

function normalizeVoiceTraceSteps(steps: TraceStep[]) {
  return [...steps]
    .filter((step) => !(step.id === "voice_turn" && step.status === "active"))
    .sort((left, right) => voiceTraceRank(left.id) - voiceTraceRank(right.id));
}

function formatElapsed(milliseconds: number) {
  const ms = Math.round(milliseconds);
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}초`;
}

function formatAgentMeta(entry: PreviewLogEntry) {
  if (!entry.meta || entry.meta === "streaming" || entry.meta === "streaming 준비중") {
    return `AI · ${entry.time}`;
  }
  if (entry.meta.startsWith("실패 ·") || entry.meta.startsWith("통화 시간 ·")) {
    return `AI · ${entry.time} · ${entry.meta}`;
  }
  return `AI · ${entry.time} · 소요 ${entry.meta}`;
}

function formatCustomerMeta(entry: PreviewLogEntry) {
  if (entry.meta?.startsWith("녹음 ")) {
    return `고객 · ${entry.time} · ${entry.meta}`;
  }
  return `고객 · ${entry.time}`;
}

function isThinkingMessage(entry: { from: "customer" | "agent"; text: string; meta?: string }) {
  return (
    (entry.from === "agent" &&
      (entry.text === "생각중..." || entry.text === "응답 작성중..." || entry.text === "처리중...") &&
      (entry.meta === "streaming 준비중" || entry.meta === "streaming")) ||
    (entry.from === "customer" && entry.text === "음성 인식 중...")
  );
}

type PreviewLogEntry = {
  id: number;
  from: "customer" | "agent";
  text: string;
  time: string;
  matchedRules: boolean;
  meta?: string;
  resultIntent?: string;
  traceSteps?: TraceStep[];
};

const PreviewLogEntryItem = memo(function PreviewLogEntryItem({
  entry,
  isLatestCustomer,
  showTraces,
}: {
  entry: PreviewLogEntry;
  isLatestCustomer: boolean;
  showTraces: boolean;
}) {
  if (entry.from === "customer") {
    return (
      <div>
        <div className="ml-auto flex max-w-[86%] flex-col items-end">
          {isThinkingMessage(entry) ? (
            <div className="flex items-center gap-1 rounded-[16px] rounded-br-[4px] bg-blue-400 px-3 py-3">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.14 }}
                  className="h-1.5 w-1.5 rounded-full bg-white"
                />
              ))}
            </div>
          ) : (
            <div className="whitespace-pre-line rounded-[16px] rounded-br-[4px] bg-blue-500 px-3 py-2 text-[12px] font-bold leading-relaxed text-white">
              {entry.text}
            </div>
          )}
          <div className="mt-1 px-1 text-[10px] font-bold text-gray-400">
            {formatCustomerMeta(entry)}
          </div>
        </div>
        {showTraces && entry.traceSteps && entry.traceSteps.length > 0 && (
          <TraceGraph
            steps={entry.traceSteps}
            intent={entry.resultIntent}
            defaultOpen={isLatestCustomer}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex max-w-[86%] flex-col items-start">
      {isThinkingMessage(entry) ? (
        <div className="flex items-center gap-1 rounded-[16px] rounded-bl-[4px] bg-gray-100 px-3 py-3">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.14 }}
              className="h-1.5 w-1.5 rounded-full bg-gray-400"
            />
          ))}
        </div>
      ) : (
        <div
          className={`whitespace-pre-line rounded-[16px] rounded-bl-[4px] px-3 py-2 text-[12px] font-bold leading-relaxed ${
            entry.matchedRules ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-800"
          }`}
        >
          {entry.text}
        </div>
      )}
      <div className="mt-1 px-1 text-[10px] font-bold text-gray-400">
        {formatAgentMeta(entry)}
      </div>
    </div>
  );
});

function PreviewConversationLog({
  entries,
  showTraces = true,
}: {
  entries: PreviewLogEntry[];
  showTraces?: boolean;
}) {
  const customerEntries = entries.filter((entry) => entry.from === "customer");
  const latestCustomerId = customerEntries[customerEntries.length - 1]?.id;

  return (
    <div className="space-y-2 px-1 py-2">
      {entries.map((entry) => (
        <PreviewLogEntryItem
          key={entry.id}
          entry={entry}
          isLatestCustomer={entry.from === "customer" && entry.id === latestCustomerId}
          showTraces={showTraces}
        />
      ))}
    </div>
  );
}

async function runRulePreviewChat(
  message: string,
  organizationId: string,
  sessionId: string,
  callbacks?: {
    onStart?: () => void;
    onDelta?: (delta: string) => void;
    onTraceStep?: (stepId: string, status: "active" | "done" | "warning", detail: string, items: unknown[]) => void;
  },
) {
  const baseUrl = getAgentApiBaseUrl();
  const response = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
    },
    body: JSON.stringify({
      organization_id: organizationId,
      session_id: sessionId,
      message,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/event-stream") || !response.body) {
    return response.json() as Promise<{
      intent: string;
      message: string | null;
      applied_rules: RuleTraceItem[];
      used_knowledge: Array<Record<string, unknown>>;
      knowledge_context: Array<Record<string, unknown>>;
    }>;
  }

  return parseSsePreviewChat(response.body, callbacks);
}

async function parseSsePreviewChat(
  body: ReadableStream<Uint8Array>,
  callbacks?: {
    onStart?: () => void;
    onDelta?: (delta: string) => void;
    onTraceStep?: (stepId: string, status: "active" | "done" | "warning", detail: string, items: unknown[]) => void;
  },
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamedText = "";
  let didStart = false;
  let finalResult: {
    intent: string;
    message: string | null;
    applied_rules: RuleTraceItem[];
    used_knowledge: Array<Record<string, unknown>>;
    knowledge_context: Array<Record<string, unknown>>;
  } | null = null;

  const handleEvent = (raw: string) => {
    const lines = raw.split(/\r?\n/);
    const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
    const dataValue = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!dataValue) return;

    const data = parseStreamingEvent(dataValue);
    const eventType = eventName ?? readStreamingString(data.type) ?? "message";

    if (eventType === "trace" || eventType === "trace_step") {
      callbacks?.onTraceStep?.(
        String(data.step ?? ""),
        (data.status as "active" | "done" | "warning") ?? "active",
        String(data.detail ?? ""),
        Array.isArray(data.items) ? data.items : [],
      );
      return;
    }

    if (eventType === "response_start" || eventType === "ai_response_start") {
      didStart = true;
      callbacks?.onStart?.();
      return;
    }

    if (eventType === "delta" || eventType === "ai_response_delta") {
      if (!didStart) {
        didStart = true;
        callbacks?.onStart?.();
      }
      const delta = readStreamingString(data.delta);
      streamedText += delta;
      callbacks?.onDelta?.(delta);
      return;
    }

    if (eventType === "ai_disabled") {
      finalResult = {
        intent: "ai_disabled",
        message: readStreamingString(data.message),
        applied_rules: [],
        used_knowledge: [],
        knowledge_context: [],
      };
      return;
    }

    if (eventType === "result" || eventType === "ai_response_done") {
      finalResult = {
        intent: readStreamingString(data.intent) || "unknown",
        message: readStreamingString(data.message) || streamedText,
        applied_rules: readStreamingRuleArray(data.applied_rules),
        used_knowledge: readStreamingObjectArray(data.used_knowledge),
        knowledge_context: readStreamingObjectArray(data.knowledge_context),
      };
      return;
    }

    if (eventType === "error") {
      throw new Error(readStreamingString(data.message) || "Agent streaming failed");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? "";
    for (const event of events) {
      if (event.trim()) handleEvent(event);
    }
  }

  if (buffer.trim()) handleEvent(buffer);

  return (
    finalResult ?? {
      intent: "streaming",
      message: streamedText,
      applied_rules: [],
      used_knowledge: [],
      knowledge_context: [],
    }
  );
}

function getRuleNames(rules: RuleTraceItem[]) {
  return rules
    .map((rule) => {
      if (typeof rule === "string") return rule.trim();
      return readTraceString(rule.name) ?? readTraceString(rule.title) ?? readTraceString(rule.id) ?? "";
    })
    .filter(Boolean);
}


function readTraceString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function TasksDetail() {
  return (
    <>
      <DetailBlock title="대표 태스크">
        {taskItems.slice(0, 3).map((task) => (
          <div key={task.id}>
            <MetricRow label={task.name} value={task.successRate} />
          </div>
        ))}
      </DetailBlock>
      <DetailBlock title="Memory 저장">
        <TimelineItem
          icon={<Clock className="h-4 w-4" />}
          title="진행 중 상태"
          text="예약 날짜, 고객 정보, 현재 step은 Redis에 저장합니다."
        />
      </DetailBlock>
    </>
  );
}

function LogsDetail() {
  return (
    <>
      <DetailBlock title="최근 실행">
        {agentRuns.map((run) => (
          <div key={run.id}>
            <MetricRow label={run.intent} value={run.status} />
          </div>
        ))}
      </DetailBlock>
      <DetailBlock title="추적 항목">
        <ChecklistItem text="사용한 지식 문서" />
        <ChecklistItem text="적용된 규칙" />
        <ChecklistItem text="실행한 태스크" />
        <ChecklistItem text="응답 지연과 실패 원인" />
      </DetailBlock>
    </>
  );
}

function MonitoringDetail() {
  return (
    <>
      <DetailBlock title="Latency">
        <MetricRow label="API 평균" value="428ms" />
        <MetricRow label="LLM 평균" value="1.18s" />
        <MetricRow label="RAG 검색" value="640ms" />
        <MetricRow label="Tool 실행" value="760ms" />
      </DetailBlock>
      <DetailBlock title="확인 필요">
        <TimelineItem
          icon={<Activity className="h-4 w-4" />}
          title="POST /tasks/{id}/steps"
          text="p95가 2초를 넘어 워크플로우 실행 로그 확인이 필요합니다."
        />
      </DetailBlock>
    </>
  );
}

function StatusDetail() {
  return (
    <>
      <DetailBlock title="Health Check">
        <MetricRow label="API Server" value="healthy" />
        <MetricRow label="Database" value="healthy" />
        <MetricRow label="Redis" value="healthy" />
        <MetricRow label="Task Tools" value="degraded" />
      </DetailBlock>
      <DetailBlock title="운영 기준">
        <ChecklistItem text="Redis 세션 상태 저장 확인" />
        <ChecklistItem text="pgvector 검색 응답 확인" />
        <ChecklistItem text="WebSocket 상담 이벤트 수신 확인" />
      </DetailBlock>
    </>
  );
}

function DocsDetail() {
  return (
    <>
      <DetailBlock title="문서 범위">
        <MetricRow label="Knowledge" value="Folders, Documents, Uploads" />
        <MetricRow label="Rules" value="Tone, Guardrails, Filters" />
        <MetricRow label="Tasks" value="Triggers, Steps, Memory" />
      </DetailBlock>
      <DetailBlock title="로그 스키마">
        <ChecklistItem text="Used Agent" />
        <ChecklistItem text="Used Knowledge" />
        <ChecklistItem text="Applied Rules" />
        <ChecklistItem text="Executed Tasks" />
      </DetailBlock>
    </>
  );
}

function SettingsDetail() {
  return (
    <>
      <DetailBlock title="Agent">
        <MetricRow label="이름" value="에이전트" />
        <MetricRow label="언어" value="한국어" />
        <MetricRow label="상태" value="활성" />
      </DetailBlock>
      <DetailBlock title="응답 원칙">
        <ChecklistItem text="추측하지 않기" />
        <ChecklistItem text="문서 근거 우선" />
        <ChecklistItem text="불만 고객은 담당자 연결" />
      </DetailBlock>
    </>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <h3 className="mb-3 text-[16px] font-bold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[16px] bg-[#f7f7f7] px-4 py-3 text-[14px]">
      <span className="shrink-0 font-semibold text-gray-500">{label}</span>
      <span className="min-w-0 text-right font-bold">{value}</span>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[16px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-bold">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
      {text}
    </div>
  );
}

function TimelineItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[16px] bg-[#f7f7f7] p-4">
      <div className="mb-2 flex items-center gap-2 text-[14px] font-bold">
        {icon}
        {title}
      </div>
      <p className="text-[13px] font-semibold leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}
