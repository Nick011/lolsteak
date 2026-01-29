'use client'

import { useState, useEffect } from 'react'
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

const editEventSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255),
    eventType: z.enum(['raid', 'dungeon', 'pvp', 'social', 'other'] as const),
    description: z.string().optional(),
    startsAt: z.string().min(1, 'Start date/time is required'),
    endsAt: z.string().optional(),
    location: z.string().max(255).optional(),
    maxSize: z.number().int().positive('Must be a positive number').optional(),
    tanksNeeded: z.number().int().min(0).optional(),
    healersNeeded: z.number().int().min(0).optional(),
    dpsNeeded: z.number().int().min(0).optional(),
    softReserveEnabled: z.boolean().optional(),
    softReserveLimit: z.number().int().min(1).optional(),
  })
  .refine(
    data => {
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

type EditEventFormValues = z.infer<typeof editEventSchema>

const EVENT_TYPES = [
  { value: 'raid', label: 'Raid' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'pvp', label: 'PvP' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
] as const

interface Event {
  id: string
  name: string
  eventType: 'raid' | 'dungeon' | 'pvp' | 'social' | 'other'
  description: string | null
  startsAt: Date
  endsAt: Date | null
  location: string | null
  maxSize: number | null
  settings: {
    requiredRoles?: {
      tanks?: number
      healers?: number
      dps?: number
    }
    softReserveEnabled?: boolean
    softReserveLimit?: number
  }
}

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event
}

export function EditEventDialog({
  open,
  onOpenChange,
  event,
}: EditEventDialogProps) {
  const { toast } = useToast()
  const [showRoleRequirements, setShowRoleRequirements] = useState(false)
  const [showSoftReserveSettings, setShowSoftReserveSettings] = useState(false)
  const utils = trpc.useUtils()

  const form = useForm<EditEventFormValues>({
    // @ts-expect-error - Zod v4 compatibility issue with react-hook-form resolver
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      name: event.name,
      eventType: event.eventType,
      description: event.description || '',
      startsAt: new Date(event.startsAt).toISOString().slice(0, 16),
      endsAt: event.endsAt
        ? new Date(event.endsAt).toISOString().slice(0, 16)
        : '',
      location: event.location || '',
      maxSize: event.maxSize || undefined,
      tanksNeeded: event.settings?.requiredRoles?.tanks || undefined,
      healersNeeded: event.settings?.requiredRoles?.healers || undefined,
      dpsNeeded: event.settings?.requiredRoles?.dps || undefined,
      softReserveEnabled: event.settings?.softReserveEnabled || false,
      softReserveLimit: event.settings?.softReserveLimit || undefined,
    },
  })

  // Update form when event changes
  useEffect(() => {
    form.reset({
      name: event.name,
      eventType: event.eventType,
      description: event.description || '',
      startsAt: new Date(event.startsAt).toISOString().slice(0, 16),
      endsAt: event.endsAt
        ? new Date(event.endsAt).toISOString().slice(0, 16)
        : '',
      location: event.location || '',
      maxSize: event.maxSize || undefined,
      tanksNeeded: event.settings?.requiredRoles?.tanks || undefined,
      healersNeeded: event.settings?.requiredRoles?.healers || undefined,
      dpsNeeded: event.settings?.requiredRoles?.dps || undefined,
      softReserveEnabled: event.settings?.softReserveEnabled || false,
      softReserveLimit: event.settings?.softReserveLimit || undefined,
    })

    // Show role requirements section if any are set
    if (event.settings?.requiredRoles) {
      const hasRoles =
        (event.settings.requiredRoles.tanks ?? 0) > 0 ||
        (event.settings.requiredRoles.healers ?? 0) > 0 ||
        (event.settings.requiredRoles.dps ?? 0) > 0
      setShowRoleRequirements(hasRoles)
    }

    // Show soft reserve settings if enabled
    if (event.settings?.softReserveEnabled) {
      setShowSoftReserveSettings(true)
    }
  }, [event, form])

  const updateMutation = trpc.event.update.useMutation({
    onSuccess: updatedEvent => {
      toast({
        title: 'Event updated',
        description: `"${updatedEvent.name}" has been updated successfully.`,
      })
      onOpenChange(false)
      utils.event.get.invalidate({ id: event.id })
      utils.event.list.invalidate()
    },
    onError: error => {
      toast({
        title: 'Failed to update event',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: EditEventFormValues) => {
    const settings: Record<string, unknown> = { ...event.settings }

    if (data.tanksNeeded || data.healersNeeded || data.dpsNeeded) {
      settings.requiredRoles = {
        tanks: data.tanksNeeded || 0,
        healers: data.healersNeeded || 0,
        dps: data.dpsNeeded || 0,
      }
    } else {
      delete settings.requiredRoles
    }

    // Update soft reserve settings
    if (data.softReserveEnabled) {
      settings.softReserveEnabled = true
      if (data.softReserveLimit) {
        settings.softReserveLimit = data.softReserveLimit
      } else {
        delete settings.softReserveLimit
      }
    } else {
      delete settings.softReserveEnabled
      delete settings.softReserveLimit
    }

    updateMutation.mutate({
      id: event.id,
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
          <DialogTitle className="text-slate-100">Edit Event</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the event details
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
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
