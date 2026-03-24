'use client'

import { motion } from 'framer-motion'
import { Calendar, Eye, User, Tag, Edit } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

interface GuideContentProps {
 title: string
 category: string
 tags: string[] | null
 content: string
 authorName: string | null
 createdAt: Date
 updatedAt: Date
 viewCount: number
 canEdit?: boolean
 onEdit?: () => void
}

const categoryLabels: Record<string, string> = {
  raid_strats: 'Raid Strategies',
  class_guides: 'Class Guides',
  pvp: 'PvP',
  professions: 'Professions',
  general: 'General',
}

const categoryColors: Record<string, string> = {
  raid_strats: 'mint',
  class_guides: 'sky',
  pvp: 'blush',
  professions: 'peach',
  general: 'default',
}

export function GuideContent({
  title,
  category,
  tags,
  content,
  authorName,
  createdAt,
  updatedAt,
  viewCount,
  canEdit = false,
  onEdit,
}: GuideContentProps) {
  const categoryLabel = categoryLabels[category] || category
  const categoryVariant = categoryColors[category] || 'default'
  const wasUpdated =
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className="max-w-4xl mx-auto">
        <CardHeader className="space-y-6">
          {/* Category and Edit Button */}
          <div className="flex items-center justify-between">
            <Badge variant={categoryVariant as any}>{categoryLabel}</Badge>
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Guide
              </Button>
            )}
          </div>

          {/* Title */}
          <CardTitle className="text-3xl md:text-4xl">{title}</CardTitle>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {wasUpdated ? 'Updated' : 'Published'}{' '}
                {new Date(
                  wasUpdated ? updatedAt : createdAt
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{viewCount.toLocaleString()} views</span>
            </div>
          </div>

{/* Tags */}
 {tags && tags.length > 0 && (
 <div className="flex items-start gap-2">
 <Tag className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
 <div className="flex flex-wrap gap-2">
 {tags.map(tag => (
 <Badge key={tag} variant="outline" size="sm">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

          <Separator />
        </CardHeader>

        <CardContent>
          {/* Markdown Content */}
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold text-white mt-8 mb-4"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-semibold text-white mt-6 mb-3"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-semibold text-white mt-5 mb-2"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="text-slate-300 leading-relaxed mb-4"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc list-inside text-slate-300 space-y-2 mb-4"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="list-decimal list-inside text-slate-300 space-y-2 mb-4"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li className="text-slate-300" {...props} />
                ),
                a: ({ ...props }) => (
                  <a
                    className="text-purple-400 hover:text-purple-300 underline"
                    {...props}
                  />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-purple-500/50 pl-4 italic text-slate-400 my-4"
                    {...props}
                  />
                ),
                code: ({ className, ...props }) => {
                  const isInline = !className
                  return isInline ? (
                    <code
                      className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300 text-sm"
                      {...props}
                    />
                  ) : (
                    <code
                      className="block bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm text-slate-300"
                      {...props}
                    />
                  )
                },
                pre: ({ ...props }) => (
                  <pre
                    className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4"
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto mb-4">
                    <table
                      className="min-w-full divide-y divide-slate-700"
                      {...props}
                    />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-slate-800/50" {...props} />
                ),
                tbody: ({ ...props }) => (
                  <tbody className="divide-y divide-slate-700" {...props} />
                ),
                tr: ({ ...props }) => <tr {...props} />,
                th: ({ ...props }) => (
                  <th
                    className="px-4 py-2 text-left text-sm font-semibold text-white"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td className="px-4 py-2 text-sm text-slate-300" {...props} />
                ),
                hr: ({ ...props }) => (
                  <hr className="border-slate-700 my-6" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
