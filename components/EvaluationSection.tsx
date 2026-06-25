import styles from "./EvaluationSection.module.css";

/* ------------------------------------------------------------------ */
/*  작은 아이콘들 (SVG)                                                 */
/* ------------------------------------------------------------------ */

function HelpIcon() {
  return (
    <svg
      className={styles.helpIcon}
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
    <div className={styles.mockInner}>
      {/* 상단 지표 카드 2개 */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            CX Score <HelpIcon />
          </div>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>4.6</span>
            <span className={styles.deltaUp}>▲ 0.4</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            해결률 <HelpIcon />
          </div>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>86.2%</span>
            <span className={styles.deltaDown}>▼ 3.4%</span>
          </div>
        </div>
      </div>

      {/* 분석 카드 */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>분석</div>
        <div className={styles.bar}>
          <span style={{ flex: 70, background: "#2BA463" }} />
          <span style={{ flex: 18, background: "#E8A93B" }} />
          <span style={{ flex: 12, background: "#D9534F" }} />
        </div>
        <ul className={styles.sentList}>
          {sentiments.map((s) => (
            <li key={s.label} className={styles.sentItem}>
              <span
                className={styles.sentDot}
                style={{ background: s.color }}
                aria-hidden
              >
                {s.icon}
              </span>
              <span className={styles.sentLabel}>{s.label}</span>
              <span className={styles.sentCount}>
                <strong>{s.count}</strong> <em>{s.pct}</em>
              </span>
              <Chevron />
            </li>
          ))}
        </ul>
      </div>

      {/* CX Score 추이 카드 */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>CX Score 추이</div>
        <div className={styles.chartWrap}>
          <div className={styles.yAxis}>
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
          </div>
          <svg
            className={styles.chart}
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
    <div className={styles.mockInner}>
      {/* AI 분석 패널 */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.headerIcon} aria-hidden>💡</span>
          <span className={styles.headerTitle}>AI 분석</span>
        </div>
        <p className={styles.bodyText}>
          무료 교환 관련 문의에서 ALF가 기존 지식으로 보고 응답했을 때, 상담원이
          개입해 정정 안내하는 사례가 발생중입니다.
        </p>
        <div className={styles.linkRow}>
          <span className={styles.chip}>관련 상담</span>
          <strong className={styles.linkCount}>12건</strong>
          <span className={styles.linkChevron}>
            <Chevron />
          </span>
        </div>
      </div>

      {/* 개선 제안 패널 */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.headerIcon} aria-hidden>📖</span>
          <span className={styles.headerTitle}>개선 제안</span>
          <span className={styles.headerActions}>
            <span className={styles.dots} aria-hidden>•••</span>
            <CheckCircle />
          </span>
        </div>

        <div className={styles.diffRow}>
          <div className={`${styles.diffCol} ${styles.diffOld}`}>
            <p>
              상품 수령 후 <mark className={styles.markRed}>7일 이내</mark>,
              제품의 하자가 있을 경우 무료 교환이 가능합니다.
            </p>
            <p>
              단, 고객님의 단순 변심이나 상품 가치 훼손 시에는 교환이 어려울 수
              있습니다. 자세한 내용은 고객센터로 문의해주시면 친절하게
              안내드리겠습니다. 감사합니다.
            </p>
          </div>
          <div className={`${styles.diffCol} ${styles.diffNew}`}>
            <p>
              상품 수령 후 <mark className={styles.markGreen}>14일 이내</mark>,
              제품의 하자가 있을 경우 무료 교환이 가능합니다.
            </p>
            <p>
              단, 고객님의 단순 변심이나{" "}
              <mark className={styles.markGreen}>포장 개봉</mark> 및 상품 가치
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
    <div className={`${styles.evaluation} section`} id="evaluation">
      <p className={styles.eyebrow}>평가 및 개선</p>
      <h2 className="stitle">스스로 평가하고 개선점을 찾아주는 AI</h2>
      <p className="slead" style={{ marginBottom: '18px' }}>
        AI가 제대로 답변할까? 감으로 관리하면 해결률을 높일 수 없습니다. 채널톡
        AI는 스스로 상담 품질을 진단, 제안합니다.
      </p>

      <div className={styles.grid}>
        {/* 카드 1 */}
        <div className={styles.feature}>
          <div className={`${styles.mock} ${styles.mockGreen}`}>
            <AnalysisMock />
          </div>
          <h3 className={styles.featureTitle}>AI 스스로 평가 및 분석</h3>
          <p className={styles.featureDesc}>
            채널톡 AI는 스스로 상담 품질을 진단, 분석합니다.
          </p>
        </div>

        {/* 카드 2 */}
        <div className={styles.feature}>
          <div className={`${styles.mock} ${styles.mockPurple}`}>
            <SuggestionMock />
          </div>
          <h3 className={styles.featureTitle}>
            AI가 오래된 지식 업데이트 제안까지
            <span className={styles.badge}>출시 예정</span>
          </h3>
          <p className={styles.featureDesc}>
            해결률 99%를 위해 AI가 처리하는 자동화 도구로, 불가능이 없어집니다.
          </p>
        </div>
      </div>
    </div>
  );
}
