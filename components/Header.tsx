'use client'

import { useEffect, useState } from 'react'
import styles from './Header.module.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 10)
      if (y > lastY && y > 80) setHidden(true)
      else if (y < lastY) setHidden(false)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="progress" id="progressBar" />
      <header className={`${styles.hd}${scrolled ? ' ' + styles.scrolled : ''}${hidden ? ' ' + styles.hidden : ''}`} id="hd">
        <div className={styles.hdIn}>
          <a className={styles.hdLogo} href="#">
            <img
              className={styles.hdMark}
              src="/images/callbee-mark.png"
              alt=""
              aria-hidden="true"
            />
            <span className={styles.hdName}>Call bee</span>
          </a>
          <nav className={styles.hdNav}>
            <a href="#features">기능 소개</a>
            <a href="#integration">연동</a>
            <a href="#quality">운영 품질</a>
            <a href="#rules">규칙</a>
            <a href="#developer">개발자 API</a>
          </nav>
          <div className={styles.hdSp} />
          <a className={styles.hdLogin} href="#">로그인</a>
          <a className={styles.hdCta} href="#cta">무료로 시작하기</a>
          <button className={styles.hdBurger} aria-label="메뉴">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="#16191f" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>
    </>
  )
}
