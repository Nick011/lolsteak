'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

import { cn } from '~/lib/utils'

/**
 * Card - Soft Glow Design System
 *
 * Glassmorphism card with subtle animations and glow effects.
 * Features floating appearance with soft shadows and gradient borders.
 */

interface CardProps extends HTMLMotionProps<'div'> {
  /** Enable hover lift animation */
  hoverable?: boolean
  /** Add animated gradient border */
  glowBorder?: boolean
  /** Variant style */
  variant?: 'default' | 'elevated' | 'glass' | 'outlined'
}

const cardVariants = {
  default: [
    'bg-[rgba(var(--glow-abyss),0.8)]',
    'backdrop-blur-md',
    'border border-[rgba(var(--glow-lavender),0.1)]',
    'shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
  ].join(' '),
  elevated: [
    'bg-[rgba(var(--glow-surface),0.7)]',
    'backdrop-blur-xl backdrop-saturate-150',
    'border border-[rgba(var(--glow-lavender),0.15)]',
    'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
  ].join(' '),
  glass: [
    'bg-[rgba(var(--glow-abyss),0.4)]',
    'backdrop-blur-2xl backdrop-saturate-200',
    'border border-[rgba(255,255,255,0.08)]',
    'shadow-[0_4px_30px_rgba(0,0,0,0.15)]',
  ].join(' '),
  outlined: [
    'bg-transparent',
    'border border-[rgba(var(--glow-lavender),0.25)]',
    'shadow-none',
  ].join(' '),
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverable = false,
      glowBorder = false,
      variant = 'default',
      children,
      ...props
    },
    ref
  ) => (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-2xl text-white',
        cardVariants[variant],
        hoverable && 'transition-all duration-300',
        glowBorder && 'gradient-border',
        className
      )}
      whileHover={
        hoverable
          ? {
              y: -4,
              boxShadow:
                '0 12px 40px rgba(0,0,0,0.3), 0 0 30px rgba(199,166,255,0.15)',
            }
          : undefined
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'font-semibold leading-none tracking-tight text-white',
      'font-[var(--font-display)]',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-[rgba(var(--glow-text-secondary))]', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
