import type { User } from "@supabase/supabase-js";
import type { Conversation } from "../types";
import { ConversationPanel } from "./ConversationPanel";

export function CenterPanel({
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
  return (
    <section className="h-full min-h-0 min-w-0 overflow-hidden rounded-[20px] bg-white">
      <ConversationPanel
        conversation={conversation}
        message={message}
        onMessageChange={onMessageChange}
        user={user}
      />
    </section>
  );
}
