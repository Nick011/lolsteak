import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '~/lib/utils'

/**
 * Badge Variants - Soft Glow Design System
 *
 * Pill-shaped badges with glassmorphism and subtle glow effects.
 * Multiple color variants matching the pastel accent spectrum.
 */
const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-full',
    'px-3 py-1',
    'text-xs font-medium',
    'transition-all duration-200',
    'border',
  ].join(' '),
  {
    variants: {
      variant: {
        // Default: Lavender glow
        default: [
          'bg-[rgba(var(--glow-lavender),0.15)]',
          'border-[rgba(var(--glow-lavender),0.3)]',
          'text-[rgb(var(--glow-lavender))]',
          'shadow-[0_0_10px_rgba(199,166,255,0.15)]',
        ].join(' '),

        // Secondary: Subtle glass
        secondary: [
          'bg-[rgba(var(--glow-surface),0.5)]',
          'border-[rgba(var(--glow-border),0.3)]',
          'text-[rgba(var(--glow-text-secondary))]',
          'backdrop-blur-sm',
        ].join(' '),

        // Mint: Success/positive
        mint: [
          'bg-[rgba(var(--glow-mint),0.15)]',
          'border-[rgba(var(--glow-mint),0.3)]',
          'text-[rgb(var(--glow-mint))]',
          'shadow-[0_0_10px_rgba(150,255,212,0.15)]',
        ].join(' '),

        // Peach: Warning/attention
        peach: [
          'bg-[rgba(var(--glow-peach),0.15)]',
          'border-[rgba(var(--glow-peach),0.3)]',
          'text-[rgb(var(--glow-peach))]',
          'shadow-[0_0_10px_rgba(255,183,150,0.15)]',
        ].join(' '),

        // Blush: Highlight/special
        blush: [
          'bg-[rgba(var(--glow-blush),0.15)]',
          'border-[rgba(var(--glow-blush),0.3)]',
          'text-[rgb(var(--glow-blush))]',
          'shadow-[0_0_10px_rgba(255,150,200,0.15)]',
        ].join(' '),

        // Sky: Info/neutral
        sky: [
          'bg-[rgba(var(--glow-sky),0.15)]',
          'border-[rgba(var(--glow-sky),0.3)]',
          'text-[rgb(var(--glow-sky))]',
          'shadow-[0_0_10px_rgba(150,200,255,0.15)]',
        ].join(' '),

        // Destructive: Error/danger
        destructive: [
          'bg-[rgba(239,68,68,0.15)]',
          'border-[rgba(239,68,68,0.3)]',
          'text-red-400',
          'shadow-[0_0_10px_rgba(239,68,68,0.15)]',
        ].join(' '),

        // Outline: Transparent with border only
        outline: [
          'bg-transparent',
          'border-[rgba(var(--glow-lavender),0.3)]',
          'text-[rgba(var(--glow-text-secondary))]',
        ].join(' '),

        // Solid variants for high contrast
        'solid-lavender': [
          'bg-[rgb(var(--glow-lavender))]',
          'border-transparent',
          'text-[rgb(var(--glow-void))]',
          'shadow-[0_2px_10px_rgba(199,166,255,0.4)]',
        ].join(' '),

        'solid-mint': [
          'bg-[rgb(var(--glow-mint))]',
          'border-transparent',
          'text-[rgb(var(--glow-void))]',
          'shadow-[0_2px_10px_rgba(150,255,212,0.4)]',
        ].join(' '),

        'solid-peach': [
          'bg-[rgb(var(--glow-peach))]',
          'border-transparent',
          'text-[rgb(var(--glow-void))]',
          'shadow-[0_2px_10px_rgba(255,183,150,0.4)]',
        ].join(' '),
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional dot indicator */
  dot?: boolean
  /** Dot color (defaults to matching variant) */
  dotColor?: string
}

function Badge({
  className,
  variant,
  size,
  dot,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            'animate-pulse',
            dotColor || 'bg-current'
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
