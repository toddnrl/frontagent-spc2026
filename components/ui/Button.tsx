import type { ButtonHTMLAttributes } from 'react'

const baseClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60'

const variantClass = {
  primary: 'border-0 bg-[var(--blue)] text-white hover:bg-[#2a5fd8]',
  outline:
    'border border-[#d8dce3] bg-white text-[#16191f] hover:bg-[#f5f7fa]',
} as const

const sizeClass = {
  md: 'px-4 py-3',
  lg: 'px-5 py-3.5',
} as const

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClass
  size?: keyof typeof sizeClass
}) {
  return (
    <button
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    />
  )
}
