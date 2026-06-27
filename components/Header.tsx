'use client'

import { useEffect, useRef, useState } from 'react'

const headerBaseClass =
  'pointer-events-auto w-[calc(100%-32px)] max-w-[1180px] rounded-full border border-black/10 bg-white/78 shadow-lg shadow-gray-900/10 ring-1 ring-white/70 backdrop-blur-[22px] backdrop-saturate-[180%]'
const navLinkClass =
  '!px-[14px] !py-2 !text-[16px] !font-semibold !text-[#4a5568] !rounded-lg !transition-[background,color] !duration-150 hover:!bg-[#eef4ff] hover:!text-[#2f6bf0]'

const HIDE_AFTER_Y = 80

export default function Header() {
  const [hidden, setHidden] = useState(false)
  const lastYRef = useRef(0)

  useEffect(() => {
    lastYRef.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastYRef.current
      lastYRef.current = y

      if (y < HIDE_AFTER_Y) {
        setHidden(false)
        return
      }
      setHidden(goingDown)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`pointer-events-none fixed top-4 left-0 right-0 z-[100] flex justify-center transition-transform duration-300 ${
        hidden ? '-translate-y-[calc(100%+32px)]' : 'translate-y-0'
      }`}
    >
      <header id="hd" className={headerBaseClass}>
        <div className="relative flex h-[60px] max-w-full items-center gap-2 px-5 sm:px-6 lg:px-7">
          <a className="mr-0 flex items-center gap-[9px]" href="#">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2f6bf0,#5b6bf0)] text-sm font-black text-white shadow-[0_4px_12px_-6px_rgba(47,107,240,.8)]"
              aria-hidden="true"
            >
              C
            </span>
            <span className="!text-[19px] font-extrabold !tracking-[-0.03em]">Call bee</span>
          </a>
          <nav className="absolute left-1/2 flex -translate-x-1/2 gap-0.5 max-[900px]:hidden">
            <a className={navLinkClass} href="#features">기능 소개</a>
            <a className={navLinkClass} href="#integration">연동</a>
            <a className={navLinkClass} href="#quality">운영 품질</a>
            <a className={navLinkClass} href="#rules">규칙</a>
            <a className={navLinkClass} href="#developer">개발자 API</a>
          </nav>
          <div className="flex-1" />
          <a
            className="rounded-lg px-[14px] py-[9px] !text-[14.5px] !font-semibold !text-[#4a5568] !transition-[background,color] !duration-150 hover:!bg-[#f0f2f5] hover:!text-[#16191f] max-[900px]:hidden"
            href="#"
          >
            로그인
          </a>
          <button className="hidden h-[42px] w-[42px] cursor-pointer place-items-center rounded-[9px] border-0 bg-transparent max-[900px]:grid" aria-label="메뉴">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="#16191f" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>
    </div>
  )
}
