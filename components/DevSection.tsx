import styles from './DevSection.module.css'

export default function DevSection() {
  return (
    <section className={styles.dev} id="developer">
      <div className={`${styles.devWrap} center`}>
        <span className={`${styles.devEye} reveal`}>&gt;_ Developer Ecosystem</span>
        <h2 className={`stitle reveal ${styles.devH2}`} style={{ marginTop: '18px' }}>
          원하는 환경 어디든,<br />코드 몇 줄로 통합하세요
        </h2>
        <p className={`${styles.devLead} reveal`}>
          기존 사내 시스템, 새로운 프로덕트 환경, 혹은 MCP(Model Context Protocol) 환경까지. 개발자를 위한 강력하고 유연한 API 생태계를 지원합니다.
        </p>
      </div>
      <div className={styles.devWrap}>
        <div className={styles.devcards}>

          <div className={`${styles.devcard} reveal`}>
            <div className={styles.devcardIc} style={{ background: 'rgba(124,156,255,.14)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M8 4l-4 8 4 8M16 4l4 8-4 8" stroke="#7c9cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.devcardT}>RESTful API</div>
            <div className={styles.devcardD}>
              모든 대화 기록, 예약 내역, 설정값에 프로그래밍 방식으로 접근할 수 있는 표준 REST API를 제공합니다.
            </div>
            <div className={styles.code}>
              <span className={styles.codeM}>GET</span>{' '}/v1/conversations{'\n'}
              Authorization: Bearer &lt;token&gt;
            </div>
          </div>

          <div className={`${styles.devcard} reveal`}>
            <div className={styles.devcardIc} style={{ background: 'rgba(183,148,246,.14)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 12a7 7 0 0 1 12-5M19 12a7 7 0 0 1-12 5" stroke="#b794f6" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2.5" fill="#b794f6"/>
              </svg>
            </div>
            <div className={styles.devcardT}>Real-time Webhook</div>
            <div className={styles.devcardD}>
              고객 문의 발생, 예약 확정/취소 등 주요 이벤트 발생 시 실시간으로 사내 슬랙이나 서버로 알림을 전송합니다.
            </div>
            <div className={styles.code}>
              {`{
  `}<span className={styles.codeP}>&quot;event&quot;</span>{`: `}<span className={styles.codeG}>&quot;reservation.created&quot;</span>{`,
  `}<span className={styles.codeP}>&quot;data&quot;</span>{`: { ... }
}`}
            </div>
          </div>

          <div className={`${styles.devcard} reveal`}>
            <div className={styles.devcardIc} style={{ background: 'rgba(111,207,142,.14)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="#6fcf8e" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="#6fcf8e" strokeWidth="1.7"/>
              </svg>
            </div>
            <div className={styles.devcardT}>MCP 프로토콜 지원</div>
            <div className={styles.devcardD}>
              최신 Model Context Protocol 스펙을 지원해, LLM 워크스페이스(Cursor, Claude 등)에서 회사 데이터에 즉시 접근할 수 있습니다.
            </div>
            <div className={styles.code}>
              <span className={styles.codeG}>mcp connect</span>{' front-ai \\\n  --api-key=$FRONT_API_KEY'}
            </div>
          </div>

        </div>
        <div className="center">
          <a className={`${styles.devCta} reveal`} href="#">API 문서 보기</a>
        </div>
      </div>
    </section>
  )
}
