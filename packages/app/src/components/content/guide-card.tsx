'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Eye, User } from 'lucide-react'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

interface GuideCardProps {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string
  tags: string[]
  authorName: string
  createdAt: Date
  updatedAt: Date
  viewCount: number
}

const categoryColors: Record<string, string> = {
  raid_strats: 'mint',
  class_guides: 'sky',
  pvp: 'blush',
  professions: 'peach',
  general: 'default',
}

const categoryLabels: Record<string, string> = {
  raid_strats: 'Raid Strategies',
  class_guides: 'Class Guides',
  pvp: 'PvP',
  professions: 'Professions',
  general: 'General',
}

export function GuideCard({
  title,
  slug,
  excerpt,
  category,
  tags,
  authorName,
  createdAt,
  viewCount,
}: GuideCardProps) {
  const categoryVariant = categoryColors[category] || 'default'
  const categoryLabel = categoryLabels[category] || category

  return (
    <Link href={`/dashboard/guides/${slug}`}>
      <Card
        variant="elevated"
        hoverable
        className="h-full flex flex-col cursor-pointer"
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={categoryVariant as any} size="sm">
              {categoryLabel}
            </Badge>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 text-xs text-slate-500"
            >
              <Eye className="h-3 w-3" />
              <span>{viewCount}</span>
            </motion.div>
          </div>

          <h3 className="text-lg font-semibold text-white line-clamp-2 leading-tight">
            {title}
          </h3>

          {excerpt && (
            <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
              {excerpt}
            </p>
          )}
        </CardHeader>

        <CardContent className="mt-auto pt-0">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" size="sm">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
