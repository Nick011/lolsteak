'use client'

import { PlusCircle } from 'lucide-react'
import { GuideList } from '~/components/content'
import { Button } from '~/components/ui/button'
import { trpc } from '~/lib/trpc/client'

export default function GuidesPage() {
  const { data: guides = [], isLoading } = trpc.content.guides.useQuery({
    published: true,
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Guides</h1>
          <p className="text-slate-400 mt-1">
            Community guides and strategies for raids, classes, and more
          </p>
        </div>
        <Button variant="default" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Guide
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-700 rounded w-1/4 mb-4" />
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-700 rounded w-full mb-2" />
              <div className="h-4 bg-slate-700 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

{/* Guide List */}
 {!isLoading && (
 <GuideList
 guides={guides.map(g => ({
 ...g,
 isPublished: g.isPublished,
 author: g.author
 ? {
 id: g.author.id,
 name: g.author.user?.name ?? null,
 email: g.author.user?.email ?? 'Unknown',
 }
 : null,
 }))}
 />
 )}
    </div>
  )
}
