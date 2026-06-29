'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LoginDialog } from '@/components/LoginDialog'

const headerBaseClass =
  'pointer-events-auto w-full bg-white/60 backdrop-blur-[22px] backdrop-saturate-[180%]'
const navLinkClass =
  '!px-[14px] !py-2 !text-[16px] !font-semibold !text-[#4a5568] !rounded-lg !transition-[background,color] !duration-150 hover:!bg-[#eef4ff] hover:!text-[#2f6bf0]'
const mobileNavLinkClass =
  'w-full rounded-xl px-4 py-3.5 text-center text-[20px] font-bold text-[#16191f]'

const HIDE_AFTER_Y = 80

export default function Header() {
  const [hidden, setHidden] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const lastYRef = useRef(0)

  useEffect(() => {
    if (!mobileMenuOpen) return

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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
      className={`pointer-events-none fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <header id="hd" className={headerBaseClass}>
        <div className="relative mx-auto flex h-[60px] max-w-[1180px] items-center gap-2 px-5 sm:px-6 lg:px-7">
          <a className="mr-0 flex items-center gap-[9px]" href="#">
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
          <button
            className="cursor-pointer rounded-lg border-0 bg-transparent px-[14px] py-[9px] !text-[14.5px] !font-semibold !text-[#4a5568] !transition-[background,color] !duration-150 hover:!bg-[#f0f2f5] hover:!text-[#16191f] max-[900px]:hidden"
            onClick={() => setLoginOpen(true)}
          >
            로그인
          </button>
          <button
            className="hidden h-[42px] w-[42px] cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[9px] border-0 bg-transparent max-[900px]:flex"
            aria-label="메뉴"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <motion.span
              className="block h-[1.8px] w-[20px] rounded-full bg-[#16191f]"
              animate={mobileMenuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.span
              className="block h-[1.8px] w-[20px] rounded-full bg-[#16191f]"
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-[1.8px] w-[20px] rounded-full bg-[#16191f]"
              animate={mobileMenuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'calc(100dvh - 60px)', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col overflow-hidden border-t border-black/10"
            >
              <nav className="flex flex-1 flex-col items-stretch justify-start gap-2 px-5 pt-6">
                <a className={mobileNavLinkClass} href="#features" onClick={() => setMobileMenuOpen(false)}>기능 소개</a>
                <a className={mobileNavLinkClass} href="#integration" onClick={() => setMobileMenuOpen(false)}>연동</a>
                <a className={mobileNavLinkClass} href="#quality" onClick={() => setMobileMenuOpen(false)}>운영 품질</a>
                <a className={mobileNavLinkClass} href="#rules" onClick={() => setMobileMenuOpen(false)}>규칙</a>
                <a className={mobileNavLinkClass} href="#developer" onClick={() => setMobileMenuOpen(false)}>개발자 API</a>
              </nav>
              <div className="shrink-0 px-5 pb-8">
                <button
                  className="w-full cursor-pointer rounded-xl border-0 bg-[var(--blue)] px-4 py-3.5 text-[16px] font-bold text-white"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setLoginOpen(true)
                  }}
                >
                  로그인
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
