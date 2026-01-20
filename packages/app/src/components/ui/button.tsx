'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type HTMLMotionProps } from 'framer-motion'

import { cn } from '~/lib/utils'

/**
 * Button Variants - Soft Glow Design System
 *
 * Features:
 * - Glassmorphism backgrounds with blur effects
 * - Animated gradient borders on primary buttons
 * - Soft glow effects on hover/focus
 * - Elastic spring animations on press
 * - Multiple accent color options
 */
const buttonVariants = cva(
  [
    // Base styles
    'relative inline-flex items-center justify-center gap-2',
    'whitespace-nowrap font-medium',
    'transition-all duration-300',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    // Rounded corners (more rounded for soft glow aesthetic)
    'rounded-xl',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary: Gradient background with animated glow
        default: [
          'bg-gradient-to-br from-[rgb(var(--glow-lavender))] via-[rgb(var(--glow-blush))] to-[rgb(var(--glow-lavender))]',
          'text-[rgb(var(--glow-void))] font-semibold',
          'shadow-[0_4px_20px_rgba(199,166,255,0.4)]',
          'hover:shadow-[0_6px_30px_rgba(199,166,255,0.5)]',
          'hover:brightness-110',
          'active:brightness-95',
        ].join(' '),

        // Secondary: Glass effect with subtle border
        secondary: [
          'bg-[rgba(var(--glow-surface),0.6)]',
          'backdrop-blur-md',
          'border border-[rgba(var(--glow-lavender),0.2)]',
          'text-white',
          'shadow-[0_4px_16px_rgba(0,0,0,0.2)]',
          'hover:bg-[rgba(var(--glow-surface),0.8)]',
          'hover:border-[rgba(var(--glow-lavender),0.4)]',
          'hover:shadow-[0_4px_24px_rgba(199,166,255,0.15)]',
        ].join(' '),

        // Outline: Transparent with gradient border
        outline: [
          'bg-transparent',
          'border border-[rgba(var(--glow-lavender),0.3)]',
          'text-[rgb(var(--glow-lavender))]',
          'hover:bg-[rgba(var(--glow-lavender),0.1)]',
          'hover:border-[rgba(var(--glow-lavender),0.5)]',
          'hover:shadow-[0_0_20px_rgba(199,166,255,0.2)]',
        ].join(' '),

        // Ghost: Minimal styling, only visible on hover
        ghost: [
          'bg-transparent',
          'text-[rgba(var(--glow-text-secondary))]',
          'hover:bg-[rgba(var(--glow-surface),0.5)]',
          'hover:text-white',
        ].join(' '),

        // Link: Text only with underline animation
        link: [
          'bg-transparent',
          'text-[rgb(var(--glow-lavender))]',
          'underline-offset-4',
          'hover:underline',
          'hover:text-[rgb(var(--glow-mint))]',
        ].join(' '),

        // Destructive: Red/pink warning style
        destructive: [
          'bg-gradient-to-br from-red-500 via-pink-500 to-red-500',
          'text-white font-semibold',
          'shadow-[0_4px_20px_rgba(239,68,68,0.4)]',
          'hover:shadow-[0_6px_30px_rgba(239,68,68,0.5)]',
          'hover:brightness-110',
        ].join(' '),

        // Accent Mint: Cool green accent
        mint: [
          'bg-gradient-to-br from-[rgb(var(--glow-mint))] to-emerald-400',
          'text-[rgb(var(--glow-void))] font-semibold',
          'shadow-[0_4px_20px_rgba(150,255,212,0.4)]',
          'hover:shadow-[0_6px_30px_rgba(150,255,212,0.5)]',
          'hover:brightness-110',
        ].join(' '),

        // Accent Peach: Warm orange accent
        peach: [
          'bg-gradient-to-br from-[rgb(var(--glow-peach))] to-orange-400',
          'text-[rgb(var(--glow-void))] font-semibold',
          'shadow-[0_4px_20px_rgba(255,183,150,0.4)]',
          'hover:shadow-[0_6px_30px_rgba(255,183,150,0.5)]',
          'hover:brightness-110',
        ].join(' '),

        // Glass: Pure glassmorphism
        glass: [
          'bg-[rgba(var(--glow-abyss),0.4)]',
          'backdrop-blur-xl backdrop-saturate-150',
          'border border-[rgba(255,255,255,0.1)]',
          'text-white',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.2)]',
          'hover:bg-[rgba(var(--glow-abyss),0.6)]',
          'hover:border-[rgba(var(--glow-lavender),0.3)]',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-5 py-2 text-sm',
        sm: 'h-8 px-3 py-1.5 text-xs rounded-lg',
        lg: 'h-12 px-8 py-3 text-base rounded-2xl',
        xl: 'h-14 px-10 py-4 text-lg rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Motion variants for button animations
const buttonMotionVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
}

export interface ButtonProps
  extends
    Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // If asChild, we can't use motion.button, so fall back to Slot
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as React.Ref<HTMLElement>}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>
      )
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        variants={buttonMotionVariants}
        initial="initial"
        whileHover={!disabled && !isLoading ? 'hover' : undefined}
        whileTap={!disabled && !isLoading ? 'tap' : undefined}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
