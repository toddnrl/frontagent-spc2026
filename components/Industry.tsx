"use client";

import { useState, useEffect, useRef } from "react";
import { pageSectionShellTall } from "./sectionLayout";

type IconProps = { className?: string };

const icons = {
  board: ({ className }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l3-3h12l3 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
      <path d="M3 7h6l1.5 2h3L15 7h6" />
    </svg>
  ),
  gallery: ({ className }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.4" />
      <path d="M21 16l-5-5L7 20" />
    </svg>
  ),
  calendar: ({ className }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  ),
  form: ({ className }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v14H4z" />
      <path d="M16 3l5 5-9 9H7v-5l9-9z" />
    </svg>
  ),
  map: ({ className }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5L3 7v12l6-2 6 2 6-2V5l-6 2-6-2z" />
      <path d="M9 5v12M15 7v12" />
    </svg>
  ),
  share: ({ className }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
    </svg>
  ),
  code: ({ className }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
    </svg>
  ),
};

const tabs = [
  { id: "board",    label: "라이프스타일", Icon: icons.board,    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80" },
  { id: "gallery",  label: "뷰티",        Icon: icons.gallery,  image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80" },
  { id: "calendar", label: "일정",        Icon: icons.calendar, image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80" },
  { id: "form",     label: "패션",        Icon: icons.form,     image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80" },
  { id: "map",      label: "지도",        Icon: icons.map,      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" },
  { id: "share",    label: "공유",        Icon: icons.share,    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80" },
  { id: "code",     label: "코드",        Icon: icons.code,     image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80" },
];

/* ------------------------------------------------------------------ */
/*  스크롤 애니메이션 훅                                                 */
/* ------------------------------------------------------------------ */

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  컴포넌트                                                            */
/* ------------------------------------------------------------------ */

export default function IndustrySection() {
  const [active, setActive] = useState("gallery");

  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: tabsRef,   visible: tabsVisible   } = useScrollReveal<HTMLDivElement>();
  const { ref: panelRef,  visible: panelVisible  } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="industry" className={pageSectionShellTall}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center bg-transparent px-10 py-12 text-center max-[860px]:px-5">

        {/* 헤더 */}
        <div
          ref={headerRef}
          className={[
            "transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          <p className="mb-3.5 text-center text-[15px] font-bold text-[#1b1c1e]">업종별 사례</p>
          <h2 className="mx-auto my-3.5 w-full text-center text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[900px]:text-[28px]">
            이미 AI로 상담을 줄인 기업들의 진짜 결과가 있습니다
          </h2>
          <p className="mx-auto mb-[30px] w-full max-w-[660px] text-center text-[17px] leading-[1.75] text-[#5b6b8c]">
            그럴듯한 데모나 가능성에 대한 이야기가 아닙니다. 현장에서 이미 검증된 진짜 AI 사례가 있습니다.<br />
            업종·규모별 상담량, 문의 처리 방식, 운영 구조가 어떻게 달라졌는지 직접 확인해 보세요.
          </p>
        </div>

        {/* 아이콘 탭 */}
        <div
          ref={tabsRef}
          className={[
            "mb-10 flex w-full max-w-4xl flex-wrap items-start justify-center gap-x-10 gap-y-6 transition-all duration-700 delay-150",
            tabsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="group flex w-20 flex-col items-center gap-3 focus:outline-none"
              >
                <span
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-md transition",
                    isActive
                      ? "bg-sky-50 text-sky-600 ring-1 ring-sky-100"
                      : "text-neutral-400 group-hover:text-neutral-600",
                  ].join(" ")}
                >
                  <tab.Icon className="h-6 w-6" />
                </span>
                <span
                  className={[
                    "text-sm transition",
                    isActive ? "font-semibold text-[#0f1118]" : "text-[#5b6b8c] group-hover:text-[#0f1118]",
                  ].join(" ")}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 큰 이미지 패널 */}
        <div
          ref={panelRef}
          className={[
            "w-full max-w-5xl transition-all duration-700 delay-300",
            panelVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.10)]" style={{ aspectRatio: "16/8" }}>
            {tabs.map((tab) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={tab.id}
                src={tab.image}
                alt={tab.label}
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                  active === tab.id ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
