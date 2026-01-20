'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '~/lib/utils'

interface GradientMeshProps {
  className?: string
  /** Number of blob shapes to render */
  blobCount?: number
  /** Whether to animate the blobs */
  animated?: boolean
  /** Animation speed multiplier (1 = normal, 0.5 = half speed) */
  speed?: number
  /** Whether to add noise texture overlay */
  noise?: boolean
  /** Fixed position fullscreen background */
  fixed?: boolean
}

interface Blob {
  id: number
  color: string
  size: number
  x: number
  y: number
  blur: number
}

const BLOB_COLORS = [
  'rgba(199, 166, 255, 0.4)', // lavender
  'rgba(255, 183, 150, 0.35)', // peach
  'rgba(150, 255, 212, 0.3)', // mint
  'rgba(255, 150, 200, 0.25)', // blush
  'rgba(150, 200, 255, 0.3)', // sky
]

function generateBlobs(count: number): Blob[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: BLOB_COLORS[i % BLOB_COLORS.length],
    size: 300 + Math.random() * 400,
    x: Math.random() * 100,
    y: Math.random() * 100,
    blur: 80 + Math.random() * 60,
  }))
}

/**
 * GradientMesh - Animated gradient mesh background
 *
 * Creates a dreamy, flowing gradient background with animated blob shapes.
 * Uses GSAP for smooth, performant animations.
 */
export function GradientMesh({
  className,
  blobCount = 5,
  animated = true,
  speed = 1,
  noise = true,
  fixed = false,
}: GradientMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])
  const [blobs] = React.useState(() => generateBlobs(blobCount))

  useEffect(() => {
    if (!animated || !containerRef.current) return

    const ctx = gsap.context(() => {
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return

        const duration = (20 + index * 5) / speed
        const delay = index * 2

        // Floating animation
        gsap.to(blob, {
          x: `+=${50 + Math.random() * 100}`,
          y: `+=${30 + Math.random() * 60}`,
          duration,
          delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })

        // Scale breathing animation
        gsap.to(blob, {
          scale: 1 + Math.random() * 0.3,
          duration: duration * 0.7,
          delay: delay + 1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })

        // Rotation animation (subtle)
        gsap.to(blob, {
          rotation: 360,
          duration: duration * 3,
          repeat: -1,
          ease: 'none',
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [animated, speed])

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-none overflow-hidden',
        fixed ? 'fixed inset-0 -z-10' : 'absolute inset-0',
        className
      )}
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(199, 166, 255, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(150, 255, 212, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 183, 150, 0.08) 0%, transparent 60%),
            rgb(15, 10, 31)
          `,
        }}
      />

      {/* Animated blobs */}
      {blobs.map((blob, index) => (
        <div
          key={blob.id}
          ref={el => {
            blobRefs.current[index] = el
          }}
          className="absolute rounded-full will-change-transform"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: `blur(${blob.blur}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Noise texture overlay */}
      {noise && (
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(15, 10, 31, 0.4) 100%)',
        }}
      />
    </div>
  )
}

/**
 * GradientMeshStatic - Non-animated gradient mesh for better performance
 *
 * Use this for pages where animation might be distracting or for
 * reduced motion preferences.
 */
export function GradientMeshStatic({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 -z-10', className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 10% 10%, rgba(199, 166, 255, 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 20%, rgba(255, 183, 150, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 70%, rgba(150, 255, 212, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 20% 80%, rgba(255, 150, 200, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(150, 200, 255, 0.08) 0%, transparent 50%),
            rgb(15, 10, 31)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

export default GradientMesh
