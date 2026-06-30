"use client";

import { useState, useEffect, useRef } from "react";
import { pageSectionShellTall } from "./sectionLayout";

/* ------------------------------------------------------------------ */
/*  목업 컴포넌트                                                        */
/* ------------------------------------------------------------------ */

function CrmMockup() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      {/* 브라우저 상단 바 */}
      <div className="flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.55)] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d08888] opacity-80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c8c870] opacity-80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#88b898] opacity-80" />
        <div className="ml-2 flex-1 rounded-md bg-[rgba(255,255,255,0.55)] px-2 py-0.5 text-[10px] text-[#6a8878]">app.call-bee.io/crm</div>
      </div>

      {/* 고객 프로필 카드 */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.72)] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6a9e80] text-[15px] font-bold text-white">김</div>
          <div>
            <div className="text-[13px] font-bold text-[#182a20]">김지수 고객님</div>
            <div className="text-[11px] text-[#6a8878]">VIP · 38회 상담</div>
          </div>
          <span className="ml-auto rounded-full bg-[#c8e0d0] px-2 py-0.5 text-[10px] font-bold text-[#2d6a4a]">활성</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "최근 구매", value: "3일 전" },
            { label: "총 구매액", value: "₩284,000" },
            { label: "문의 유형", value: "배송 문의" },
            { label: "만족도", value: "4.8 ★" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-[rgba(255,255,255,0.55)] px-2.5 py-1.5">
              <div className="text-[10px] text-[#7a9888]">{label}</div>
              <div className="text-[12px] font-semibold text-[#182a20]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 상담 이력 타임라인 */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.72)] px-3.5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
        <div className="mb-2 text-[11px] font-bold text-[#2d6a4a]">최근 상담 이력</div>
        {[
          { time: "오늘 14:22", text: "배송 지연 문의", tag: "처리완료" },
          { time: "3일 전",    text: "교환 신청",      tag: "완료" },
          { time: "1주 전",    text: "상품 문의",      tag: "완료" },
        ].map(({ time, text, tag }) => (
          <div key={time} className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.05)] py-1.5 last:border-0">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5a9870]" />
            <span className="w-14 shrink-0 text-[11px] text-[#7a9888]">{time}</span>
            <span className="flex-1 text-[11px] text-[#182a20]">{text}</span>
            <span className="rounded-full bg-[#c8e0d0] px-1.5 text-[10px] text-[#2d6a4a]">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      {/* 통화 인터페이스 */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6888b8] text-white text-[13px] font-bold">이</div>
            <div>
              <div className="text-[12px] font-bold text-[#182030]">이민준 고객님</div>
              <div className="flex items-center gap-1 text-[10px] text-[#7888a8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5878b8] animate-pulse" />
                통화 중 · 02:34
              </div>
            </div>
          </div>
          <div className="rounded-full bg-[#dde6f4] px-2.5 py-1 text-[10px] font-bold text-[#3a5a8a]">AI 녹음 중</div>
        </div>
        {/* 음성 웨이브폼 */}
        <svg viewBox="0 0 280 40" className="w-full" fill="none">
          {[4,8,14,10,18,22,16,12,20,24,18,14,22,26,20,16,24,20,14,18,22,16,10,14,8,12,6,10,4,8].map((h, i) => (
            <rect key={i} x={i * 9.5 + 2} y={(40 - h) / 2} width="5" height={h} rx="2.5"
              fill={i > 18 ? "rgba(88,120,184,0.25)" : "#5878b8"} />
          ))}
        </svg>
      </div>

      {/* AI 자동 요약 */}
      <div className="flex-1 rounded-xl bg-[rgba(255,255,255,0.72)] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
        <div className="mb-2.5 flex items-center gap-1.5">
          <span className="text-[13px]">✦</span>
          <span className="text-[11px] font-bold text-[#3a5a8a]">AI 실시간 요약</span>
        </div>
        {[
          "고객이 3일 전 주문한 상품 미수령",
          "택배사 오배송 확인 요청",
          "재발송 또는 환불 원함",
        ].map((item, i) => (
          <div key={i} className="mb-1.5 flex items-start gap-2 text-[11px] text-[#182030]">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5878b8]" />
            {item}
          </div>
        ))}
        <div className="mt-2.5 rounded-lg border border-[rgba(88,120,184,0.3)] bg-[#dde6f4] px-3 py-2">
          <div className="text-[10px] text-[#7888a8]">추천 액션</div>
          <div className="text-[11px] font-semibold text-[#3a5a8a]">택배사 조회 → 재발송 처리</div>
        </div>
      </div>

      {/* 녹음 저장 바 */}
      <div className="flex items-center gap-2 rounded-xl bg-[rgba(255,255,255,0.72)] px-3.5 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#5878b8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#5878b8" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
        <div className="flex-1 h-1.5 rounded-full bg-[#dde6f4]">
          <div className="h-full w-[62%] rounded-full bg-[#5878b8]" />
        </div>
        <span className="text-[10px] text-[#7888a8]">02:34 저장됨</span>
      </div>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.72)] px-3.5 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
        <div className="text-[11px] font-bold text-[#2a2010]">챗 쉐어링 · 실시간 공유</div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#c8a840]" />
          <span className="text-[10px] text-[#9a7820]">연결됨</span>
        </div>
      </div>

      {/* 다이어그램: 플랫폼 ↔ 입점사 */}
      <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-1">
        {/* 플랫폼 패널 */}
        <div className="rounded-xl bg-[rgba(255,255,255,0.72)] p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
          <div className="mb-2 text-[10px] font-bold text-[#8a6020]">🏢 플랫폼</div>
          <div className="space-y-1.5">
            <div className="rounded-lg bg-[#f5ead8] px-2 py-1.5 text-[10px] text-[#5a3a10]">배송 언제 오나요?</div>
            <div className="rounded-lg bg-[rgba(255,255,255,0.75)] px-2 py-1.5 text-[10px] text-[#8a6a30]">입점사로 공유 중…</div>
            <div className="rounded-lg bg-[#f5ead8] px-2 py-1.5 text-[10px] text-[#5a3a10]">교환 가능한가요?</div>
          </div>
        </div>

        {/* 화살표 */}
        <div className="flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M15 8l4 4-4 4" stroke="#c8a840" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M9 16l-4-4 4-4" stroke="#c8a840" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* 입점사 패널 */}
        <div className="rounded-xl bg-[rgba(255,255,255,0.72)] p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
          <div className="mb-2 text-[10px] font-bold text-[#8a6020]">🏪 입점사</div>
          <div className="space-y-1.5">
            <div className="rounded-lg bg-[rgba(255,255,255,0.75)] px-2 py-1.5 text-[10px] text-[#8a6a30]">공유됨 ↗</div>
            <div className="rounded-lg bg-[#f0d888] px-2 py-1.5 text-[10px] text-[#5a3a10]">내일 도착 예정입니다</div>
            <div className="rounded-lg bg-[#f0d888] px-2 py-1.5 text-[10px] text-[#5a3a10]">교환 접수 완료했어요</div>
          </div>
        </div>
      </div>

      {/* 처리 현황 */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.72)] p-3 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-[8px]">
        <div className="mb-2 text-[11px] font-bold text-[#5a4010]">처리 현황</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "공유 문의", value: "128", color: "#c8a840" },
            { label: "처리완료", value: "119", color: "#d87848" },
            { label: "처리율",   value: "93%", color: "#b89030" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg bg-[rgba(255,255,255,0.6)] py-2">
              <div className="text-[15px] font-extrabold" style={{ color }}>{value}</div>
              <div className="text-[10px] text-[#9a8050]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  카드 데이터                                                          */
/* ------------------------------------------------------------------ */

type Card = {
  gradient: string;
  mockup: React.ReactNode;
  title: string;
  desc: string;
};

const cards: Card[] = [
  {
    gradient: "linear-gradient(160deg,#e2ebe5 0%,#d8e2da 55%,#eaf0ec 100%)",
    mockup: <CrmMockup />,
    title: "고객의 맥락을 한 눈에",
    desc: "상담 시작 전부터 CRM 데이터로 고객을 파악하세요.",
  },
  {
    gradient: "linear-gradient(160deg,#dde4ee 0%,#d4dce8 55%,#e6eaf3 100%)",
    mockup: <PhoneMockup />,
    title: "놓치는 내용 없이, 전화 자동 요약·녹음",
    desc: "상담은 자동으로 요약되고, 통화는 녹음으로 남습니다.",
  },
  {
    gradient: "linear-gradient(160deg,#f2ecd5 0%,#eae4c5 55%,#f5f0dd 100%)",
    mockup: <ChatMockup />,
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
          <p className="mb-3.5 text-[15px] font-bold text-[#1b1c1e]">솔루션</p>
          <h2 className="mx-auto mt-3.5 mb-3 w-full text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[900px]:text-[28px]">
            결국, 중요한 상담은 사람이 해야 합니다
          </h2>
          <p className="mx-auto mb-8 max-w-[660px] text-[17px] leading-[1.75] text-[#5b6b8c] lg:mb-14">
            AI가 다 된다고 하지만, 결국 중요한 상담은 사람이 합니다.<br />
            Call bee는 AI 자동화부터 상담원을 위한 솔루션까지, 가장 편한 경험을 하나로 제공합니다.
          </p>
        </div>

        {/* 카드 그리드 */}
        <div ref={panelRef} className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => (
              <article
                key={i}
                className={[
                  "group cursor-pointer transition-all duration-700",
                  staggerDelays[i % 3],
                  panelVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                ].join(" ")}
              >
                <div
                  className="mx-auto h-[355px] w-[350px] overflow-hidden rounded-2xl"
                  style={{ background: card.gradient }}
                >
                  {card.mockup}
                </div>
                <div className="mx-auto w-[350px]">
                  <h4 className="flex items-center gap-2.5 text-[18px] font-extrabold tracking-[-0.01em] lg:min-h-[58px] lg:text-[20px]">
                    {card.title}
                  </h4>
                  <p className="m-0 text-left text-[15px] leading-[1.6] text-[#6a6f76]">
                    {card.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
