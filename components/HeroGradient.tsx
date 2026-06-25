'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

const THEMES = [
  'linear-gradient(135deg, #38bdf8 0%, #a78bfa 30%, #fb923c 65%, #fbbf24 100%)',
  'linear-gradient(135deg, #09ff00 0%, #fcbcbc 30%, #f870d6 65%, #5dc784 100%)',
]

export default function HeroGradient({ children }: { children: ReactNode }) {
  const [cur, setCur] = useState(0)
  const [nextVisible, setNextVisible] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setNextVisible(true)
      setTimeout(() => {
        setCur(c => (c + 1) % THEMES.length)
        setNextVisible(false)
      }, 900)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const next = (cur + 1) % THEMES.length

  return (
    <div className="relative mt-[60px] overflow-hidden rounded-[48px] px-[200px] pt-[60px] pb-0">
      {/* bottom layer: current — always fully visible, no white gap */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit]"
        style={{ background: THEMES[cur] }}
      />
      {/* top layer: next — fades in on top */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: THEMES[next],
          opacity: nextVisible ? 1 : 0,
          transition: nextVisible ? 'opacity 0.9s ease' : 'none',
        }}
      />
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  )
}
