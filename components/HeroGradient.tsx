'use client'

import { useState, useEffect } from 'react'
import styles from './Hero.module.css'

const THEMES = [
  'linear-gradient(135deg, #38bdf8 0%, #a78bfa 30%, #fb923c 65%, #fbbf24 100%)',
  'linear-gradient(135deg, #09ff00 0%, #fcbcbc 30%, #f870d6 65%, #5dc784 100%)',
]

export default function HeroGradient({ children }: { children: React.ReactNode }) {
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
    <div className={styles.uiGradientWrap}>
      {/* bottom layer: current — always fully visible, no white gap */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: THEMES[cur],
        }}
      />
      {/* top layer: next — fades in on top */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: THEMES[next],
          opacity: nextVisible ? 1 : 0,
          transition: nextVisible ? 'opacity 0.9s ease' : 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
