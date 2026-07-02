"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
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
  const [selectedId, setSelectedId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [message, setMessage] = useState("");

  const gridTemplateColumns = "76px minmax(420px,600px) minmax(480px,1fr) minmax(280px,320px)";

  const handleSelectConversation = (id: string, conversation: Conversation) => {
    setSelectedId(id);
    setSelectedConversation(conversation);
  };

  const handleLoaded = (conversations: Conversation[]) => {
    setIsLoadingConversation(false);
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedId(conversations[0].id);
      setSelectedConversation(conversations[0]);
    }
  };

  return (
    <div
      className="grid h-[calc(100vh-70px)] min-h-0 gap-2 overflow-hidden px-2 pb-2 transition-[grid-template-columns] duration-300 ease-in-out"
      style={{ gridTemplateColumns }}
    >
      <CustomerSectionRail activeSection={activeSection} />
      {activeSection === "conversations" ? (
        <>
          <ConversationList
            selectedId={selectedId}
            onSelect={handleSelectConversation}
            onLoaded={handleLoaded}
            user={user}
          />
          {isLoadingConversation ? (
            <div className="col-span-2 grid grid-cols-[1fr_280px] gap-2">
              <div className="animate-pulse rounded-[20px] bg-white">
                <div className="border-b border-gray-100 px-6 py-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="space-y-4 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                        <div className="h-3 w-3/4 rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="animate-pulse rounded-[20px] bg-white p-5 space-y-4">
                <div className="h-4 w-24 rounded bg-gray-200" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-[12px] bg-gray-100" />
                ))}
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              <CenterPanel
                conversation={selectedConversation}
                message={message}
                onMessageChange={setMessage}
                user={user}
              />
              <RightPanel conversation={selectedConversation} />
            </>
          ) : (
            <div className="col-span-2 flex items-center justify-center text-[14px] font-semibold text-gray-400">
              대화를 선택하면 내용이 표시됩니다.
            </div>
          )}
        </>
      ) : (
        <CustomerOperationsWorkspace activeSection={activeSection} user={user} />
      )}
    </div>
  );
}
