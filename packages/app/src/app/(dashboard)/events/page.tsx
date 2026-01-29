'use client'

import { trpc } from '~/lib/trpc/client'
import { EventList } from '~/components/events'
import { Calendar } from 'lucide-react'

export default function EventsPage() {
  const { data: events, isLoading, error } = trpc.event.list.useQuery()
  const { data: currentMember } = trpc.member.me.useQuery()

  const isOfficer =
    currentMember?.role === 'owner' || currentMember?.role === 'officer'

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-950/50 border border-red-800 rounded-lg p-6">
          <h2 className="text-red-400 font-semibold mb-2">
            Error Loading Events
          </h2>
          <p className="text-red-300/80 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
          <p className="text-slate-400">
            {isLoading
              ? 'Loading events...'
              : `${events?.length || 0} event${events?.length !== 1 ? 's' : ''} scheduled`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      {/* Event List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-4" />
          <p className="text-slate-400">Loading events...</p>
        </div>
      ) : events && events.length > 0 ? (
        <EventList
          events={events}
          isOfficer={isOfficer}
          onCreateEvent={() => {
            // TODO: Open create event dialog
            console.log('Create event clicked')
          }}
        />
      ) : (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No Events Scheduled
          </h3>
          <p className="text-slate-500">
            {isOfficer
              ? 'Create your first event to get started'
              : 'Check back later for upcoming events'}
          </p>
        </div>
      )}
    </div>
  )
}
