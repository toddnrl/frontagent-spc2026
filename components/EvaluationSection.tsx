/* ------------------------------------------------------------------ */
/*  작은 아이콘들 (SVG)                                                 */
/* ------------------------------------------------------------------ */

import { pageSectionShell } from './sectionLayout'

const panelClass =
  "rounded-[14px] bg-[rgba(255,255,255,0.72)] px-[18px] py-4 shadow-[0_4px_16px_rgba(40,50,60,0.06)] backdrop-blur-[8px]";
const panelTitleClass = "mb-3.5 text-sm font-bold";
const panelHeaderClass = "mb-3 flex items-center gap-2";
const featureTitleClass =
  "mb-2.5 flex min-h-[58px] items-center gap-2.5 text-[21px] font-extrabold tracking-[-0.01em]";
const featureDescClass = "m-0 text-[15px] leading-[1.6] text-[#6a6f76]";

function HelpIcon() {
  return (
    <svg
      className="inline-block"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="7" stroke="#C4C8CE" strokeWidth="1.2" />
      <path
        d="M6.4 6.1c0-.9.7-1.5 1.6-1.5.9 0 1.6.6 1.6 1.4 0 .7-.4 1-1 1.4-.5.3-.6.5-.6 1.1"
        stroke="#C4C8CE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.4" r="0.8" fill="#C4C8CE" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="#B0B4BB"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#2BA463" />
      <path
        d="M7.5 12.2l3 3 6-6.4"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  카드 1 목업 — AI 스스로 평가 및 분석                                 */
/* ------------------------------------------------------------------ */

function AnalysisMock() {
  const sentiments = [
    { color: "#2BA463", label: "긍정", count: "10건", pct: "(12.0%)", icon: "✓" },
    { color: "#E8A93B", label: "중립", count: "1,412건", pct: "(12.0%)", icon: "!" },
    { color: "#D9534F", label: "부정", count: "562건", pct: "(12.0%)", icon: "△" },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-3.5">
      {/* 상단 지표 카드 2개 */}
      <div className="grid grid-cols-2 gap-3">
        <div className={panelClass}>
          <div className="mb-2.5 flex items-center gap-[5px] text-[13px] font-semibold text-[#5c616a]">
            CX Score <HelpIcon />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold tracking-[-0.02em]">4.6</span>
            <span className="text-[13px] font-bold text-[#2ba463]">▲ 0.4</span>
          </div>
        </div>
        <div className={panelClass}>
          <div className="mb-2.5 flex items-center gap-[5px] text-[13px] font-semibold text-[#5c616a]">
            해결률 <HelpIcon />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold tracking-[-0.02em]">86.2%</span>
            <span className="text-[13px] font-bold text-[#d9534f]">▼ 3.4%</span>
          </div>
        </div>
      </div>

      {/* 분석 카드 */}
      <div className={panelClass}>
        <div className={panelTitleClass}>분석</div>
        <div className="mb-4 flex h-3 overflow-hidden rounded-md">
          <span style={{ flex: 70, background: "#2BA463" }} />
          <span style={{ flex: 18, background: "#E8A93B" }} />
          <span style={{ flex: 12, background: "#D9534F" }} />
        </div>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {sentiments.map((s) => (
            <li key={s.label} className="flex items-center gap-[9px] text-sm">
              <span
                className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: s.color }}
                aria-hidden
              >
                {s.icon}
              </span>
              <span className="text-[#3a3e44]">{s.label}</span>
              <span className="ml-auto text-[#3a3e44]">
                <strong className="font-bold">{s.count}</strong>{" "}
                <em className="text-[13px] not-italic text-[#9aa0a8]">{s.pct}</em>
              </span>
              <Chevron />
            </li>
          ))}
        </ul>
      </div>

      {/* CX Score 추이 카드 */}
      <div className={panelClass}>
        <div className={panelTitleClass}>CX Score 추이</div>
        <div className="flex h-[120px] gap-2">
          <div className="flex flex-col justify-between py-1 text-xs text-[#aeb3ba]">
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
          </div>
          <svg
            className="h-full flex-1"
            viewBox="0 0 320 120"
            preserveAspectRatio="none"
            aria-hidden
          >
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                x2="320"
                y1={12 + i * 32}
                y2={12 + i * 32}
                stroke="#E6E8EC"
                strokeWidth="1"
              />
            ))}
            <polyline
              points="6,70 52,66 98,78 144,80 190,70 236,58 282,40 314,30"
              fill="none"
              stroke="#2BA463"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="6,76 52,72 98,84 144,82 190,80 236,76 282,72 314,66"
              fill="none"
              stroke="#C4C8CE"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  카드 2 목업 — AI 지식 업데이트 제안                                  */
/* ------------------------------------------------------------------ */

