import { pageSectionShell } from './sectionLayout'

export default function DevSection() {
  const devWrapClass = 'mx-auto w-full max-w-none px-[clamp(24px,5vw,80px)]'
  const devCardClass =
    'reveal w-full max-w-[400px] rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-[26px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-[rgba(47,107,240,0.4)] hover:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.4)]'
  const devIconClass = 'mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-[14px]'
  const devCardTitleClass = 'mb-[7px] text-[17px] font-extrabold'
  const devCardDescClass = 'mb-4 text-sm leading-[1.7] text-[#9aa1b3]'
  const codeClass =
    'overflow-x-auto whitespace-pre rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)] px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-[#c9d1e3]'

  return (
    <section
      className={`${pageSectionShell} bg-[linear-gradient(160deg,#0d1117_0%,#161b2e_50%,#1a1f35_100%)] py-14 text-white`}
      id="developer"
    >
      <div className={`${devWrapClass} text-center`}>
        <span className="reveal inline-flex items-center gap-2 rounded-full border border-[#2a2e3a] bg-[#21242f] px-3.5 py-[7px] text-[12.5px] font-bold text-[#aab2c4]">
          &gt;_ Developer Ecosystem
        </span>
        <h2 className="reveal my-3.5 text-4xl font-extrabold leading-tight tracking-[-0.04em] !text-white max-[900px]:text-[28px]" style={{ marginTop: '18px' }}>
          원하는 환경 어디든,<br />코드 몇 줄로 통합하세요
        </h2>
        <p className="reveal mx-auto mt-3.5 max-w-[620px] text-[17px] text-[#9aa1b3]">
          기존 사내 시스템, 새로운 프로덕트 환경, 혹은 MCP(Model Context Protocol) 환경까지. 개발자를 위한 강력하고 유연한 API 생태계를 지원합니다.
        </p>
      </div>
      <div className={devWrapClass}>
        <div className="mt-12 grid grid-cols-[repeat(3,minmax(0,400px))] justify-center gap-9 max-[900px]:grid-cols-1 max-[900px]:gap-3.5">

          <div className={devCardClass}>
            <div className={devIconClass} style={{ background: 'rgba(124,156,255,.14)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M8 4l-4 8 4 8M16 4l4 8-4 8" stroke="#7c9cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={devCardTitleClass}>RESTful API</div>
            <div className={devCardDescClass}>
              모든 대화 기록, 예약 내역, 설정값에 프로그래밍 방식으로 접근할 수 있는 표준 REST API를 제공합니다.
            </div>
            <div className={codeClass}>
              <span className="text-[#7c9cff]">GET</span>{' '}/v1/conversations{'\n'}
              Authorization: Bearer &lt;token&gt;
            </div>
          </div>

          <div className={devCardClass}>
            <div className={devIconClass} style={{ background: 'rgba(183,148,246,.14)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 12a7 7 0 0 1 12-5M19 12a7 7 0 0 1-12 5" stroke="#b794f6" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2.5" fill="#b794f6"/>
              </svg>
            </div>
            <div className={devCardTitleClass}>Real-time Webhook</div>
            <div className={devCardDescClass}>
              고객 문의 발생, 예약 확정/취소 등 주요 이벤트 발생 시 실시간으로 사내 슬랙이나 서버로 알림을 전송합니다.
            </div>
            <div className={codeClass}>
              {`{
  `}<span className="text-[#b794f6]">&quot;event&quot;</span>{`: `}<span className="text-[#6fcf8e]">&quot;reservation.created&quot;</span>{`,
  `}<span className="text-[#b794f6]">&quot;data&quot;</span>{`: { ... }
}`}
            </div>
          </div>

          <div className={devCardClass}>
            <div className={devIconClass} style={{ background: 'rgba(111,207,142,.14)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="#6fcf8e" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="#6fcf8e" strokeWidth="1.7"/>
              </svg>
            </div>
            <div className={devCardTitleClass}>MCP 프로토콜 지원</div>
            <div className={devCardDescClass}>
              최신 Model Context Protocol 스펙을 지원해, LLM 워크스페이스(Cursor, Claude 등)에서 회사 데이터에 즉시 접근할 수 있습니다.
            </div>
            <div className={codeClass}>
              <span className="text-[#6fcf8e]">mcp connect</span>{' front-ai \\\n  --api-key=$FRONT_API_KEY'}
            </div>
          </div>

        </div>
        <div className="text-center">
          <a
            className="reveal mt-[34px] inline-block rounded-[14px] bg-[linear-gradient(135deg,#2f6bf0,#5b6bf0)] px-9 py-[15px] text-[15px] font-extrabold text-white shadow-[0_8px_24px_-6px_rgba(47,107,240,0.5)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(47,107,240,0.6)]"
            href="#"
          >
            API 문서 보기
          </a>
        </div>
      </div>
    </section>
  )
}
