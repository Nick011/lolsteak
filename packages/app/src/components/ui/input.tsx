'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

import { cn } from '~/lib/utils'

/**
 * Input - Soft Glow Design System
 *
 * Glassmorphism input with animated focus states and soft glow effects.
 */

export interface InputProps extends React.ComponentProps<'input'> {
  /** Show error state */
  error?: boolean
  /** Left icon/element */
  leftElement?: React.ReactNode
  /** Right icon/element */
  rightElement?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftElement, rightElement, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <motion.div
        className={cn(
          'relative flex items-center w-full',
          'rounded-xl',
          'bg-[rgba(var(--glow-abyss),0.6)]',
          'backdrop-blur-md',
          'border transition-all duration-300',
          error
            ? 'border-red-500/50'
            : isFocused
              ? 'border-[rgba(var(--glow-lavender),0.5)]'
              : 'border-[rgba(var(--glow-border),0.3)]',
          isFocused && !error && 'shadow-[0_0_20px_rgba(199,166,255,0.2)]',
          error && 'shadow-[0_0_20px_rgba(239,68,68,0.2)]'
        )}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        {leftElement && (
          <div className="flex items-center pl-3 text-[rgba(var(--glow-text-muted))]">
            {leftElement}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full bg-transparent px-4 py-2',
            'text-white text-sm',
            'placeholder:text-[rgba(var(--glow-text-muted))]',
            'focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            leftElement && 'pl-2',
            rightElement && 'pr-2',
            className
          )}
          ref={ref}
          onFocus={e => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        {rightElement && (
          <div className="flex items-center pr-3 text-[rgba(var(--glow-text-muted))]">
            {rightElement}
          </div>
        )}
      </motion.div>
    )
  }
)
Input.displayName = 'Input'

/**
 * Textarea - Soft Glow Design System
 */
export interface TextareaProps extends React.ComponentProps<'textarea'> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <motion.div
        className={cn(
          'relative w-full',
          'rounded-xl',
          'bg-[rgba(var(--glow-abyss),0.6)]',
          'backdrop-blur-md',
          'border transition-all duration-300',
          error
            ? 'border-red-500/50'
            : isFocused
              ? 'border-[rgba(var(--glow-lavender),0.5)]'
              : 'border-[rgba(var(--glow-border),0.3)]',
          isFocused && !error && 'shadow-[0_0_20px_rgba(199,166,255,0.2)]',
          error && 'shadow-[0_0_20px_rgba(239,68,68,0.2)]'
        )}
        animate={{
          scale: isFocused ? 1.005 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        <textarea
          className={cn(
            'flex min-h-[120px] w-full bg-transparent px-4 py-3',
            'text-white text-sm',
            'placeholder:text-[rgba(var(--glow-text-muted))]',
            'focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none',
            className
          )}
          ref={ref}
          onFocus={e => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
      </motion.div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Input, Textarea }
