'use client'

import { useEffect, useRef } from 'react'

const SECTION_IDS = [
  'hero',
  'features',
  'rules',
  'knowledge',
  'tasks',
  'advantages',
  'industry',
  'solution',
  'evaluation',
  'dashboard',
  'developer',
]

const WHEEL_THRESHOLD = 40
const SNAP_FALLBACK_DURATION = 1200

/**
 * Wheel-driven section snapping. Hero is taller than one viewport, so it
 * only snaps forward once the user has scrolled past its bottom edge.
 * The footer (and anything after the last tracked section) is left as
 * plain free-scroll.
 */
export default function ScrollSnap() {
  const isAnimatingRef = useRef(false)
  const wheelAccumRef = useRef(0)

  useEffect(() => {
    const getSections = () =>
      SECTION_IDS.map(id => document.getElementById(id)).filter(
        (el): el is HTMLElement => el !== null
      )

    const getCurrentIndex = (sections: HTMLElement[]) => {
      const y = window.scrollY + window.innerHeight / 2
      let index = 0
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= y) index = i
      }
      return index
    }

    const heroEdgeTop = (hero: HTMLElement) =>
      Math.round(hero.offsetTop + hero.offsetHeight - window.innerHeight)

    const isAtHeroEdge = (hero: HTMLElement) =>
      Math.round(window.scrollY) >= heroEdgeTop(hero)

    const isAtPageBottom = () =>
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1

    const releaseLock = () => {
      isAnimatingRef.current = false
      wheelAccumRef.current = 0
    }

    const scrollToTop = (top: number) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        releaseLock()
      }
      const fallback = window.setTimeout(finish, SNAP_FALLBACK_DURATION)
      window.addEventListener(
        'scrollend',
        () => {
          window.clearTimeout(fallback)
          finish()
        },
        { once: true }
      )
      window.scrollTo({ top, behavior: 'smooth' })
    }

    const onWheel = (e: WheelEvent) => {
      // Locked only for the duration of the snap itself: released the
      // instant it settles, no extra cooldown after that.
      if (isAnimatingRef.current) {
        e.preventDefault()
        return
      }

      const sections = getSections()
      if (sections.length === 0) return

      const hero = sections[0]
      const direction = e.deltaY > 0 ? 1 : -1
      const currentIndex = getCurrentIndex(sections)

      if (currentIndex === 0) {
        if (direction < 0) {
          // Scrolling up inside hero: always free scroll.
          wheelAccumRef.current = 0
          return
        }
        if (!isAtHeroEdge(hero)) {
          const edge = heroEdgeTop(hero)
          if (window.scrollY + e.deltaY >= edge) {
            // This tick would cross the edge: stop exactly on it instead
            // of letting native scroll overshoot and snap back.
            e.preventDefault()
            window.scrollTo({ top: edge })
            wheelAccumRef.current = 0
            return
          }
          // Scrolling down, not at hero's bottom edge yet: free scroll.
          wheelAccumRef.current = 0
          return
        }
        // Already resting at the edge: one more scroll moves to features.
      }

      // Past the last tracked section (e.g. footer): allow free scroll,
      // but still allow snapping back up into the last section.
      if (currentIndex === sections.length - 1 && direction > 0 && isAtPageBottom()) {
        wheelAccumRef.current = 0
        return
      }

      wheelAccumRef.current += e.deltaY
      if (Math.abs(wheelAccumRef.current) < WHEEL_THRESHOLD) {
        e.preventDefault()
        return
      }

      e.preventDefault()

      const targetIndex = currentIndex + direction
      if (targetIndex < 0 || targetIndex >= sections.length) {
        wheelAccumRef.current = 0
        return
      }

      // Lock immediately, before scrollTo fires, so any wheel events still
      // queued from the same fast gesture are swallowed by the guard above.
      isAnimatingRef.current = true

      // Scrolling back up into hero: land on its bottom edge (where it
      // meets the next section), not its top — hero is taller than one
      // viewport so jumping to its top would skip back past everything.
      const target = sections[targetIndex]
      const top =
        targetIndex === 0
          ? hero.offsetTop + hero.offsetHeight - window.innerHeight
          : target.offsetTop
      scrollToTop(top)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  return null
}
