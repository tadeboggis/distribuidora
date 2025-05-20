// src/components/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean
  variant?: 'primary' | 'destructive' | 'outline'
  className?: string
  children?: ReactNode
}

export function Button({
  fullWidth = true,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = [
    'inline-block',
    'py-3',
    'px-6',
    'rounded-lg',
    'font-semibold',
    'shadow-sm',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'transition'
  ].join(' ')

  const variants: Record<string, string> = {
    primary:     'bg-accent text-white hover:bg-accent-dark focus:ring-accent/70',
    destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    outline:     'border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  }

  return (
    <button
      {...props}
      className={[
        base,
        variants[variant] || variants.primary,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      style={{ minWidth: '200px', minHeight: '44px' }}
    >
      {children}
    </button>
  )
}