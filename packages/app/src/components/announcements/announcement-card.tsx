'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Calendar,
  User,
  Pin,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface AnnouncementCardProps {
  id: string
  title: string
  content: string
  author: {
    name: string
  } | null
  publishedAt: Date | null
  isPinned: boolean
  expiresAt?: Date | null
  isOfficer?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string) => void
}

export function AnnouncementCard({
  id,
  title,
  content,
  author,
  publishedAt,
  isPinned,
  expiresAt,
  isOfficer = false,
  onEdit,
  onDelete,
  onTogglePin,
}: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Truncate content for preview (show first 150 characters)
  const contentPreview =
    content.length > 150 ? content.slice(0, 150) + '...' : content

  const showReadMore = content.length > 150

  const formatDate = (date: Date | null) => {
    if (!date) return 'Draft'
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        dateObj.getFullYear() !== new Date().getFullYear()
          ? 'numeric'
          : undefined,
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isExpired = expiresAt && new Date(expiresAt) < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden rounded-lg border p-5
        transition-all duration-200
        ${
          isPinned
            ? 'bg-purple-500/10 border-purple-600 hover:bg-purple-500/15'
            : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50'
        }
        ${isExpired ? 'opacity-60' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isPinned && (
              <Pin className="h-4 w-4 text-purple-400 flex-shrink-0" />
            )}
            <h3 className="text-lg font-semibold text-white truncate">
              {title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-slate-300">
                {author?.name || 'Unknown'}
              </span>
            </div>

            <span className="text-slate-600">•</span>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatDate(publishedAt)}</span>
            </div>

            {expiresAt && (
              <>
                <span className="text-slate-600">•</span>
                <Badge
                  variant={isExpired ? 'destructive' : 'default'}
                  size="sm"
                >
                  {isExpired ? 'Expired' : 'Expires'} {formatDate(expiresAt)}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Officer Actions */}
        {isOfficer && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onTogglePin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTogglePin(id)}
                className="text-slate-400 hover:text-purple-400 hover:bg-slate-700"
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
              </Button>
            )}

            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(id)}
                className="text-slate-400 hover:text-blue-400 hover:bg-slate-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="text-slate-300 text-sm leading-relaxed mb-3">
        <div className="whitespace-pre-wrap">
          {isExpanded ? content : contentPreview}
        </div>

        {showReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2">
        {isPinned && (
          <Badge variant="blush" size="sm">
            Pinned
          </Badge>
        )}

        {!publishedAt && (
          <Badge variant="default" size="sm">
            Draft
          </Badge>
        )}
      </div>
    </motion.div>
  )
}
