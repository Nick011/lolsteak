import Link from 'next/link'
import type { ComponentProps } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-purple-600 text-white hover:bg-purple-500 focus:ring-purple-500 shadow-lg shadow-purple-500/25',
  secondary:
    'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500',
  outline:
    'border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 focus:ring-purple-500',
  ghost:
    'text-slate-300 hover:text-white hover:bg-slate-700/50 focus:ring-slate-500',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function LinkButton({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Link>
  )
}
