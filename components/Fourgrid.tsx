import styles from './Fourgrid.module.css'

export default function Section2() {
  return (
    <div className="section" id="integration">
      <h2 className="section-title">필요할 때 언제든지 요청하세요.</h2>

      {/* Top row */}
      <div className={styles.s2TopGrid}>

        {/* Left: Notion 에이전트 */}
        <div className={styles.s2LeftCard}>
          <div className={styles.s2CardLabel}>Notion 에이전트</div>
          <div className={styles.s2CardTitle}>
            작업을 배정하면 Notion<br />에이전트가 작업을 수행합니다.
          </div>
          <button className={styles.s2ArrowBtn}>→</button>

          <div className={styles.quickMenu}>
            <div className={styles.quickMenuTitle}>무엇을 도와드릴까요?</div>
            <div className={styles.quickMenuItem}><span className={styles.qmIcon}>✏️</span>AI 이미지 만들어라</div>
            <div className={styles.quickMenuItem}><span className={styles.qmIcon}>🔍</span>온 분석이에이전트로 정기</div>
            <div className={styles.quickMenuItem}><span className={styles.qmIcon}>📄</span>작업 다켜 설정</div>
          </div>
        </div>

        {/* Right: chat panel */}
        <div className={styles.s2RightCard}>
          <div className={styles.s2RightHeader}>
            <span>슈퍼 업데이트 ∨</span>
            <div className={styles.s2HeaderActions}>
              <span>⤢</span><span>Lx</span><span>✕</span>
            </div>
          </div>

          <div className={styles.s2ChatBody}>
            <div className={styles.s2UserMsg}>
              캔처 스프린트의 업데이트 🗓 연간선에서 🗒 주간 전황<br />
              오늘날미나이 주 주간 상태는 조성화에 수성하여
            </div>

            <div className={styles.s2BotMsg}>
              <div className={styles.s2BotAvatar}>🪖</div>
              <div className={styles.s2BotBubble}>
                프로젝트의 주 업데이트는 소수 작성된 그래프 세비지고, 🗒 작업 드래커의 구두 기록 사항을 보수 반영에 입력했습니다.
                <br /><br />
                <span className={styles.check}>✓ 슬라이드인 이미지 🗒 주간 전황 앙/오늘</span>
                <span className={styles.muted}>최근 Slack 바인어 프로운으로 로복 생성이 🗒 작업 드래커↳ 나 노두 자청이 회사 사항이 마는 것입니다. 나성 상두는 아뎀 님거게도 낳습니다.</span>
                <br /><br />
                <span className={styles.check}>✓ 4개 가기기 모장도리 ↳</span>
              </div>
            </div>
          </div>

          <div className={styles.s2ReactionBar}>
            <span>👍</span><span>👎</span><span>↩</span><span>···</span>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.s2BottomGrid}>

        {/* Search card */}
        <div className={styles.s2SearchCard}>
          <div className={styles.s2SearchHeader}>
            <div className={styles.s2SearchLabel}>기업 통합 검색</div>
            <div className={styles.s2SearchTitle}>
              모든 검색을 한번에.
              <div className="arrow-circle">→</div>
            </div>
          </div>

          <div className={styles.s2SearchBody}>
            <div className={styles.searchTag}>이번 분기 고객 인기 요청</div>

            <div className={styles.searchMeta}>Q: 99+개 결과 🔵 🔴</div>
            <div className={styles.searchSummary}>
              최신 GTM 분석에 따른 이번 분기 현재까지 집수된 상위 고객 요청은 다음과 같습니다.
            </div>

            <div className={styles.searchResultTitle}>기능 요청 상위 10개</div>
            <div className={styles.searchSubtitle}>호스트 도구 및 리스탈 관리 (우선순위 가장 높은 부분)</div>
            <ul className={styles.searchList}>
              <li>동적 가격 자동화: 수요, 지역 이벤트, 경쟁사 활동을 기반으로 AI가 요금을 제안</li>
              <li>어떽 속소의 캘린덤 동기화: 중동 방지 및 초지 예약 방지 등 폴랫폼 간 동화 관리</li>
              <li>숙박객 커뮤니케이션 템플릿화: 도착 전, 체크인, 숙박 후 메시지 마크로로 사용자 지정 가능</li>
            </ul>
          </div>

          <div className={styles.integrationsRow}>
            <div className={styles.intIcon}>💬</div>
            <div className={styles.intIcon}>🔷</div>
            <div className={styles.intIcon}>🟢</div>
            <div className={styles.intIcon}>N</div>
            <div className={styles.intIcon}>📊</div>
            <div className={styles.intIcon}>🔵</div>
            <div className={styles.intPlus}>+</div>
          </div>
        </div>

        {/* Notes card */}
        <div className={styles.s2NotesCard}>
          <div className={styles.s2NotesHeader}>
            <div className={styles.s2NotesLabel}>AI 노트</div>
            <div className={styles.s2NotesTitle}>
              늘 완벽하게 작성되는 회의록.
              <div className="arrow-circle">→</div>
            </div>
          </div>

          <div className={styles.noteDoc}>
            <div className={styles.noteDocHeader}>
              <div className={styles.noteDocTitle}>
                <span>📋</span>
                Joyce &amp; Sam
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.noteDocDate}>6월 2일</span>
                <div className={styles.noteDocActions}>
                  <button className={styles.noteDocAction}>💡 메모</button>
                  <button className={styles.noteDocAction}>📝 링크따기</button>
                  <button className={`${styles.noteDocAction} ${styles.noteActionRed}`}>일시 중지</button>
                  <button className={`${styles.noteDocAction} ${styles.noteActionGreen}`}>진행</button>
                </div>
              </div>
            </div>

            <div className={styles.noteSectionTitle}>현재 진행 상태</div>
            <div className={styles.noteBodyText}>
              Joyce 님이 랜딩 페이지 개선 사항에 대한 업데이트를 공유했습니다. 리서치 결과, 팀은 사회적 증거 증대, 제품 설명 사용 모습 시연, 더 많은 사용 사례 소개라는 세 가지 주요 개선 영역에 도움을 받습니다.
            </div>

            <div className={styles.noteSectionTitle}>타임라인 및 다음 단계</div>
            <ul className={styles.noteChecklist}>
              <li><span className={styles.noteCheck}>✓</span>팀 컬리 일정: 이나뎀</li>
              <li><span className={styles.noteDash}>–</span>다음 주에 테스트 시작</li>
              <li><span className={styles.noteDash}>–</span>테스트 후 자주 출시 목표</li>
            </ul>

            <div style={{ marginTop: '12px' }}>
              <div className={styles.noteSectionTitle}>필요한 리소스</div>
              <div className={styles.noteBodyText}>
                Joyce 님이 몇 가지 잠재적인 리소스 필요 사항을 언급했습니다.
              </div>
              <ul className={styles.noteChecklist}>
                <li><span className={styles.noteDash}>–</span>랜딩 페이지 개선 관련 피드백</li>
              </ul>
            </div>

            <div className={styles.notePhotoWrap}>
              <div className={styles.notePhotoPlaceholder}>
                <div className={styles.notePhotoFace}>👩</div>
                <div className={styles.notePhotoFace}>👱</div>
              </div>
              <div className={styles.noteCallIcon}>
                <div className={`${styles.callBtn} ${styles.callRed}`}>📵</div>
                <div className={`${styles.callBtn} ${styles.callGreen}`}>📞</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
