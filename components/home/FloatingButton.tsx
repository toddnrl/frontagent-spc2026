"use client";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  HomeIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import { HomeTab } from "./floating/HomeTab";
import { CallTab } from "./floating/CallTab";
import { ShaderOrb } from "./floating/ShaderOrb";
import { SettingsTab } from "./floating/SettingsTab";

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 15L4 20M9 15H5M9 15V19"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9L20 4M15 9H19M15 9V5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FloatingTab = "home" | "call" | "settings";

const surfaceTransition = {
  layout: { type: "spring" as const, stiffness: 420, damping: 40, mass: 0.9 },
  opacity: { duration: 0.1 },
};

const orbTransition = {
  layout: { type: "tween" as const, duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
};

const navItems = [
  { id: "home", label: "홈", icon: HomeIcon },
  { id: "call", label: "상담", icon: PhoneIcon },
  { id: "settings", label: "설정", icon: Cog6ToothIcon },
] satisfies Array<{ id: FloatingTab; label: string; icon: typeof HomeIcon }>;

export function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FloatingTab>("call");
  const [isCallTextMode, setIsCallTextMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCallView = activeTab === "call";
  const isConversationView = isCallView && isCallTextMode;
  const showBottomNav = !isCallView;

  const goToTab = (tabId: FloatingTab) => {
    setActiveTab(tabId);
    setIsCallTextMode(false);
  };

  const renderContent = () => {
    if (activeTab === "home") return <HomeTab />;
    if (activeTab === "settings") return <SettingsTab />;

    return (
      <CallTab
        isTextMode={isCallTextMode}
        onTextModeChange={setIsCallTextMode}
      />
    );
  };

  const goBack = () => {
    if (isConversationView) {
      setIsCallTextMode(false);
      return;
    }

    if (isCallView) {
      goToTab("home");
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add("floating-panel-open");
    return () => {
      document.body.classList.remove("floating-panel-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const renderPanelBody = () => (
    <div className="flex h-dvh flex-col sm:h-[680px]">
      <div className="flex items-center justify-between px-5 py-4">
        {isCallView ? (
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
                isConversationView
                  ? "overflow-hidden bg-[#40c9f4] text-white shadow-[0_8px_20px_rgb(14,165,233,0.22)]"
                  : "bg-gray-50 text-gray-500"
              }`}
              aria-label="이전"
            >
              {isConversationView && (
                <motion.span
                  layoutId="floating-call-orb"
                  transition={orbTransition}
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                >
                  <ShaderOrb active={false} />
                  <span className="absolute inset-0 bg-white/10" />
                </motion.span>
              )}
              <ArrowLeftIcon className="relative z-10 h-5 w-5" />
            </button>
          </div>
        ) : (
          <div>
            <div className="text-[15px] font-extrabold text-gray-900">
              Front Agent
            </div>
            <div className="text-[12px] font-bold text-gray-400">
              AI 상담원에게 문의하기
            </div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="축소"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500"
        >
          <MinimizeIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 p-4">{renderContent()}</div>

      {showBottomNav && (
        <div className="grid grid-cols-3 border-t border-gray-100 bg-white px-2 py-2">
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
    <LayoutGroup id="floating-widget">
      <div
        ref={containerRef}
        className={`pointer-events-none fixed right-0 bottom-6 left-0 flex flex-col items-center sm:bottom-8 ${isOpen ? "z-[150]" : "z-50"}`}
      >
        <AnimatePresence initial={false} mode="sync">
          {isOpen ? (
            <motion.div
              key="floating-panel"
              layoutId="floating-surface"
              initial={{ opacity: 0.96 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.96 }}
              transition={surfaceTransition}
              style={{ transformOrigin: "bottom center" }}
              className="pointer-events-auto fixed inset-0 z-[150] h-full w-full overflow-hidden bg-white shadow-[0_20px_60px_rgb(0,0,0,0.16)] sm:relative sm:inset-auto sm:h-[680px] sm:w-[calc(100vw-32px)] sm:max-w-[420px] sm:rounded-[32px] sm:border sm:border-gray-100"
            >
              {renderPanelBody()}
            </motion.div>
          ) : (
            <button
              key="floating-cta"
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="AI 상담원 체험하기"
              className="pointer-events-auto group relative flex max-w-[calc(100vw-48px)] items-center gap-3 rounded-full py-2 pl-2 pr-5 text-[15px] font-extrabold text-gray-900 sm:gap-4 sm:py-3 sm:pl-3 sm:pr-7 sm:text-[18px]"
            >
              <motion.span
                layoutId="floating-surface"
                transition={surfaceTransition}
                className="absolute inset-0 rounded-full border border-gray-200 bg-white shadow-[0_10px_30px_rgb(17,24,39,0.10)] transition-shadow duration-300 group-hover:border-gray-300 group-hover:shadow-[0_14px_36px_rgb(17,24,39,0.14)]"
              />
              <motion.span
                layoutId="floating-call-orb"
                transition={orbTransition}
                className="relative z-10 h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#40c9f4] shadow-[inset_0_0_18px_rgb(255,255,255,0.35)] sm:h-14 sm:w-14"
              >
                <ShaderOrb active={false} />
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
              </motion.span>
              <span className="relative z-10 whitespace-nowrap leading-none">
                AI 상담원 체험하기
              </span>
            </button>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
