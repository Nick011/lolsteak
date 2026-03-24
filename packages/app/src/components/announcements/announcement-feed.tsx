'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AnnouncementCard } from './announcement-card'
import { Button } from '~/components/ui/button'
import { Megaphone } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
  } | null
  publishedAt: Date | null
  isPinned: boolean
  expiresAt?: Date | null
}

interface AnnouncementFeedProps {
  announcements: Announcement[]
  isLoading?: boolean
  isOfficer?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string) => void
}

export function AnnouncementFeed({
  announcements,
  isLoading = false,
  isOfficer = false,
  hasMore = false,
  onLoadMore,
  onEdit,
  onDelete,
  onTogglePin,
}: AnnouncementFeedProps) {
  // Separate pinned and regular announcements
  const pinnedAnnouncements = announcements.filter(a => a.isPinned)
  const regularAnnouncements = announcements.filter(a => !a.isPinned)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-lg border border-slate-700 p-5 animate-pulse"
          >
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-4 bg-slate-700 rounded w-2/3 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
        <Megaphone className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-400 mb-2">
          No Announcements Yet
        </h3>
        <p className="text-slate-500">
          {isOfficer
            ? 'Create your first announcement to get started.'
            : 'Check back later for updates from your guild officers.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pinned Announcements Section */}
      {pinnedAnnouncements.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-purple-500 rounded-full" />
            Pinned Announcements
          </h2>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pinnedAnnouncements.map(announcement => (
                <AnnouncementCard
                  key={announcement.id}
                  {...announcement}
                  isOfficer={isOfficer}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Regular Announcements Section */}
      {regularAnnouncements.length > 0 && (
        <div>
          {pinnedAnnouncements.length > 0 && (
            <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-slate-600 rounded-full" />
              Recent Announcements
            </h2>
          )}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {regularAnnouncements.map(announcement => (
                <AnnouncementCard
                  key={announcement.id}
                  {...announcement}
                  isOfficer={isOfficer}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-4"
        >
          <Button
            variant="ghost"
            onClick={onLoadMore}
            className="text-purple-400 hover:text-purple-300 hover:bg-slate-800"
          >
            Load More
          </Button>
        </motion.div>
      )}
    </div>
  )
}
