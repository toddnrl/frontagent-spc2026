"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { conversations } from "../data";
import type { Conversation, CustomerSection } from "../types";
import { CustomerSectionRail } from "./CustomerSectionRail";
import { CenterPanel, ConversationList, CustomerOperationsWorkspace, RightPanel } from "./index";

export function InboxWorkspace({
  activeSection,
  user,
}: {
  activeSection: CustomerSection;
  user: User;
}) {
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const [selectedLiveConversation, setSelectedLiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const selectedConversation =
    selectedLiveConversation ??
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0];

  const gridTemplateColumns = "76px minmax(420px,600px) minmax(480px,1fr) minmax(280px,320px)";

  const handleSelectConversation = (id: string, conversation: Conversation) => {
    setSelectedId(id);
    setSelectedLiveConversation(conversation.isLive ? conversation : null);
  };

  return (
    <div
      className="grid h-[calc(100vh-70px)] min-h-0 gap-2 overflow-hidden px-2 pb-2 transition-[grid-template-columns] duration-300 ease-in-out"
      style={{ gridTemplateColumns }}
    >
      <CustomerSectionRail activeSection={activeSection} />
      {activeSection === "conversations" ? (
        <>
          <ConversationList selectedId={selectedId} onSelect={handleSelectConversation} user={user} />
          <CenterPanel
            conversation={selectedConversation}
            message={message}
            onMessageChange={setMessage}
            user={user}
          />
          <RightPanel conversation={selectedConversation} />
        </>
      ) : (
        <CustomerOperationsWorkspace activeSection={activeSection} user={user} />
      )}
    </div>
  );
}
