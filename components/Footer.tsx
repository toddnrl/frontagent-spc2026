export default function Footer() {
  const footerLinkClass = 'block py-[5px] text-sm text-[#718096] transition-colors duration-150 hover:text-[#e2e8f0]'
  const footerHeadingClass = 'mb-3.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#a0aec0]'

  return (
    <footer className="bg-[linear-gradient(160deg,#0d1117,#131925)] py-[64px] pb-9 text-sm text-[#aeb4c2]">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="mb-[38px] grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[26px]">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5 text-[19px] font-extrabold text-white">
              <span className="inline-flex items-center gap-1.5">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#2f7bf6"/>
                  <path d="M10 16l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Front Agent
              </span>
            </div>
            <p className="max-w-[280px] text-[13.5px] leading-[1.75] text-[#8a90a0]">
              Front Agent는 인공지능 기술을 통해 비즈니스 운영 방식을 혁신합니다. 고객 상담, 예약 관리, 업무 자동화를 하나의 플랫폼에서 경험하세요.
            </p>
          </div>
          <div>
            <h5 className={footerHeadingClass}>서비스</h5>
            <a className={footerLinkClass} href="#features">AI 전화 상담</a>
            <a className={footerLinkClass} href="#features">옴니채널 챗봇</a>
            <a className={footerLinkClass} href="#integration">예약 자동화</a>
            <a className={footerLinkClass} href="#developer">개발자 API</a>
          </div>
          <div>
            <h5 className={footerHeadingClass}>회사</h5>
            <a className={footerLinkClass} href="#">제품 소개</a>
            <a className={footerLinkClass} href="#">요금 안내</a>
            <a className={footerLinkClass} href="#cta">도입 문의</a>
            <a className={footerLinkClass} href="#">고객 사례</a>
          </div>
          <div>
            <h5 className={footerHeadingClass}>고객 지원</h5>
            <a className={footerLinkClass} href="#">support@front.ai</a>
            <a className={footerLinkClass} href="#">1588-0000</a>
            <a className={footerLinkClass} href="#" style={{ color: '#7c8294' }}>
              평일 09:00 - 18:00<br />(주말/공휴일 휴무)
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] pt-[22px] text-[13px] text-[#4a5568]">
          <span>© 2026 Front Agent Inc. All rights reserved.</span>
          <span>
            <a className="text-[#9aa1b3] hover:text-[#e2e8f0]" href="#">이용약관</a>
            &nbsp;&nbsp;
            <a className="text-[#9aa1b3] hover:text-[#e2e8f0]" href="#">개인정보처리방침</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
