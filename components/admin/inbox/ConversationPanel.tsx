import type { User } from "@supabase/supabase-js";
import { Check, Link2, MoreVertical, Sparkles, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getOrganizationId } from "../../../lib/organization";
import type { Conversation, ConversationMessage } from "../types";
import {
  ActivityDivider,
  AgentMessage,
  CustomerBubble,
  InternalNote,
} from "../ui/ChatBubbles";
import { Composer } from "./Composer";
import { fetchConversationMessages, parseUtcTimestamp, sendAdminMessage } from "./conversationsApi";

function AutoScrollAnchor({ messageCount }: { messageCount: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "end" });
  }, [messageCount]);

  return <div ref={ref} />;
}

function formatMessageTime(value?: string | null) {
  if (!value) return "";
  return parseUtcTimestamp(value).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function formatConversationText(text: string) {
  return text.replace(/\bfront agent\b/gi, "Callbee").replace(/\balf voice\b/gi, "Callbee");
}

const MESSAGE_POLL_INTERVAL_MS = 4000;

function LiveConversationBody({
  conversation,
  user,
  refreshSignal,
}: {
  conversation: Conversation;
  user: User;
  refreshSignal: number;
}) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const organizationId = getOrganizationId(user);

  useEffect(() => {
    let isMounted = true;

    function load() {
      return fetchConversationMessages(organizationId, conversation.id)
        .then((items) => {
          if (isMounted) {
            setMessages(items);
            setError(null);
          }
        })
        .catch((caughtError) => {
          if (isMounted) {
            setError(caughtError instanceof Error ? caughtError.message : "메시지를 불러오지 못했습니다.");
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    load();
    const intervalId = window.setInterval(load, MESSAGE_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [organizationId, conversation.id, refreshSignal]);

  if (isLoading) {
    return <div className="text-sm font-semibold text-gray-400">불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-sm font-semibold text-red-500">{error}</div>;
  }

  if (messages.length === 0) {
    return <div className="text-sm font-semibold text-gray-400">아직 메시지가 없습니다.</div>;
  }

  return (
    <>
      {messages.map((item) => (
        <div key={item.id}>
          {item.senderType === "customer" ? (
            <CustomerBubble text={formatConversationText(item.message)} />
          ) : item.senderType === "system" ? (
            <ActivityDivider label={formatConversationText(item.message)} />
          ) : (
            <AgentMessage
              name={item.senderName ?? (item.senderType === "admin" ? "관리자" : "Callbee")}
              time={formatMessageTime(item.createdAt)}
              text={formatConversationText(item.message)}
            />
          )}
        </div>
      ))}
      <AutoScrollAnchor messageCount={messages.length} />
    </>
  );
}

export function ConversationPanel({
  conversation,
  message,
  onMessageChange,
  user,
}: {
  conversation: Conversation;
  message: string;
  onMessageChange: (value: string) => void;
  user: User;
}) {
  const [isSending, setIsSending] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [sendError, setSendError] = useState<string | null>(null);

  async function handleSend() {
    if (!conversation.isLive || !message.trim()) return;
    setIsSending(true);
    setSendError(null);
    try {
      const organizationId = getOrganizationId(user);
      const senderName = user.user_metadata?.name ?? user.email ?? "관리자";
      await sendAdminMessage(organizationId, conversation.id, message.trim(), senderName);
      onMessageChange("");
      setRefreshSignal((value) => value + 1);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "메시지 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-6">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-bold">{conversation.customer}</h2>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <Sparkles className="h-5 w-5" />
          <Link2 className="h-5 w-5" />
          <MoreVertical className="h-5 w-5" />
          <button className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-900">
            <Check className="h-4 w-4" />
            종료
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-[220px] pt-7">
        {conversation.isLive ? (
          <LiveConversationBody
            key={conversation.id}
            conversation={conversation}
            user={user}
            refreshSignal={refreshSignal}
          />
        ) : (
          <>
            <div className="mb-7 ml-auto max-w-[62%] rounded-[18px] rounded-tr-[8px] bg-[#ececec] px-5 py-3 text-sm font-semibold">
              2주 전에 반품 접수했는데 아직도 환불이 안 됐어요.
            </div>

            <ActivityDivider label="내부활동 (3)" />
            <AgentMessage
              name="이지현"
              time="8:40 PM"
              text={`안녕하세요, 지은님.\n확인해보니 저희 시스템 오류로 환불 처리가 누락되었습니다.\n정말 죄송합니다. 바로 환불 처리 도와드리겠습니다.`}
            />

            <CustomerBubble text="2주나 기다렸는데..." />
            <CustomerBubble text="시스템 오류라뇨 😡 전화도 잘 안받으시더니" />

            <ActivityDivider label="내부활동 (8)" />
            <InternalNote name="배지희" text="@배지희 혹시 이 분 적립금 발급 드려도 괜찮을까요?" />
            <InternalNote name="이지현" text="@이지현 네. 3만원 보상 드리는게 좋을 것 같아요." />

            <button className="mb-6 text-sm font-bold text-gray-500">
              전체보기
            </button>

            <AgentMessage
              name="이지현"
              time="8:40 PM"
              text={`불편을 드려서 진심으로 사과드립니다. 🥲\n환불은 지금 바로 처리되었고, 기다려주신 시간에 대한 사과로 3만원 적립금도 함께 넣어드렸습니다. 다시 한 번 죄송합니다.`}
            />
          </>
        )}
      </div>

      {sendError && (
        <div className="pointer-events-none absolute bottom-[170px] left-4 right-4 rounded-[14px] bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm">
          {sendError}
        </div>
      )}
      <Composer value={message} onChange={onMessageChange} onSend={conversation.isLive ? handleSend : undefined} disabled={isSending} />
    </main>
  );
}
