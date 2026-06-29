"use client";

import { useState, useEffect, useRef } from "react";
import { pageSectionShellTall } from "./sectionLayout";

/* ------------------------------------------------------------------ */
/*  카드 데이터                                                          */
/* ------------------------------------------------------------------ */

type Card = {
  image: string;
  title: string;
  desc: string;
};

const cards: Card[] = [
  {
    image: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=600&q=70",
    title: "고객의 맥락을 한 눈에",
    desc: "상담 시작 전부터 CRM 데이터로 고객을 파악하세요.",
  },
  {
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=70",
    title: "놓치는 내용 없이, 전화 자동 요약·녹음",
    desc: "상담은 자동으로 요약되고, 통화는 녹음으로 남습니다.",
  },
  {
    image: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=600&q=70",
    title: "플랫폼과 입점사를 위한 챗 쉐어링",
    desc: "플랫폼과 입점사가 하나의 창구에서 협업합니다.",
  },
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

const staggerDelays = ["delay-0", "delay-150", "delay-300"] as const;

export default function SolutionSection() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: panelRef,  visible: panelVisible  } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="solution" className={pageSectionShellTall}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center bg-transparent px-10 py-8 text-center max-[860px]:px-5 lg:py-12">

        {/* 헤더 */}
        <div
          ref={headerRef}
          className={[
            "transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          <p className="mb-3.5 text-center text-[15px] font-bold text-[#1b1c1e]">솔루션</p>
          <h2 className="mx-auto mt-3.5 mb-3 w-full text-center text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[900px]:text-[28px]">
            결국, 중요한 상담은 사람이 해야 합니다
          </h2>
          <p className="mx-auto mb-8 w-full max-w-[660px] text-center text-[17px] leading-[1.75] text-[#5b6b8c] lg:mb-14">
            AI가 다 된다고 하지만, 결국 중요한 상담은 사람이 합니다.<br />
            Call bee는 AI 자동화부터 상담원을 위한 솔루션까지, 가장 편한 경험을 하나로 제공합니다.
          </p>
        </div>

        {/* 카드 그리드 */}
        <div ref={panelRef} className="w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {cards.map((card, i) => (
              <article
                key={i}
                className={[
                  "group cursor-pointer transition-all duration-700",
                  staggerDelays[i % 3],
                  panelVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                ].join(" ")}
              >
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100 lg:aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <h4 className="mb-2.5 flex items-center gap-2.5 text-[18px] font-extrabold tracking-[-0.01em] lg:min-h-[58px] lg:text-[20px]">
                  {card.title}
                </h4>
                <p className="m-0 text-left text-[15px] leading-[1.6] text-[#6a6f76]">
                  {card.desc}
                </p>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
