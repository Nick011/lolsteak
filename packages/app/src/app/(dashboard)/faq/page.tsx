'use client'

import { useState } from 'react'
import { Search, Settings } from 'lucide-react'
import { FaqAccordion } from '~/components/content'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { trpc } from '~/lib/trpc/client'

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: categories, isLoading } = trpc.content.faqCategories.useQuery()

  // Transform data to include items in each category
  const categoriesWithItems =
    categories?.map(category => ({
      ...category,
      items: category.items || [],
    })) || []

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">FAQ</h1>
          <p className="text-slate-400 mt-1">
            Frequently asked questions and answers
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage FAQ
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* FAQ Accordion */}
      {!isLoading && (
        <FaqAccordion
          categories={categoriesWithItems}
          searchQuery={searchQuery}
        />
      )}
    </div>
  )
}
