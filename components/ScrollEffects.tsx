'use client'

import { useEffect } from 'react'

export default function ScrollEffects() {
  useEffect(() => {
    // Reveal on scroll
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.52 }
    )
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))

    // Count-up animation
    const countEls = Array.from(document.querySelectorAll<HTMLElement>('.count-up'))
    const countIo = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target as HTMLElement
        const target = parseFloat(el.dataset.target ?? el.textContent ?? '0')
        const suffix = el.dataset.suffix ?? ''
        const duration = parseInt(el.dataset.duration ?? '1200')
        const start = performance.now()
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          el.textContent = (Math.round(target * eased * 10) / 10) + suffix
          if (t < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        countIo.unobserve(el)
      })
    }, { threshold: 0.7 })
    countEls.forEach(el => countIo.observe(el))

    // Parallax + progress bar + active nav + scroll direction
    const progressBar = document.getElementById('progressBar')
    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]'))
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id], [id]'))

    let lastY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY

      // Progress bar
      if (progressBar) {
        const docH = document.documentElement.scrollHeight - window.innerHeight
        progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%'
      }

      // Scroll direction on body
      document.body.dataset.scrollDir = y > lastY ? 'down' : 'up'
      lastY = y

      // Parallax
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax ?? '0.3')
        const rect = el.getBoundingClientRect()
        const offsetY = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed
        el.style.transform = `translateY(${offsetY}px)`
      })

      // Active nav link
      if (navLinks.length > 0) {
        let activeId = ''
        sections.forEach(sec => {
          if (sec.getBoundingClientRect().top <= window.innerHeight * 0.5) {
            activeId = sec.id
          }
        })
        navLinks.forEach(link => {
          const href = link.getAttribute('href')?.slice(1)
          link.classList.toggle('active', href === activeId)
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    // Full page scroll
    const fpSections = Array.from(
      document.querySelectorAll<HTMLElement>('#features, .full-page-section')
    )
    const fullPageScrollDelay = 900
    let lastScrollTime = 0

    function getSectionTop(el: HTMLElement) {
      return Math.round(window.scrollY + el.getBoundingClientRect().top)
    }

    function getActiveFpIndex(): number {
      const midY = window.scrollY + window.innerHeight * 0.5
      for (let i = 0; i < fpSections.length; i++) {
        const top = getSectionTop(fpSections[i])
        const bottom = top + fpSections[i].offsetHeight
        if (midY >= top && midY < bottom) return i
      }
      return -1
    }

    function onWheel(e: WheelEvent) {
      const now = Date.now()
      if (now - lastScrollTime < fullPageScrollDelay) { e.preventDefault(); return }
      const direction = e.deltaY > 0 ? 1 : -1
      const activeIdx = getActiveFpIndex()

      if (activeIdx === -1) return

      const nextIdx = activeIdx + direction
      if (nextIdx < 0) {
        e.preventDefault()
        lastScrollTime = now
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (nextIdx < fpSections.length) {
        e.preventDefault()
        lastScrollTime = now
        window.scrollTo({ top: getSectionTop(fpSections[nextIdx]), behavior: 'smooth' })
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      io.disconnect()
      countIo.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  return null
}
