"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { isSupabaseReady, supabase } from "@/lib/supabase";

interface Message {
  id: number | string;
  role: "user" | "agent" | "admin";
  senderName?: string;
  text: string;
  time: string;
  streaming?: boolean;
}

interface ChatTabProps {
  isDetailView: boolean;
  onEnterDetail: () => void;
}

const API_BASE = (process.env.NEXT_PUBLIC_AGENT_API_URL ?? "/agent-api").replace(/\/$/, "");
const ADMIN_MESSAGE_POLL_INTERVAL_MS = 4000;
const SESSION_STORAGE_KEY = "alf_chat_session";
const SELECTED_ORG_STORAGE_KEYS = [
  "selected_organization_id",
  "selectedOrganizationId",
  "organization_id",
  "org_id",
];
const SELECTED_ORG_OBJECT_STORAGE_KEYS = [
  "selected_organization",
  "selectedOrganization",
  "current_organization",
  "currentOrganization",
  "organization",
];
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

type AgentContext = {
  organizationId?: string;
  accessToken?: string;
};

type StoredSession = {
  sessionId: string;
  conversationId: string | null;
  organizationId?: string;
  savedAt: number;
};

function loadStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveStoredSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function getStringMetadataValue(source: unknown, keys: string[]) {
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}

function getSelectedOrganizationId() {
  if (typeof window === "undefined") return null;

  for (const key of SELECTED_ORG_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value?.trim()) return value.trim();
  }

  for (const key of SELECTED_ORG_OBJECT_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (!value) continue;

    try {
      const parsed = JSON.parse(value) as unknown;
      const organizationId = getStringMetadataValue(parsed, ["id", "organization_id", "org_id", "orgId"]);
      if (organizationId) return organizationId;
    } catch {
      // Ignore non-JSON values and continue checking other keys.
    }
  }

  return null;
}

async function resolveAgentContext(): Promise<AgentContext> {
  const selectedOrganizationId = getSelectedOrganizationId();
  const { data } = isSupabaseReady
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const session = data.session;

  return {
    organizationId: selectedOrganizationId ?? undefined,
    accessToken: session?.access_token,
  };
}

function formatTime(ts: number = Date.now()) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(ts);
}

