"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  Cog6ToothIcon,
  HomeIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { HomeTab } from "./floating/HomeTab";
import { ChatTab } from "./floating/ChatTab";
import { CallTab } from "./floating/CallTab";
import { SettingsTab } from "./floating/SettingsTab";

const navItems = [
  { id: "home", label: "홈", icon: HomeIcon },
  { id: "chat", label: "대화", icon: ChatBubbleOvalLeftEllipsisIcon },
  { id: "call", label: "전화", icon: PhoneIcon },
  { id: "settings", label: "설정", icon: Cog6ToothIcon },
];

const detailHeaderInfo: Record<string, { title: string; subtitle: string }> = {
  chat: { title: "AI 상담원과 대화", subtitle: "실시간 채팅 상담" },
  call: { title: "AI 상담원과 전화", subtitle: "실시간 음성 상담" },
};

export function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isDetailView, setIsDetailView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsDetailView(false);
  };

  const renderContent = () => {
    if (activeTab === "home") return <HomeTab />;
    if (activeTab === "call") return <CallTab />;
    if (activeTab === "settings") return <SettingsTab />;

    return <ChatTab isDetailView={isDetailView} onEnterDetail={() => setIsDetailView(true)} />;
  };

  const isCallTab = activeTab === "call";
  const showDetailHeader = isDetailView || isCallTab;
  const header = showDetailHeader ? detailHeaderInfo[activeTab] : null;

  const goBack = () => {
    if (isCallTab) {
      goToTab("home");
    } else {
      setIsDetailView(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return

    document.body.classList.add("floating-panel-open")
    return () => {
      document.body.classList.remove("floating-panel-open")
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [isOpen]);

  const panelBody = (
    <div className="flex h-dvh flex-col sm:h-[680px]">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        {header ? (
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500"
              aria-label="이전"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <div className="text-[15px] font-extrabold text-gray-900">{header.title}</div>
              <div className="text-[12px] font-bold text-gray-400">{header.subtitle}</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[15px] font-extrabold text-gray-900">Front Agent</div>
            <div className="text-[12px] font-bold text-gray-400">AI 상담원에게 문의하기</div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 p-4">
        {renderContent()}
      </div>

      {!showDetailHeader && (
        <div className="grid grid-cols-4 border-t border-gray-100 bg-white px-2 py-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                onClick={() => goToTab(id)}
                className={`flex flex-col items-center gap-1 rounded-[14px] py-2 text-[11px] font-extrabold transition-colors ${
                  isActive ? "text-blue-500" : "text-gray-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`fixed flex flex-col items-end gap-3 bottom-6 right-6 sm:bottom-8 sm:right-8 ${isOpen ? "z-[150]" : "z-50"}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-[150] h-full w-full overflow-hidden bg-white shadow-[0_20px_60px_rgb(0,0,0,0.16)] sm:hidden"
          >
            {panelBody}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="desktop-panel"
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="hidden overflow-hidden bg-white shadow-[0_20px_60px_rgb(0,0,0,0.16)] sm:block sm:w-[calc(100vw-32px)] sm:max-w-[420px] sm:rounded-[32px] sm:border sm:border-gray-100"
          >
            {panelBody}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isOpen
            ? "h-[60px] w-[60px] rounded-[24px] items-center justify-center transition-all duration-300 bg-gray-800 text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] rotate-90 hidden sm:flex"
            : "h-[60px] w-[60px] rounded-[24px] items-center justify-center transition-all duration-300 bg-blue-500 text-white shadow-[0_8px_30px_rgb(49,130,246,0.3)] hover:bg-blue-600 hover:scale-105 flex"
        }
      >
        {isOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
