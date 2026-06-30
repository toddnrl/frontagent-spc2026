import type { ConversationMessage } from "../components/admin/ai/types";
import type { TraceStep } from "../components/admin/ai/TraceGraph";
import { parseUtcTimestamp } from "../components/admin/ai/conversationsApi";

export type VoicePreviewLogEntry = {
  id: number;
  from: "customer" | "agent";
  text: string;
  time: string;
  matchedRules: boolean;
  meta?: string;
  resultIntent?: string;
  traceSteps?: TraceStep[];
  messageId?: string;
};

function formatChatTime(value: number | Date = Date.now()) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

function messageTimestamp(message: ConversationMessage) {
  if (!message.createdAt) return Date.now();
  return parseUtcTimestamp(message.createdAt).getTime();
}

function stableEntryId(message: ConversationMessage, index: number) {
  const numeric = Number.parseInt(message.id.replace(/\D/g, "").slice(-12), 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : index + 1;
}

export function mapConversationMessagesToVoiceLog(
  messages: ConversationMessage[],
  traceStepsByCustomerIndex: TraceStep[][] = [],
): VoicePreviewLogEntry[] {
  let customerIndex = 0;

  return messages.flatMap((message, index) => {
    if (message.senderType === "system") return [];

    const from = message.senderType === "customer" ? ("customer" as const) : ("agent" as const);
    const entry: VoicePreviewLogEntry = {
      id: stableEntryId(message, index),
      from,
      text: message.message,
      time: formatChatTime(messageTimestamp(message)),
      matchedRules: false,
      messageId: message.id,
    };

    if (from === "customer") {
      const traceSteps = traceStepsByCustomerIndex[customerIndex];
      customerIndex += 1;
      if (traceSteps && traceSteps.length > 0) {
        entry.traceSteps = traceSteps;
      }
    }

    return [entry];
  });
}
