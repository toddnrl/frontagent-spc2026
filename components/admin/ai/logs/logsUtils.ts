import type { AgentRun } from "../types";

export const logsChannelLabel: Record<string, string> = {
  web_chat: "채팅",
  web_call: "전화",
  kakao: "카카오톡",
  phone: "전화",
  email: "이메일",
  instagram: "인스타그램",
  admin: "관리자",
};

export const logsStatusLabel: Record<AgentRun["status"], string> = {
  success: "성공",
  error: "실패",
};

export type AgentRunRecord = {
  id: string;
  session_id: string;
  channel?: string | null;
  user_message: string;
  intent?: string | null;
  applied_rules?: string[] | null;
  used_knowledge?: string[] | null;
  final_response?: string | null;
  status?: string | null;
  error_message?: string | null;
  created_at?: string | null;
};

export function mapAgentRunRecord(record: AgentRunRecord): AgentRun {
  return {
    id: record.id,
    sessionId: record.session_id,
    channel: record.channel ?? null,
    userMessage: record.user_message,
    intent: record.intent ?? null,
    status: record.status === "error" ? "error" : "success",
    errorMessage: record.error_message ?? null,
    appliedRules: record.applied_rules ?? [],
    usedKnowledge: record.used_knowledge ?? [],
    finalResponse: record.final_response ?? null,
    createdAt: record.created_at ?? null,
  };
}

export function formatLogTimestamp(value: string | null) {
  if (!value) return "";
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);
  return date.toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const LOGS_POLL_INTERVAL_MS = 10000;
