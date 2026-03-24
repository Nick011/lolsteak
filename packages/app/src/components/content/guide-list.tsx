'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Card } from '~/components/ui/card'
import { GuideCard } from './guide-card'

interface Guide {
 id: string
 title: string
 slug: string
 excerpt: string | null
 content: string
 category: string
 tags: string[] | null
 isPublished: boolean
 viewCount: number
 createdAt: Date
 updatedAt: Date
 author: {
 id: string
 name: string | null
 email: string
 } | null
}

interface GuideListProps {
  guides: Guide[]
}

const categories = [
  { value: 'all', label: 'All Guides' },
  { value: 'raid_strats', label: 'Raid Strategies' },
  { value: 'class_guides', label: 'Class Guides' },
  { value: 'pvp', label: 'PvP' },
  { value: 'professions', label: 'Professions' },
  { value: 'general', label: 'General' },
]

export function GuideList({ guides }: GuideListProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

const filteredGuides = guides.filter(guide => {
 const matchesCategory =
 selectedCategory === 'all' || guide.category === selectedCategory
 const matchesSearch =
 searchQuery === '' ||
 guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 guide.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (guide.tags ?? []).some(tag =>
 tag.toLowerCase().includes(searchQuery.toLowerCase())
 )
 return matchesCategory && matchesSearch
 })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const isActive = selectedCategory === category.value
            const count = guides.filter(
              g => category.value === 'all' || g.category === category.value
            ).length

            return (
              <motion.button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className="cursor-pointer transition-all"
                >
                  {category.label}
                  <span className="ml-1.5 opacity-60">({count})</span>
                </Badge>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-400">
        {filteredGuides.length}{' '}
        {filteredGuides.length === 1 ? 'guide' : 'guides'} found
      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <Card className="p-12 text-center" variant="glass">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No Guides Found
          </h3>
          <p className="text-slate-500">
            Try adjusting your filters or search query
          </p>
        </Card>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredGuides.map((guide, index) => (
              <motion.div
                key={guide.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: index * 0.05,
                    duration: 0.2,
                  },
                }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
 <GuideCard
 id={guide.id}
 title={guide.title}
 slug={guide.slug}
 excerpt={guide.excerpt}
 category={guide.category}
 tags={guide.tags}
 authorName={guide.author?.name || guide.author?.email || 'Unknown'}
 createdAt={guide.createdAt}
 updatedAt={guide.updatedAt}
 viewCount={guide.viewCount}
 />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
