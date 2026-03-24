'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  AnnouncementFeed,
  CreateAnnouncementDialog,
} from '~/components/announcements'
import { trpc } from '~/lib/trpc/client'
import { Megaphone, Plus } from 'lucide-react'
import { useToast } from '~/hooks/use-toast'

const ANNOUNCEMENTS_PER_PAGE = 20

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null)
  const [offset, setOffset] = useState(0)

  // Fetch announcements (published only for members, all for officers)
  const { data: announcements, isLoading } = trpc.announcements.list.useQuery({
    published: true, // For now, only show published
    limit: ANNOUNCEMENTS_PER_PAGE,
    offset,
  })

  // Get the editing announcement data
  const { data: editingAnnouncement } = trpc.announcements.getById.useQuery(
    { id: editingAnnouncementId || '' },
    { enabled: !!editingAnnouncementId }
  )

  const utils = trpc.useUtils()

  // Delete mutation
  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Announcement deleted',
        description: 'The announcement has been removed.',
      })
      utils.announcements.list.invalidate()
    },
    onError: error => {
      toast({
        title: 'Failed to delete announcement',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Toggle pin mutation
  const togglePinMutation = trpc.announcements.togglePin.useMutation({
    onSuccess: data => {
      toast({
        title: data.isPinned ? 'Announcement pinned' : 'Announcement unpinned',
        description: data.isPinned
          ? 'This announcement will appear at the top.'
          : 'This announcement has been unpinned.',
      })
      utils.announcements.list.invalidate()
    },
    onError: error => {
      toast({
        title: 'Failed to update announcement',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (id: string) => {
    setEditingAnnouncementId(id)
    setCreateDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate({ id })
    }
  }

  const handleTogglePin = (id: string) => {
    togglePinMutation.mutate({ id })
  }

  const handleDialogClose = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingAnnouncementId(null)
    }
  }

  const hasMore =
    announcements && announcements.length === ANNOUNCEMENTS_PER_PAGE

  // TODO: Check if user is officer - for now, assume true for demo
  const isOfficer = true

  // Transform announcements to match the feed's expected format
  const transformedAnnouncements = announcements?.map(announcement => ({
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    publishedAt: announcement.publishedAt,
    isPinned: announcement.isPinned,
    expiresAt: announcement.expiresAt,
    author: announcement.author
      ? {
          id: announcement.author.id,
          name: announcement.author.user?.name || 'Unknown',
        }
      : null,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-600">
            <Megaphone className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Announcements</h1>
            <p className="text-slate-400 mt-1">
              Stay updated with the latest guild news
            </p>
          </div>
        </div>

        {isOfficer && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Announcements Feed */}
      <AnnouncementFeed
        announcements={transformedAnnouncements || []}
        isLoading={isLoading}
        isOfficer={isOfficer}
        hasMore={hasMore}
        onLoadMore={() => setOffset(offset + ANNOUNCEMENTS_PER_PAGE)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
      />

      {/* Create/Edit Dialog */}
      <CreateAnnouncementDialog
        open={createDialogOpen}
        onOpenChange={handleDialogClose}
        editId={editingAnnouncementId || undefined}
        initialData={
          editingAnnouncement
            ? {
                title: editingAnnouncement.title,
                content: editingAnnouncement.content,
                isPinned: editingAnnouncement.isPinned,
                publishedAt: editingAnnouncement.publishedAt,
                expiresAt: editingAnnouncement.expiresAt,
              }
            : undefined
        }
      />
    </div>
  )
}
