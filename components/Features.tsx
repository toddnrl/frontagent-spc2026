import styles from './Features.module.css'

export default function Features() {
  return (
    <div className="section" id="quality">
      <h2 className="section-title">필요한 모든 기능을 다 담았습니다</h2>

      {/* Main two-panel card */}
      <div className={styles.s1MainGrid}>
        {/* Left: agent list */}
        <div className={styles.s1Left}>
          <div className={styles.s1LeftLabel}>커스텀 에이전트</div>
          <div className={styles.s1LeftTitle}>반복 작업을 자동화하세요.</div>
          <button className={styles.s1ArrowBtn}>→</button>

          <div className={styles.agentList}>
            <div className={styles.agentItem}>
              <div className={`${styles.agentIcon} ${styles.aiOrange}`}>💬</div>
              <div>
                <div className={styles.agentName}>
                  Q&amp;A 에이전트
                  <span>이미 확보된 정보와 지식을 사용해 질문에 답변합니다.</span>
                </div>
              </div>
            </div>
            <div className={styles.agentItem}>
              <div className={`${styles.agentIcon} ${styles.aiPurple}`}>✅</div>
              <div className={styles.agentName}>작업 배정 에이전트</div>
            </div>
            <div className={styles.agentItem}>
              <div className={`${styles.agentIcon} ${styles.aiTeal}`}>📊</div>
              <div className={styles.agentName}>리포팅 에이전트</div>
            </div>
            <div className={styles.agentItem}>
              <div className={`${styles.agentIcon} ${styles.aiPink}`}>🎨</div>
              <div className={styles.agentName}>나만의 에이전트 만들기</div>
            </div>
          </div>
        </div>

        {/* Right: Q&A UI panel */}
        <div className={styles.s1Right}>
          <div className={styles.qaPanel}>
            <div className={styles.qaPanelHeader}>사무실 관련 Q&amp;A</div>

            <div className={styles.qaItem}>
              <div className={styles.qaAvatar}>👩</div>
              <div className={styles.qaContent}>
                <div className={styles.qaName}>김미현</div>
                <div className={styles.qaQuestion}>경비는 어떻게 제출하나요?</div>
                <div className={styles.qaReplyBadge}>💬 답변 1개</div>
              </div>
            </div>

            <div className={styles.qaItem}>
              <div className={styles.qaAvatar}>👓</div>
              <div className={styles.qaContent}>
                <div className={styles.qaName}>이은지</div>
                <div className={styles.qaQuestion}>등록 기간은 언제인가요?</div>
                <div className={styles.qaReplyBadge}>💬 답변 1개</div>
              </div>
              <div className={styles.qaArrow}>›</div>
            </div>

            <div className={styles.qaItem}>
              <div className={styles.qaAvatar}>🧑</div>
              <div className={styles.qaContent}>
                <div className={styles.qaName}>배수지</div>
                <div className={styles.qaQuestion}>회사 캘린더는 어디에 있나요?</div>
                <div className={styles.qaReplyBadge}>💬 답변 1개</div>
              </div>
            </div>

            <div className={styles.qaItem} style={{ opacity: 0.55 }}>
              <div className={styles.qaAvatar}>👨</div>
              <div className={styles.qaContent}>
                <div className={styles.qaName}>조정석</div>
                <div className={styles.qaQuestion}>프린터 설정 방법은?</div>
              </div>
            </div>
          </div>

          <button className={styles.pauseBtn}>⏸</button>
        </div>
      </div>

      {/* Bottom chips */}
      <div className={styles.s1ChipLabel}>커스텀 에이전트로 할 수 있는 일</div>
      <div className={styles.s1Chips}>
        <div className={styles.chipCard}>
          <div className={`${styles.chipIcon} ${styles.ciBlue}`}>🤖</div>
          <div className={styles.chipText}>제품 피드백 분류 <span className={styles.chipArrow}>→</span></div>
        </div>
        <div className={styles.chipCard}>
          <div className={`${styles.chipIcon} ${styles.ciYellow}`}>💬</div>
          <div className={styles.chipText}>Slack에서 지원 티켓 해결 <span className={styles.chipArrow}>→</span></div>
        </div>
        <div className={styles.chipCard}>
          <div className={`${styles.chipIcon} ${styles.ciRed}`}>🚨</div>
          <div className={styles.chipText}>보안 경고에 더 빠르게 대응 <span className={styles.chipArrow}>→</span></div>
        </div>
        <div className={styles.chipCard}>
          <div className={`${styles.chipIcon} ${styles.ciGreen}`}>📋</div>
          <div className={styles.chipText}>주간 리포트 작업 자동화 <span className={styles.chipArrow}>→</span></div>
        </div>
        <div className={`${styles.chipCard} ${styles.chipCardDark}`}>
          <div className={styles.chipIconCluster}>
            <div className={`${styles.chipIconSm} ${styles.cisA}`}>◀</div>
            <div className={`${styles.chipIconSm} ${styles.cisB}`}>⏱</div>
            <div className={`${styles.chipIconSm} ${styles.cisC}`}>👍</div>
          </div>
          <div className={`${styles.chipText} ${styles.chipTextDark}`}>
            나만의 커스텀 에이전트 만들기 <span className={styles.chipArrow}>→</span>
          </div>
        </div>
      </div>
    </div>
  )
}
