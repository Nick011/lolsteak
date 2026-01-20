'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { LinkButton } from '~/components/ui/link-button'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              Guild<span className="text-purple-400">Platform</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/features"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-20 h-9 bg-slate-800 animate-pulse rounded-lg" />
            ) : session ? (
              <LinkButton href="/dashboard" size="sm">
                Dashboard
              </LinkButton>
            ) : (
              <>
                <LinkButton href="/auth/signin" variant="ghost" size="sm">
                  Sign In
                </LinkButton>
                <LinkButton href="/auth/signin" size="sm">
                  Get Started
                </LinkButton>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
