'use client'

import { useEffect, useState } from 'react'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      className={`fixed right-9 bottom-9 z-[999] flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a] text-xl text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-[opacity,transform,background-color] duration-[250ms] hover:bg-[#333] ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100 hover:-translate-y-0.5' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      onClick={scrollToTop}
      aria-label="맨 위로"
    >
      ↑
    </button>
  )
}
