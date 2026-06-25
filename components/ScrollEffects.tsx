'use client'

import { useEffect } from 'react'

export default function ScrollEffects() {
  useEffect(() => {
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

    const progressBar = document.getElementById('progressBar')
    const heroEnd = document.getElementById('hero-end')
    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]'))
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id], [id]'))
    const snapSections = Array.from(
      document.querySelectorAll<HTMLElement>('section[id]:not(#features)')
    )

    let lastY = window.scrollY
    let snapTimer: number | undefined

    const onScroll = () => {
      const y = window.scrollY

      if (progressBar) {
        const docH = document.documentElement.scrollHeight - window.innerHeight
        progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%'
      }

      document.body.dataset.scrollDir = y > lastY ? 'down' : 'up'
      lastY = y

      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax ?? '0.3')
        const rect = el.getBoundingClientRect()
        const offsetY = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed
        el.style.transform = `translateY(${offsetY}px)`
      })

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

      if (heroEnd && snapSections.length > 0) {
        window.clearTimeout(snapTimer)
        snapTimer = window.setTimeout(() => {
          const currentY = window.scrollY
          const heroEndY = heroEnd.getBoundingClientRect().top + currentY
          const nearDocumentEnd =
            currentY + window.innerHeight >= document.documentElement.scrollHeight - 12

          if (currentY < heroEndY - 80 || nearDocumentEnd) return

          const nearest = snapSections.reduce((best, section) => {
            const sectionTop = section.getBoundingClientRect().top
            const bestTop = best.getBoundingClientRect().top
            return Math.abs(sectionTop) < Math.abs(bestTop) ? section : best
          }, snapSections[0])

          const distance = nearest.getBoundingClientRect().top
          if (Math.abs(distance) > window.innerHeight * 0.28) return

          window.scrollTo({
            top: nearest.getBoundingClientRect().top + currentY,
            behavior: 'smooth',
          })
        }, 120)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      countIo.disconnect()
      window.clearTimeout(snapTimer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}
