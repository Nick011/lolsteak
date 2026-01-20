'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '~/lib/trpc/client'
import { Button } from '~/components/ui/button'

export default function JoinGuildWithCodePage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const [error, setError] = useState('')

  const previewQuery = trpc.tenant.getByInviteCode.useQuery(
    { code },
    { retry: false }
  )

  const joinMutation = trpc.tenant.join.useMutation({
    onSuccess: tenant => {
      router.push(`/dashboard?guild=${tenant.slug}`)
    },
    onError: err => {
      setError(err.message)
    },
  })

  const handleJoin = () => {
    setError('')
    joinMutation.mutate({ code })
  }

  if (previewQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        <p className="text-slate-400 mt-4">Looking up invite...</p>
      </div>
    )
  }

  if (previewQuery.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite</h1>
          <p className="text-slate-400 mb-8">
            This invite code is invalid or has expired.
          </p>
          <Link
            href="/guild/join"
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Enter a different code
          </Link>
        </div>
      </div>
    )
  }

  const guild = previewQuery.data

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-white">
              Guild<span className="text-purple-400">Platform</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            You&apos;ve Been Invited!
          </h1>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center mb-6">
            {guild?.logoUrl ? (
              <img
                src={guild.logoUrl}
                alt=""
                className="w-20 h-20 rounded-xl mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 bg-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {guild?.name.charAt(0)}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-white">{guild?.name}</h2>
            <p className="text-slate-400 capitalize mt-1">
              {guild?.gameType.replace('_', ' ')}
            </p>
          </div>

          <Button
            onClick={handleJoin}
            className="w-full"
            size="lg"
            isLoading={joinMutation.isPending}
          >
            Accept Invite
          </Button>

          <div className="mt-4 text-center">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              No thanks
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
