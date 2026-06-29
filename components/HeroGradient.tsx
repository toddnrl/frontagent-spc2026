'use client'

import type { ReactNode } from 'react'

export default function HeroGradient({
  themes,
  activeIndex,
  children,
}: {
  themes: string[]
  activeIndex: number
  children: ReactNode
}) {
  return (
    <div className="relative mx-auto mt-[60px] w-[900px] max-w-full overflow-hidden rounded-[48px] px-[clamp(24px,12vw,200px)] pt-[60px] pb-0">
      {themes.map((theme, idx) => (
        <div
          key={idx}
          aria-hidden
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background: theme,
            opacity: idx === activeIndex ? 1 : 0,
            transition: 'opacity 0.9s ease',
          }}
        />
      ))}
      <div className="relative z-[1] w-full">{children}</div>
    </div>
  )
}
