'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { trpc } from '~/lib/trpc/client'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Swords,
  Castle,
  Trophy,
  PartyPopper,
  Star,
  AlertCircle,
} from 'lucide-react'
import { SignupRoster } from '~/components/events/signup-roster'
import { SignupForm } from '~/components/events/signup-form'
import { EditEventDialog } from '~/components/events/edit-event-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { useToast } from '~/hooks/use-toast'

// Event type configurations
const EVENT_TYPE_CONFIG = {
  raid: {
    icon: Swords,
    label: 'Raid',
    variant: 'destructive' as const,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  dungeon: {
    icon: Castle,
    label: 'Dungeon',
    variant: 'sky' as const,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  pvp: {
    icon: Trophy,
    label: 'PvP',
    variant: 'peach' as const,
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  social: {
    icon: PartyPopper,
    label: 'Social',
    variant: 'blush' as const,
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  other: {
    icon: Star,
    label: 'Other',
    variant: 'default' as const,
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EventDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [signupDialogOpen, setSignupDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Unwrap params
  const [eventId, setEventId] = useState<string | null>(null)
  params.then(p => setEventId(p.id))

  // Fetch event data
  const {
    data: event,
    isLoading,
    error,
  } = trpc.event.get.useQuery({ id: eventId! }, { enabled: !!eventId })

  // Fetch current member data
  const { data: currentMember } = trpc.member.me.useQuery()

  // Fetch user's characters
  const { data: characters } = trpc.character.list.useQuery()

  // Delete mutation
  const deleteMutation = trpc.event.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Event deleted',
        description: 'The event has been deleted successfully.',
      })
      router.push('/events')
    },
    onError: error => {
      toast({
        title: 'Failed to delete event',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Cancel signup mutation
  const utils = trpc.useUtils()
  const cancelSignupMutation = trpc.event.cancelSignup.useMutation({
    onSuccess: () => {
      toast({
        title: 'Signup cancelled',
        description: 'Your signup has been cancelled.',
      })
      utils.event.get.invalidate({ id: eventId! })
    },
    onError: error => {
      toast({
        title: 'Failed to cancel signup',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  if (isLoading || !eventId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-400">Loading event...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <div className="bg-red-950/50 border border-red-800 rounded-lg p-6">
          <h2 className="text-red-400 font-semibold mb-2">
            Error Loading Event
          </h2>
          <p className="text-red-300/80 text-sm">
            {error?.message || 'Event not found'}
          </p>
          <Button
            onClick={() => router.push('/events')}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const config = EVENT_TYPE_CONFIG[event.eventType]
  const Icon = config.icon

  // Check if user is an officer
  const isOfficer =
    currentMember?.role === 'owner' || currentMember?.role === 'officer'

  // Check if user has signed up
  const userSignup = event.signups.find(signup =>
    characters?.some(char => char.id === signup.character.id)
  )

  // Format date/time
  const eventStart = new Date(event.startsAt)
  const eventEnd = event.endsAt ? new Date(event.endsAt) : null
  const now = new Date()
  const isPast = eventStart < now

  const dateStr = eventStart.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const timeStr = eventStart.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const endTimeStr = eventEnd?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/events')}
            className="text-slate-400 hover:text-slate-100 px-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div
                className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border flex-shrink-0`}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {event.name}
                  </h1>
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {isPast && (
                    <Badge variant="secondary" size="sm">
                      Past
                    </Badge>
                  )}
                </div>

                {event.description && (
                  <p className="text-slate-400 mt-2">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {isOfficer && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => setEditDialogOpen(true)}
              className="text-slate-400 hover:text-slate-100"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Event Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 rounded-lg border border-slate-700 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="text-slate-200">{dateStr}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-500">Time</p>
              <p className="text-slate-200">
                {timeStr}
                {endTimeStr && <span> - {endTimeStr}</span>}
              </p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="text-slate-200">{event.location}</p>
              </div>
            </div>
          )}

          {/* Max Size */}
          {event.maxSize && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Max Participants</p>
                <p className="text-slate-200">{event.maxSize} players</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* User Signup Actions */}
      {!isPast && characters && characters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-lg border border-slate-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                Your Signup
              </h2>
              {userSignup ? (
                <p className="text-sm text-slate-400">
                  Signed up as {userSignup.character.name} ({userSignup.status})
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  You haven't signed up yet
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {userSignup ? (
                <>
                  <Button
                    onClick={() => setSignupDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Update Signup
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      cancelSignupMutation.mutate({
                        eventId: event.id,
                        characterId: userSignup.character.id,
                      })
                    }
                    disabled={cancelSignupMutation.isPending}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  >
                    Cancel Signup
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setSignupDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Sign Up
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* No characters message */}
      {!isPast && (!characters || characters.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold mb-1">
                No Characters Available
              </p>
              <p className="text-yellow-300/80 text-sm">
                You need to add a character to your roster before you can sign
                up for events.
              </p>
              <Button
                onClick={() => router.push('/roster')}
                className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                size="sm"
              >
                Go to Roster
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Signup Roster */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SignupRoster
          signups={event.signups}
          requiredRoles={event.settings?.requiredRoles}
          maxSize={event.maxSize}
        />
      </motion.div>

      {/* Signup Form Dialog */}
      {characters && characters.length > 0 && (
        <SignupForm
          open={signupDialogOpen}
          onOpenChange={setSignupDialogOpen}
          eventId={event.id}
          characters={characters}
          existingSignup={
            userSignup
              ? {
                  id: userSignup.id,
                  characterId: userSignup.character.id,
                  status: userSignup.status,
                  role: userSignup.role,
                  notes: userSignup.notes,
                }
              : undefined
          }
        />
      )}

      {/* Edit Event Dialog */}
      {isOfficer && (
        <EditEventDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          event={{
            id: event.id,
            name: event.name,
            eventType: event.eventType,
            description: event.description,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            location: event.location,
            maxSize: event.maxSize,
            settings: event.settings || {},
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isOfficer && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Delete Event</DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to delete "{event.name}"? This action
                cannot be undone and will remove all signups.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteMutation.isPending}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteMutation.mutate({ id: event.id })}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
