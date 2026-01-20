'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '~/lib/trpc/client'
import { LinkButton } from '~/components/ui/link-button'

export default function SelectGuildPage() {
  const router = useRouter()
  const guildsQuery = trpc.tenant.listMine.useQuery()

  if (guildsQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        <p className="text-slate-400 mt-4">Loading your guilds...</p>
      </div>
    )
  }

  const guilds = guildsQuery.data ?? []

  // If no guilds, redirect to create
  if (guilds.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-white">
              Guild<span className="text-purple-400">Platform</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-4">
            No Guilds Yet
          </h1>
          <p className="text-slate-400 mb-8">
            Create a guild or join one with an invite code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/guild/create">Create a Guild</LinkButton>
            <LinkButton href="/guild/join" variant="outline">
              Join a Guild
            </LinkButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-white">
              Guild<span className="text-purple-400">Platform</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Select a Guild
          </h1>
          <p className="text-slate-400">Choose which guild to manage</p>
        </div>

        <div className="space-y-3">
          {guilds.map((guild) => (
            <button
              key={guild.id}
              onClick={() => router.push(`/dashboard?guild=${guild.slug}`)}
              className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-purple-500/50 transition-colors text-left flex items-center gap-4"
            >
              {guild.logoUrl ? (
                <img
                  src={guild.logoUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {guild.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-white font-semibold">{guild.name}</p>
                <p className="text-slate-400 text-sm capitalize">
                  {guild.gameType.replace('_', ' ')} • {guild.role}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/guild/create" size="sm">
              Create Another Guild
            </LinkButton>
            <LinkButton href="/guild/join" variant="outline" size="sm">
              Join a Guild
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}