function SuggestionMock() {
  return (
    <div className="flex min-h-0 flex-col gap-3.5">
      {/* AI 분석 패널 */}
      <div className={panelClass}>
        <div className={panelHeaderClass}>
          <span className="text-sm" aria-hidden>💡</span>
          <span className="text-sm font-bold">AI 분석</span>
        </div>
        <p className="mb-3.5 text-sm leading-[1.65] text-[#3a3e44]">
          무료 교환 관련 문의에서 ALF가 기존 지식으로 보고 응답했을 때, 상담원이
          개입해 정정 안내하는 사례가 발생중입니다.
        </p>
        <div className="flex items-center gap-2.5 rounded-[10px] border border-[#ebedf0] px-3.5 py-3">
          <span className="rounded-md bg-[#f2f3f5] px-2 py-[3px] text-xs text-[#6a6f76]">관련 상담</span>
          <strong className="text-sm font-bold">12건</strong>
          <span className="ml-auto inline-flex">
            <Chevron />
          </span>
        </div>
      </div>

      {/* 개선 제안 패널 */}
      <div className={panelClass}>
        <div className={panelHeaderClass}>
          <span className="text-sm" aria-hidden>📖</span>
          <span className="text-sm font-bold">개선 제안</span>
          <span className="ml-auto flex items-center gap-3">
            <span className="text-sm tracking-[1px] text-[#aeb3ba]" aria-hidden>•••</span>
            <CheckCircle />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[10px] bg-[#fdecec] p-3.5 text-[13px] leading-[1.65] text-[#3a3e44] [&_p]:mb-2.5 [&_p]:mt-0 [&_p:last-child]:mb-0">
            <p>
              상품 수령 후 <mark className="rounded-[3px] bg-[#f6b8b6] px-0.5 text-[#3a3e44]">7일 이내</mark>,
              제품의 하자가 있을 경우 무료 교환이 가능합니다.
            </p>
            <p>
              단, 고객님의 단순 변심이나 상품 가치 훼손 시에는 교환이 어려울 수
              있습니다. 자세한 내용은 고객센터로 문의해주시면 친절하게
              안내드리겠습니다. 감사합니다.
            </p>
          </div>
          <div className="rounded-[10px] bg-[#e9f6ee] p-3.5 text-[13px] leading-[1.65] text-[#3a3e44] [&_p]:mb-2.5 [&_p]:mt-0 [&_p:last-child]:mb-0">
            <p>
              상품 수령 후 <mark className="rounded-[3px] bg-[#aee3c2] px-0.5 text-[#3a3e44]">14일 이내</mark>,
              제품의 하자가 있을 경우 무료 교환이 가능합니다.
            </p>
            <p>
              단, 고객님의 단순 변심이나{" "}
              <mark className="rounded-[3px] bg-[#aee3c2] px-0.5 text-[#3a3e44]">포장 개봉</mark> 및 상품 가치
              훼손 시에는 교환이 어려울 수 있습니다. 자세한 내용은 고객센터로
              문의해주시면 친절하게 안내드리겠습니다. 감사합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  섹션                                                               */
/* ------------------------------------------------------------------ */

export default function EvaluationSection() {
  return (
    <section className={`${pageSectionShell} mb-[clamp(40px,7vh,80px)]`} id="evaluation">
    <div
      className="mx-auto flex w-full max-w-[1400px] flex-col justify-center bg-transparent px-10 py-12 text-[#1b1c1e] max-[860px]:px-5"
    >
      <p className="mb-3.5 text-center text-[15px] font-bold text-[#1b1c1e]">평가 및 개선</p>
      <h2 className="mx-auto my-3.5 w-full max-w-none text-center text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[900px]:text-[28px]">
        스스로 평가하고 개선점을 찾아주는 AI
      </h2>
      <p className="mx-auto mb-[18px] w-full max-w-none whitespace-nowrap text-center text-[17px] leading-[1.75] text-[#5b6b8c] max-[860px]:whitespace-normal">
        AI가 제대로 답변할까? 감으로 관리하면 해결률을 높일 수 없습니다. Callbee
        AI는 스스로 상담 품질을 진단, 제안합니다.
      </p>

      <div className="mx-auto grid w-full max-w-[1000px] grid-cols-2 grid-rows-[auto_auto_auto] items-stretch gap-x-[50px] gap-y-0 max-[860px]:grid-cols-1">
        {/* 카드 1 */}
        <div className="grid min-h-0 grid-rows-subgrid row-span-3 max-[860px]:flex max-[860px]:flex-col">
          <div className="mb-[22px] flex min-h-0 max-w-[500px] flex-col overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#d7e7d9_0%,#c9ddd6_55%,#e3ecdf_100%)] p-6">
            <AnalysisMock />
          </div>
          <h3 className={featureTitleClass}>AI 스스로 평가 및 분석</h3>
          <p className={featureDescClass}>
            Callbee AI는 스스로 상담 품질을 진단, 분석합니다.
          </p>
        </div>

        {/* 카드 2 */}
        <div className="grid min-h-0 grid-rows-subgrid row-span-3 max-[860px]:flex max-[860px]:flex-col">
          <div className="mb-[22px] flex min-h-0 max-w-[500px] flex-col overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#e3def0_0%,#ded7ef_55%,#ece6f4_100%)] p-6">
            <SuggestionMock />
          </div>
          <h3 className={featureTitleClass}>
            AI가 오래된 지식 업데이트 제안까지
            <span className="inline-flex items-center rounded-md bg-[#d8f0df] px-[9px] py-[3px] text-xs font-bold text-[#2a8a52]">출시 예정</span>
          </h3>
          <p className={featureDescClass}>
            해결률 99%를 위해 AI가 처리하는 자동화 도구로, 불가능이 없어집니다.
          </p>
        </div>
      </div>
    </div>
    </section>
  );
}
