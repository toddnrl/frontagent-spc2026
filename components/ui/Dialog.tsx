'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

const overlayClass =
  'pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4'
const panelClass =
  'relative w-full max-w-[400px] rounded-[24px] bg-white p-10 py-14 shadow-[0_30px_80px_-20px_rgba(20,30,50,0.35)]'
const closeButtonClass =
  'absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#9aa1ad] transition-colors duration-150 hover:bg-[#f0f2f5] hover:text-[#16191f]'

export function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !mounted) return null

  return createPortal(
    <div
      className={overlayClass}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={closeButtonClass} onClick={onClose} aria-label="닫기">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
