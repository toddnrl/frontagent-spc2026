import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.ft}>
      <div className="wrap">
        <div className={styles.ftTop}>
          <div>
            <div className={styles.ftBrand}>
              <span className={styles.ftLogo}>
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#2f7bf6"/>
                  <path d="M10 16l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Front Agent
              </span>
            </div>
            <p>Front Agent는 인공지능 기술을 통해 비즈니스 운영 방식을 혁신합니다. 고객 상담, 예약 관리, 업무 자동화를 하나의 플랫폼에서 경험하세요.</p>
          </div>
          <div className={styles.ftCol}>
            <h5>서비스</h5>
            <a href="#features">AI 전화 상담</a>
            <a href="#features">옴니채널 챗봇</a>
            <a href="#integration">예약 자동화</a>
            <a href="#developer">개발자 API</a>
          </div>
          <div className={styles.ftCol}>
            <h5>회사</h5>
            <a href="#">제품 소개</a>
            <a href="#">요금 안내</a>
            <a href="#cta">도입 문의</a>
            <a href="#">고객 사례</a>
          </div>
          <div className={styles.ftCol}>
            <h5>고객 지원</h5>
            <a href="#">support@front.ai</a>
            <a href="#">1588-0000</a>
            <a href="#" style={{ color: '#7c8294' }}>
              평일 09:00 - 18:00<br />(주말/공휴일 휴무)
            </a>
          </div>
        </div>
        <div className={styles.ftBottom}>
          <span>© 2026 Front Agent Inc. All rights reserved.</span>
          <span>
            <a href="#">이용약관</a>
            &nbsp;&nbsp;
            <a href="#">개인정보처리방침</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
