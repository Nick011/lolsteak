'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '~/lib/trpc/client'
import { Button } from '~/components/ui/button'
import type { Metadata } from 'next'

const gameTypes = [
  { value: 'wow_classic', label: 'WoW Classic / TBC / Wrath' },
  { value: 'wow_retail', label: 'WoW Retail' },
  { value: 'ff14', label: 'Final Fantasy XIV' },
  { value: 'lol', label: 'League of Legends' },
  { value: 'dota2', label: 'Dota 2' },
  { value: 'cs2', label: 'Counter-Strike 2' },
  { value: 'rocket_league', label: 'Rocket League' },
  { value: 'other', label: 'Other' },
] as const

export default function CreateGuildPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [gameType, setGameType] = useState<string>('wow_classic')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const createMutation = trpc.tenant.create.useMutation({
    onSuccess: (tenant) => {
      router.push(`/dashboard?guild=${tenant.slug}`)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleNameChange = (value: string) => {
    setName(value)
    // Auto-generate slug from name
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
    setSlug(autoSlug)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    createMutation.mutate({
      name,
      slug,
      gameType: gameType as 'wow_classic',
      description: description || undefined,
    })
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
            Create Your Guild
          </h1>
          <p className="text-slate-400">
            Set up your guild and start inviting members
          </p>
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
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Guild Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="My Awesome Guild"
                required
                minLength={2}
                maxLength={255}
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Guild URL
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-slate-900/50 border border-r-0 border-slate-700 rounded-l-lg text-slate-500">
                  guildplatform.com/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-r-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="my-guild"
                  required
                  minLength={2}
                  maxLength={100}
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>

            <div>
              <label
                htmlFor="gameType"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Game
              </label>
              <select
                id="gameType"
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {gameTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Tell us about your guild..."
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={createMutation.isPending}
            >
              Create Guild
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-400 text-sm">Have an invite code?</p>
          <Link
            href="/guild/join"
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Join an existing guild
          </Link>
        </div>
      </div>
    </div>
  )
}
