'use client'

import { useState } from 'react'
import type { Session } from 'next-auth'
import { Sidebar } from './sidebar'

interface MobileNavProps {
  session: Session
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 h-16 flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-4 text-lg font-bold text-white">
          Guild<span className="text-purple-400">Platform</span>
        </span>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50">
            <Sidebar session={session} onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
