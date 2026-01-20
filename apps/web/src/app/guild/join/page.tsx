'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '~/lib/trpc/client'
import { Button } from '~/components/ui/button'

export default function JoinGuildPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const previewQuery = trpc.tenant.getByInviteCode.useQuery(
    { code },
    {
      enabled: code.length >= 6,
      retry: false,
    }
  )

  const joinMutation = trpc.tenant.join.useMutation({
    onSuccess: (tenant) => {
      router.push(`/dashboard?guild=${tenant.slug}`)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    joinMutation.mutate({ code })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-white">
              Guild<span className="text-purple-400">Platform</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Join a Guild</h1>
          <p className="text-slate-400">Enter an invite code to join</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Invite Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="XXXXXXXX"
                required
                minLength={6}
              />
            </div>

            {previewQuery.data && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  {previewQuery.data.logoUrl && (
                    <img
                      src={previewQuery.data.logoUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg"
                    />
                  )}
                  <div>
                    <p className="text-white font-semibold">
                      {previewQuery.data.name}
                    </p>
                    <p className="text-slate-400 text-sm capitalize">
                      {previewQuery.data.gameType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {previewQuery.error && (
              <p className="text-red-400 text-sm text-center">
                {previewQuery.error.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={joinMutation.isPending}
              disabled={!previewQuery.data}
            >
              Join Guild
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-400 text-sm">Want to create your own?</p>
          <Link
            href="/guild/create"
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Create a new guild
          </Link>
        </div>
      </div>
    </div>
  )
}
