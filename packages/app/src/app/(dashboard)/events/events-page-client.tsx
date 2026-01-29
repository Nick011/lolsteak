'use client'

import { useState } from 'react'
import { EventList, CreateEventDialog } from '~/components/events'
import { trpc } from '~/lib/trpc/client'

export function EventsPageClient() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch events
  const eventsQuery = trpc.event.list.useQuery({ includesPast: true })

  // Check if user is an officer (you'll need to get this from your auth/member context)
  // For now, let's assume we can get it from the member query or session
  const isOfficer = true // TODO: Get this from actual auth context

  if (eventsQuery.isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Events</h1>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    )
  }

  if (eventsQuery.error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Events</h1>
        <div className="bg-red-500/10 rounded-lg border border-red-500/50 p-6">
          <p className="text-red-400">
            Error loading events: {eventsQuery.error.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Events</h1>

      <EventList
        events={eventsQuery.data || []}
        isOfficer={isOfficer}
        onCreateEvent={() => setCreateDialogOpen(true)}
      />

      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
