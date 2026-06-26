'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

const THEMES = [
  'linear-gradient(135deg, #38bdf8 0%, #a78bfa 30%, #fb923c 65%, #fbbf24 100%)',
  'linear-gradient(135deg, #09ff00 0%, #fcbcbc 30%, #f870d6 65%, #5dc784 100%)',
  'linear-gradient(135deg, #55ddf5 0%, #e93d3d 30%, #c4eb16 65%, #5dc784 100%)'
]

type HeroGradientChildren = ReactNode | ((themeIndex: number) => ReactNode)

export default function HeroGradient({ children }: { children: HeroGradientChildren }) {
  const [cur, setCur] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCur(c => (c + 1) % THEMES.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative mt-[60px] overflow-hidden rounded-[48px] px-[200px] pt-[60px] pb-0">
      {THEMES.map((theme, idx) => (
        <div
          key={idx}
          aria-hidden
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background: theme,
            opacity: idx === cur ? 1 : 0,
            transition: 'opacity 0.9s ease',
          }}
        />
      ))}
      <div className="relative z-[1]">
        {typeof children === 'function' ? children(cur) : children}
      </div>
    </div>
  )
}
