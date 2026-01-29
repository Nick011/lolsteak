'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { EventCard } from './event-card'
import { Filter, CalendarPlus, CalendarX } from 'lucide-react'

const EVENT_TYPES = [
  { value: 'raid', label: 'Raid' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'pvp', label: 'PvP' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
] as const

interface EventSignup {
  id: string
  status: string
  character: {
    id: string
    name: string
  }
}

interface Event {
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

interface EventListProps {
  events: Event[]
  isOfficer: boolean
  onCreateEvent?: () => void
}

export function EventList({
  events,
  isOfficer,
  onCreateEvent,
}: EventListProps) {
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  // Filter events
  const filteredEvents = useMemo(() => {
    const now = new Date()

    return events.filter(event => {
      const eventStart = new Date(event.startsAt)
      const isPast = eventStart < now

      // Filter by past/future
      if (!showPastEvents && isPast) {
        return false
      }

      // Filter by event type
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(event.eventType)) {
          return false
        }
      }

      return true
    })
  }, [events, showPastEvents, selectedTypes])

  // Separate upcoming and past events
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date()
    const upcoming: Event[] = []
    const past: Event[] = []

    filteredEvents.forEach(event => {
      const eventStart = new Date(event.startsAt)
      if (eventStart < now) {
        past.push(event)
      } else {
        upcoming.push(event)
      }
    })

    return { upcomingEvents: upcoming, pastEvents: past }
  }, [filteredEvents])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedTypes([])
  }

  const hasActiveFilters = selectedTypes.length > 0

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
          {/* Event type filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
              >
                <Filter className="mr-2 h-4 w-4" />
                Type
                {selectedTypes.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">
                    {selectedTypes.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              <DropdownMenuLabel className="text-slate-400">
                Filter by type
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              {EVENT_TYPES.map(type => (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={() => handleTypeToggle(type.value)}
                  className="text-slate-300 focus:bg-slate-700 focus:text-white capitalize"
                >
                  {type.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Show past events toggle */}
          <Button
            variant="outline"
            onClick={() => setShowPastEvents(!showPastEvents)}
            className={`
              bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white
              ${showPastEvents ? 'border-purple-500/50 bg-purple-500/10' : ''}
            `}
          >
            {showPastEvents ? (
              <>
                <CalendarX className="mr-2 h-4 w-4" />
                Hide Past
              </>
            ) : (
              <>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Show Past
              </>
            )}
          </Button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Create event button (officers only) */}
        {isOfficer && onCreateEvent && (
          <Button
            onClick={onCreateEvent}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Event count */}
      <div className="text-slate-400 text-sm">
        {filteredEvents.length === 0 ? (
          'No events found'
        ) : (
          <>
            {upcomingEvents.length} upcoming event
            {upcomingEvents.length !== 1 ? 's' : ''}
            {showPastEvents && pastEvents.length > 0 && (
              <>
                , {pastEvents.length} past event
                {pastEvents.length !== 1 ? 's' : ''}
              </>
            )}
          </>
        )}
      </div>

      {/* Event list */}
      {filteredEvents.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
          <CalendarX className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No events found
          </h3>
          <p className="text-slate-500">
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : showPastEvents
                ? 'No events to display'
                : 'No upcoming events scheduled'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming events */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Upcoming</h2>
              <motion.div layout className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: index * 0.05,
                          duration: 0.3,
                        },
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Past events (if showing) */}
          {showPastEvents && pastEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Past Events</h2>
              <motion.div layout className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {pastEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: index * 0.05,
                          duration: 0.3,
                        },
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
