import type { Conversation, ConversationMessage } from "../types";
import { getAgentApiBaseUrl, readAgentApiError } from "../../../lib/agentApiBase";

type ConversationMessageRecord = {
  id: string;
  organization_id: string;
  conversation_id: string;
  sender_type: string;
  sender_name?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
};

type ConversationRecord = {
  id: string;
  organization_id: string;
  session_id: string;
  channel: string;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  status: string;
  assigned_admin_id?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  ai_enabled?: boolean;
  call_started_at?: string | null;
  call_ended_at?: string | null;
  call_duration_seconds?: number | null;
};

const channelLabel: Record<string, string> = {
  web_chat: "채널톡",
  kakao: "카카오톡",
  phone: "전화",
  web_call: "전화",
  email: "이메일",
  instagram: "인스타그램",
  admin: "관리자",
};

export function parseUtcTimestamp(value: string) {
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "";
  const date = parseUtcTimestamp(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일`;
}

const internalTestSessionPrefixes = ["rule_preview_", "task_test_"];

function isInternalTestConversation(record: ConversationRecord) {
  return internalTestSessionPrefixes.some((prefix) => record.session_id?.startsWith(prefix));
}

function mapConversationRecord(record: ConversationRecord): Conversation {
  return {
    id: record.id,
    customer: record.customer_name ?? "고객 미입력",
    assignee: record.assigned_admin_id ? "담당자 배정" : "AI 처리중",
    channel: channelLabel[record.channel] ?? record.channel,
    time: formatRelativeTime(record.last_message_at ?? record.updated_at ?? record.created_at),
    preview: record.last_message ?? "",
    tags: record.ai_enabled === false ? ["AI 응답 꺼짐"] : [],
    avatar: (record.customer_name ?? "고")[0],
    isLive: true,
    isInternalTest: isInternalTestConversation(record),
    callStartedAt: record.call_started_at ?? null,
    callEndedAt: record.call_ended_at ?? null,
    callDurationSeconds: record.call_duration_seconds ?? null,
  };
}

export async function fetchConversations(organizationId: string, channel?: string) {
  const params = new URLSearchParams({ organization_id: organizationId, limit: "200" });
  if (channel) params.set("channel", channel);

  const response = await fetch(`${getAgentApiBaseUrl()}/conversations?${params}`);

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: ConversationRecord[] };
  return (payload.items ?? []).map(mapConversationRecord);
}

function mapMessageRecord(record: ConversationMessageRecord): ConversationMessage {
  return {
    id: record.id,
    conversationId: record.conversation_id,
    senderType: record.sender_type as ConversationMessage["senderType"],
    senderName: record.sender_name,
    message: record.message,
    createdAt: record.created_at,
  };
}

export async function fetchConversationMessages(organizationId: string, conversationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/conversations/${encodeURIComponent(conversationId)}/messages?organization_id=${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: ConversationMessageRecord[] };
  return (payload.items ?? []).map(mapMessageRecord);
}

export async function sendAdminMessage(
  organizationId: string,
  conversationId: string,
  message: string,
  senderName: string,
) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/conversations/${encodeURIComponent(conversationId)}/messages/admin?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sender_name: senderName }),
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return response.json();
}
