'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Badge } from '~/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Swords,
  Castle,
  Trophy,
  PartyPopper,
  Star,
  AlertCircle,
} from 'lucide-react'

// Event type configurations
const EVENT_TYPE_CONFIG = {
  raid: {
    icon: Swords,
    label: 'Raid',
    variant: 'destructive' as const,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  },
  dungeon: {
    icon: Castle,
    label: 'Dungeon',
    variant: 'sky' as const,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  },
  pvp: {
    icon: Trophy,
    label: 'PvP',
    variant: 'peach' as const,
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-[0_0_15px_rgba(255,183,150,0.2)]',
  },
  social: {
    icon: PartyPopper,
    label: 'Social',
    variant: 'blush' as const,
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    glowColor: 'shadow-[0_0_15px_rgba(255,150,200,0.2)]',
  },
  other: {
    icon: Star,
    label: 'Other',
    variant: 'default' as const,
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-[0_0_15px_rgba(199,166,255,0.2)]',
  },
}

interface EventSignup {
  id: string
  status: string
  character: {
    id: string
    name: string
  }
}

interface EventCardProps {
  event: {
    id: string
    name: string
    description: string | null
    eventType: 'raid' | 'dungeon' | 'pvp' | 'social' | 'other'
    startsAt: Date
    endsAt: Date | null
    location: string | null
    maxSize: number | null
    signups: EventSignup[]
  }
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter()
  const config = EVENT_TYPE_CONFIG[event.eventType]
  const Icon = config.icon

  // Calculate signup stats
  const confirmedSignups = event.signups.filter(
    s => s.status === 'confirmed'
  ).length
  const tentativeSignups = event.signups.filter(
    s => s.status === 'tentative'
  ).length
  const totalSignups = confirmedSignups + tentativeSignups

  // Check if event is happening soon (within 24 hours)
  const now = new Date()
  const eventStart = new Date(event.startsAt)
  const hoursUntilEvent =
    (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isHappeningSoon = hoursUntilEvent > 0 && hoursUntilEvent <= 24
  const isPast = eventStart < now

  // Format date/time
  const dateStr = eventStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year:
      eventStart.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
  const timeStr = eventStart.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  // Check if event is full
  const isFull = event.maxSize ? confirmedSignups >= event.maxSize : false

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => router.push(`/events/${event.id}`)}
      className={`
        relative overflow-hidden rounded-lg border p-5 cursor-pointer
        transition-all duration-200
        ${config.bgColor} ${config.borderColor}
        hover:border-opacity-50 ${config.glowColor}
        ${isPast ? 'opacity-60' : ''}
      `}
    >
      {/* Happening soon indicator */}
      {isHappeningSoon && (
        <div className="absolute top-0 right-0 w-2 h-2 m-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`
            p-2 rounded-lg ${config.bgColor} ${config.borderColor} border
            flex-shrink-0
          `}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 truncate">
              {event.name}
            </h3>
            {event.description && (
              <p className="text-slate-400 text-sm line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </div>

        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
      </div>

      {/* Event details */}
      <div className="space-y-2 mb-4">
        {/* Date and time */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="text-slate-300">{dateStr}</span>
          <Clock className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
          <span className="text-slate-300">{timeStr}</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-300">{event.location}</span>
          </div>
        )}
      </div>

      {/* Footer - Signup info */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-slate-300 text-sm font-medium">
            {confirmedSignups}
            {tentativeSignups > 0 && (
              <span className="text-slate-500"> (+{tentativeSignups})</span>
            )}
            {event.maxSize && (
              <span className="text-slate-500"> / {event.maxSize}</span>
            )}
          </span>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {isFull && (
            <Badge variant="peach" size="sm">
              Full
            </Badge>
          )}
          {isHappeningSoon && (
            <Badge variant="destructive" size="sm" dot>
              Soon
            </Badge>
          )}
          {isPast && (
            <Badge variant="secondary" size="sm">
              Past
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}
