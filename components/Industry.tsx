"use client";

import { useState, useEffect, useRef } from "react";
import { pageSectionShellTall } from "./sectionLayout";

const tabs = [
  { id: "board",    label: "라이프스타일",  image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80" },
  { id: "gallery",  label: "뷰티",         image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80" },
  { id: "calendar", label: "일정",         image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" },
  { id: "form",     label: "패션",         image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80" },
  { id: "map",      label: "지도",         image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80" },
  { id: "share",    label: "공유",         image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80" },
  { id: "code",     label: "코드",         image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" },
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
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center bg-transparent px-10 py-12 text-center max-[860px]:px-5 max-[640px]:py-10 max-[480px]:px-4">

        {/* 헤더 */}
        <div
          ref={headerRef}
          className={[
            "w-full transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          <p className="mb-3.5 text-[15px] font-bold text-[#1b1c1e] max-[640px]:mb-2.5 max-[640px]:text-[13px]">업종별 사례</p>
          <h2 className="mx-auto my-3.5 w-full max-w-[760px] text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[900px]:text-[28px] max-[640px]:my-2.5 max-[640px]:text-[26px] max-[640px]:leading-[1.18] max-[380px]:text-[23px]">
            이미 AI로 상담을 줄인 기업들의 진짜 결과가 있습니다
          </h2>
          <p className="mx-auto mb-[30px] max-w-[660px] text-[17px] leading-[1.75] text-[#5b6b8c] max-[640px]:mb-6 max-[640px]:text-[15px] max-[640px]:leading-[1.65]">
            그럴듯한 데모나 가능성에 대한 이야기가 아닙니다. 현장에서 이미 검증된 진짜 AI 사례가 있습니다.<br className="max-[640px]:hidden" />
            업종·규모별 상담량, 문의 처리 방식, 운영 구조가 어떻게 달라졌는지 직접 확인해 보세요.
          </p>
        </div>

        {/* 탭 버튼 그룹 */}
        <div
          ref={tabsRef}
          className={[
            "mb-10 w-full max-w-full transition-all duration-700 delay-150 max-[640px]:mb-6",
            tabsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          <div className="mx-auto flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-full border border-[rgba(0,0,0,0.07)] bg-[#efefef] p-1 [scrollbar-width:none] max-[640px]:w-full [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={[
                    "shrink-0 rounded-full px-[18px] py-[7px] text-[13px] font-semibold transition-all duration-200 focus:outline-none whitespace-nowrap max-[640px]:px-3.5 max-[640px]:py-2 max-[640px]:text-[12px]",
                    isActive
                      ? "bg-[#2f6bf0] text-white shadow-[0_2px_8px_rgba(47,107,240,0.35)]"
                      : "text-[#888] hover:text-[#0f1118]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 큰 이미지 패널 */}
        <div
          ref={panelRef}
          className={[
            "w-full max-w-5xl transition-all duration-700 delay-300 max-[860px]:max-w-full",
            panelVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.10)] max-[640px]:aspect-[4/3] max-[640px]:rounded-[18px] max-[420px]:aspect-[1/1]">
            {tabs.map((tab) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={tab.id}
                src={tab.image}
                alt={tab.label}
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 brightness-110 saturate-[0.92]",
                  active === tab.id ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-white/10" />
          </div>
        </div>

      </div>
    </section>
  );
}