function parseUtcTimestamp(value: string) {
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function buildHeaders(accessToken?: string) {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function sendViaRest(
  message: string,
  sessionId: string,
  context: AgentContext,
): Promise<{ text: string; conversationId: string | null }> {
  const body = {
    ...(context.organizationId ? { organization_id: context.organizationId } : {}),
    session_id: sessionId,
    message,
    stream: false,
  };

  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: buildHeaders(context.accessToken),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    text: typeof data.message === "string" ? data.message : JSON.stringify(data),
    conversationId: typeof data.conversation_id === "string" ? data.conversation_id : null,
  };
}

type ConversationMessageRecord = {
  id: string;
  sender_type: string;
  sender_name?: string | null;
  message: string;
  created_at?: string | null;
};

async function fetchConversationMessages(
  conversationId: string,
  context: AgentContext,
): Promise<ConversationMessageRecord[]> {
  const params = new URLSearchParams();
  if (context.organizationId) params.set("organization_id", context.organizationId);
  const query = params.toString();

  const res = await fetch(
    `${API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages${query ? `?${query}` : ""}`,
    { headers: buildHeaders(context.accessToken) },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

function mapRecordToMessage(record: ConversationMessageRecord): Message {
  return {
    id: record.id,
    role: record.sender_type === "customer" ? "user" : record.sender_type === "admin" ? "admin" : "agent",
    senderName: record.sender_type === "admin" ? record.sender_name ?? "상담사" : undefined,
    text: record.message,
    time: formatTime(record.created_at ? parseUtcTimestamp(record.created_at).getTime() : undefined),
  };
}

export function ChatTab({ isDetailView, onEnterDetail }: ChatTabProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef<string | null>(null);
  const conversationId = useRef<string | null>(null);
  const seenMessageIds = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // 24시간 이내 진행 중이던 상담이 있으면(localStorage) 세션/메시지 히스토리를 복원한다.
  useEffect(() => {
    const stored = loadStoredSession();
    if (!stored) return;

    resolveAgentContext()
      .then((context) => {
        if (stored.organizationId && stored.organizationId !== context.organizationId) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          return null;
        }

        sessionId.current = stored.sessionId;
        conversationId.current = stored.conversationId;
        if (!stored.conversationId) return null;

        return fetchConversationMessages(stored.conversationId, context);
      })
      .then((records) => {
        if (!records) return;
        records.forEach((record) => seenMessageIds.current.add(record.id));
        setMessages(records.map(mapRecordToMessage));
      })
      .catch(() => {
        // 복원 실패 시 새 상담처럼 빈 화면으로 시작한다.
      });
  }, []);

  // 관리자가 콘솔에서 직접 보낸 메시지를 짧은 polling으로 받아온다.
  // 상담방(conversation)이 아직 없으면(첫 메시지 전송 전) 대상이 없으니 건너뛴다.
  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      if (!conversationId.current) {
        console.debug("[admin-poll] skipped: no conversationId yet");
        return;
      }

      try {
        const context = await resolveAgentContext();
        const records = await fetchConversationMessages(conversationId.current, context);
        console.debug("[admin-poll] fetched", records.length, "records for", conversationId.current);
        const newAdminRecords = records.filter(
          (record) => record.sender_type === "admin" && !seenMessageIds.current.has(record.id),
        );
        if (newAdminRecords.length === 0) return;

        newAdminRecords.forEach((record) => seenMessageIds.current.add(record.id));
        setMessages((prev) => [...prev, ...newAdminRecords.map(mapRecordToMessage)]);
      } catch (pollErr) {
        console.debug("[admin-poll] failed", pollErr);
      }
    }, ADMIN_MESSAGE_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userTs = Date.now();
    const agentId = userTs + 1;
    sessionId.current ??= `chat_${userTs}`;
    const currentSessionId = sessionId.current;

    setMessages((prev) => [
      ...prev,
      { id: userTs, role: "user", text, time: formatTime(userTs) },
      { id: agentId, role: "agent", text: "", time: formatTime(userTs), streaming: true },
    ]);
    setInput("");
    setIsSending(true);
    setError(null);
    if (conversationId.current) {
      resolveAgentContext()
        .then((context) => {
          saveStoredSession({
            sessionId: currentSessionId,
            conversationId: conversationId.current,
            organizationId: context.organizationId,
            savedAt: Date.now(),
          });
        })
        .catch(() => {
          // 세션 저장 실패는 상담 전송 자체를 막지 않는다.
        });
    }

    const patch = (id: number, update: Partial<Message>) =>
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...update } : m)));

    try {
      const context = await resolveAgentContext();
      const { text: reply, conversationId: newConversationId } = await sendViaRest(text, currentSessionId, context);
      if (newConversationId) {
        conversationId.current = newConversationId;
        saveStoredSession({
          sessionId: currentSessionId,
          conversationId: newConversationId,
          organizationId: context.organizationId,
          savedAt: Date.now(),
        });
      }
      patch(agentId, { text: reply, streaming: false, time: formatTime() });
    } catch (restErr) {
      const msg = restErr instanceof Error ? restErr.message : "요청 실패";
      setError(msg);
      patch(agentId, { text: `응답을 받지 못했습니다. (${msg})`, streaming: false, time: formatTime() });
    } finally {
      setIsSending(false);
    }
  };

  if (!isDetailView) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
              </div>
              <div className="mt-3 text-[15px] font-extrabold text-gray-900">상담 내역이 없어요</div>
              <div className="mt-1 text-[12px] font-bold leading-relaxed text-gray-400">
                새 상담을 시작하면 여기에 표시됩니다.
              </div>
            </div>
          ) : (
            <div className="space-y-2 px-1 py-2">
              {messages.slice(-3).map((m) => (
                <div key={m.id} className={`flex max-w-[86%] flex-col ${m.role === "user" ? "ml-auto items-end" : "items-start"}`}>
                  <div className={`rounded-[14px] px-3 py-2 text-[12px] font-bold leading-relaxed line-clamp-2 ${
                    m.role === "user" ? "rounded-br-[4px] bg-blue-500 text-white" : "rounded-bl-[4px] bg-gray-100 text-gray-700"
                  }`}>
                    {m.text || "…"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onEnterDetail}
          className="mt-3 w-full rounded-[18px] bg-blue-500 py-3.5 text-[14px] font-extrabold text-white transition-colors hover:bg-blue-600"
        >
          {messages.length > 0 ? "대화 계속하기" : "새 상담 시작하기"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-[18px] bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
            </div>
            <div className="mt-3 text-[15px] font-extrabold text-gray-900">AI 상담원에게 문의해보세요</div>
            <div className="mt-1 text-[12px] font-bold leading-relaxed text-gray-400">
              예약, 변경, 위치 문의를 바로 도와드릴게요.
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto px-1 py-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex max-w-[86%] flex-col ${m.role === "user" ? "ml-auto items-end" : "items-start"}`}
              >
                {m.role === "admin" && (
                  <div className="mb-0.5 px-1 text-[11px] font-extrabold text-emerald-600">{m.senderName}</div>
                )}
                {m.role === "agent" && m.streaming && m.text === "" ? (
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
                  <div className={`whitespace-pre-line rounded-[16px] px-3 py-2 text-[13px] font-bold leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-[4px] bg-blue-500 text-white"
                      : m.role === "admin"
                        ? "rounded-bl-[4px] bg-emerald-50 text-emerald-900"
                        : "rounded-bl-[4px] bg-gray-100 text-gray-800"
                  }`}>
                    {m.text}
                    {m.streaming && m.text && (
                      <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-current opacity-70" />
                    )}
                  </div>
                )}
                <div className="mt-1 px-1 text-[10px] font-bold text-gray-400">{m.time}</div>
              </div>
            ))}
            {error && (
              <div className="rounded-[12px] bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-600">
                연결 오류: {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-[18px] border border-gray-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
          }}
          placeholder="AI 상담원에게 무엇이든 물어보세요"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] font-bold text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          onClick={send}
          disabled={!input.trim() || isSending}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-300"
          aria-label="전송"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
