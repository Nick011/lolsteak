'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { trpc } from '~/lib/trpc/client'
import { useToast } from '~/hooks/use-toast'

// Form validation schema
const createEventSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255),
    eventType: z.enum(['raid', 'dungeon', 'pvp', 'social', 'other'] as const),
    description: z.string().optional(),
    startsAt: z.string().min(1, 'Start date/time is required'),
    endsAt: z.string().optional(),
    location: z.string().max(255).optional(),
    maxSize: z.number().int().positive('Must be a positive number').optional(),
    // Role requirements stored in settings
    tanksNeeded: z.number().int().min(0).optional(),
    healersNeeded: z.number().int().min(0).optional(),
    dpsNeeded: z.number().int().min(0).optional(),
    // Soft reserve settings
    softReserveEnabled: z.boolean().optional(),
    softReserveLimit: z.number().int().min(1).optional(),
  })
  .refine(
    data => {
      // If endsAt is provided, it must be after startsAt
      if (data.endsAt && data.startsAt) {
        return new Date(data.endsAt) > new Date(data.startsAt)
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['endsAt'],
    }
  )

type CreateEventFormValues = z.infer<typeof createEventSchema>

const EVENT_TYPES = [
  { value: 'raid', label: 'Raid' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'pvp', label: 'PvP' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
] as const

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEventDialog({
  open,
  onOpenChange,
}: CreateEventDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showRoleRequirements, setShowRoleRequirements] = useState(false)
  const [showSoftReserveSettings, setShowSoftReserveSettings] = useState(false)

  const form = useForm<CreateEventFormValues>({
    // @ts-expect-error - Zod v4 compatibility issue with react-hook-form resolver
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      eventType: undefined,
      description: '',
      startsAt: '',
      endsAt: '',
      location: '',
      maxSize: undefined,
      tanksNeeded: undefined,
      healersNeeded: undefined,
      dpsNeeded: undefined,
      softReserveEnabled: false,
      softReserveLimit: undefined,
    },
  })

  const utils = trpc.useUtils()
  const createMutation = trpc.event.create.useMutation({
    onSuccess: event => {
      toast({
        title: 'Event created',
        description: `"${event.name}" has been created successfully.`,
      })
      form.reset()
      onOpenChange(false)
      // Invalidate and refetch events list
      utils.event.list.invalidate()
      // Optionally navigate to the event detail page
      // router.push(`/events/${event.id}`)
    },
    onError: error => {
      toast({
        title: 'Failed to create event',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CreateEventFormValues) => {
    // Build settings object with role requirements if any are specified
    const settings: Record<string, unknown> = {}

    if (data.tanksNeeded || data.healersNeeded || data.dpsNeeded) {
      settings.roleRequirements = {
        tanks: data.tanksNeeded || 0,
        healers: data.healersNeeded || 0,
        dps: data.dpsNeeded || 0,
      }
    }

    // Add soft reserve settings if enabled
    if (data.softReserveEnabled) {
      settings.softReserveEnabled = true
      if (data.softReserveLimit) {
        settings.softReserveLimit = data.softReserveLimit
      }
    }

    // Transform form data to API input format
    createMutation.mutate({
      name: data.name,
      eventType: data.eventType,
      description: data.description || undefined,
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
      location: data.location || undefined,
      maxSize: data.maxSize ? Number(data.maxSize) : undefined,
      settings: Object.keys(settings).length > 0 ? settings : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Create Event</DialogTitle>
          <DialogDescription className="text-slate-400">
            Schedule a new event for your guild members
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Event Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Weekly Raid Night"
                      className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Event Type */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Event Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Event details, requirements, loot rules, etc."
                      className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Date/Time Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date/Time */}
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Start Date/Time *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        className="bg-slate-900/50 border-slate-700 text-slate-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* End Date/Time */}
              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      End Date/Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        className="bg-slate-900/50 border-slate-700 text-slate-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Location and Max Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Blackrock Foundry"
                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Max Size */}
              <FormField
                control={form.control}
                name="maxSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Max Participants
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        placeholder="e.g., 40"
                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Role Requirements Section */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowRoleRequirements(!showRoleRequirements)}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
              >
                {showRoleRequirements ? '−' : '+'} Role Requirements (Optional)
              </button>

              {showRoleRequirements && (
                <div className="mt-4 space-y-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">
                    Specify how many of each role you need for this event
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Tanks Needed */}
                    <FormField
                      control={form.control}
                      name="tanksNeeded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">
                            Tanks
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="0"
                              className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Healers Needed */}
                    <FormField
                      control={form.control}
                      name="healersNeeded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">
                            Healers
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="0"
                              className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* DPS Needed */}
                    <FormField
                      control={form.control}
                      name="dpsNeeded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">DPS</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="0"
                              className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Soft Reserve Settings Section */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  setShowSoftReserveSettings(!showSoftReserveSettings)
                }
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
              >
                {showSoftReserveSettings ? '−' : '+'} Soft Reserve Settings
                (Optional)
              </button>

              {showSoftReserveSettings && (
                <div className="mt-4 space-y-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">
                    Allow players to soft reserve items before the event
                  </p>

                  {/* Enable Soft Reserve Checkbox */}
                  <FormField
                    control={form.control}
                    name="softReserveEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-slate-700 bg-slate-900/50 text-purple-600 focus:ring-purple-600"
                          />
                        </FormControl>
                        <FormLabel className="text-slate-200 font-normal">
                          Enable Soft Reserves
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {/* Soft Reserve Limit */}
                  <FormField
                    control={form.control}
                    name="softReserveLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">
                          Soft Reserve Limit
                        </FormLabel>
                        <FormDescription className="text-xs text-slate-400">
                          Maximum number of items each player can soft reserve
                          (leave empty for unlimited)
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="e.g., 3"
                            disabled={!form.watch('softReserveEnabled')}
                            className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
                disabled={createMutation.isPending}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
