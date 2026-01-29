'use client'

import { useState, useMemo } from 'react'
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
import { Button } from '~/components/ui/button'
import { trpc } from '~/lib/trpc/client'
import { useToast } from '~/hooks/use-toast'

// Form validation schema
const recordLootSchema = z.object({
  characterName: z.string().min(1, 'Character name is required').max(100),
  characterId: z.string().uuid().optional(),
  itemName: z.string().min(1, 'Item name is required').max(255),
  itemId: z.string().optional(),
  itemLink: z.string().optional(),
  source: z.string().max(100).optional(),
  sourceType: z
    .enum(['raid', 'dungeon', 'pvp', 'world', 'other'] as const)
    .optional(),
  rollType: z
    .enum(['MS', 'OS', 'SR', 'Free Roll', 'Council', 'DKP'] as const)
    .optional(),
  cost: z.string().optional(),
  awardedAt: z.string().optional(),
  eventId: z.string().uuid().optional(),
})

type RecordLootFormValues = z.infer<typeof recordLootSchema>

const ROLL_TYPES = [
  { value: 'MS', label: 'MS (Main Spec)' },
  { value: 'OS', label: 'OS (Off Spec)' },
  { value: 'SR', label: 'SR (Soft Reserve)' },
  { value: 'Free Roll', label: 'Free Roll' },
  { value: 'Council', label: 'Council' },
  { value: 'DKP', label: 'DKP' },
] as const

const SOURCE_TYPES = [
  { value: 'raid', label: 'Raid' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'pvp', label: 'PvP' },
  { value: 'world', label: 'World Boss' },
  { value: 'other', label: 'Other' },
] as const

interface RecordLootDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordLootDialog({
  open,
  onOpenChange,
}: RecordLootDialogProps) {
  const { toast } = useToast()
  const [characterSearch, setCharacterSearch] = useState('')
  const [customCharacterMode, setCustomCharacterMode] = useState(false)

  const form = useForm<RecordLootFormValues>({
    // @ts-expect-error - Zod v4 compatibility issue with react-hook-form resolver
    resolver: zodResolver(recordLootSchema),
    defaultValues: {
      characterName: '',
      characterId: undefined,
      itemName: '',
      itemId: undefined,
      itemLink: '',
      source: '',
      sourceType: undefined,
      rollType: undefined,
      cost: undefined,
      awardedAt: '',
      eventId: undefined,
    },
  })

  // Fetch characters
  const { data: characters = [], isLoading: loadingCharacters } =
    trpc.character.list.useQuery(undefined, {
      enabled: open,
    })

  // Fetch recent events for linking
  const { data: events = [], isLoading: loadingEvents } =
    trpc.event.list.useQuery(
      {
        includesPast: true,
      },
      {
        enabled: open,
      }
    )

  // Filter characters based on search
  const filteredCharacters = useMemo(() => {
    if (!characterSearch) return characters
    const search = characterSearch.toLowerCase()
    return characters.filter(char => char.name.toLowerCase().includes(search))
  }, [characters, characterSearch])

  const utils = trpc.useUtils()
  const recordMutation = trpc.loot.record.useMutation({
    onSuccess: loot => {
      toast({
        title: 'Loot recorded',
        description: `${loot.itemName} awarded to ${loot.characterName}`,
      })
      form.reset()
      setCharacterSearch('')
      setCustomCharacterMode(false)
      onOpenChange(false)
      // Invalidate loot list cache
      utils.loot.list.invalidate()
    },
    onError: error => {
      toast({
        title: 'Failed to record loot',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: RecordLootFormValues) => {
    // Transform form data to API input format
    recordMutation.mutate({
      characterName: data.characterName,
      characterId: data.characterId,
      itemName: data.itemName,
      itemId: data.itemId ? parseInt(data.itemId, 10) : undefined,
      itemLink: data.itemLink || undefined,
      source: data.source || undefined,
      sourceType: data.sourceType,
      rollType: data.rollType,
      cost: data.cost ? parseInt(data.cost, 10) : undefined,
      awardedAt: data.awardedAt
        ? new Date(data.awardedAt).toISOString()
        : undefined,
      eventId: data.eventId,
    })
  }

  // Handle character selection
  const handleCharacterSelect = (characterId: string) => {
    const character = characters.find(c => c.id === characterId)
    if (character) {
      form.setValue('characterId', character.id)
      form.setValue('characterName', character.name)
    }
  }

  // Toggle between guild character select and free text
  const toggleCustomCharacterMode = () => {
    setCustomCharacterMode(!customCharacterMode)
    form.setValue('characterId', undefined)
    form.setValue('characterName', '')
    setCharacterSearch('')
  }

  // Set default date/time to now
  const setCurrentDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`
    form.setValue('awardedAt', formatted)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Record Loot</DialogTitle>
          <DialogDescription className="text-slate-400">
            Manually record a loot drop for your records
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Character Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-slate-200">Character *</FormLabel>
                <button
                  type="button"
                  onClick={toggleCustomCharacterMode}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  {customCharacterMode
                    ? 'Select Guild Character'
                    : 'Enter Custom Name'}
                </button>
              </div>

              {customCharacterMode ? (
                <FormField
                  control={form.control}
                  name="characterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Character name"
                          className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-400">
                        Enter any character name (not in guild roster)
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="characterId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <Input
                          placeholder="Search characters..."
                          value={characterSearch}
                          onChange={e => setCharacterSearch(e.target.value)}
                          className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        />
                        <Select
                          onValueChange={handleCharacterSelect}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                              <SelectValue placeholder="Select a character" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {loadingCharacters ? (
                              <SelectItem value="loading" disabled>
                                Loading characters...
                              </SelectItem>
                            ) : filteredCharacters.length === 0 ? (
                              <SelectItem value="none" disabled>
                                {characterSearch
                                  ? 'No characters found'
                                  : 'No characters available'}
                              </SelectItem>
                            ) : (
                              filteredCharacters.map(character => (
                                <SelectItem
                                  key={character.id}
                                  value={character.id}
                                >
                                  {character.name}
                                  {character.class && (
                                    <span className="text-slate-400 ml-2">
                                      ({character.class})
                                    </span>
                                  )}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Item Name */}
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Item Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Thunderfury, Blessed Blade of the Windseeker"
                      className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Item ID & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Item ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="e.g., 19019"
                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-400">
                      WoW Item ID for Wowhead links
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Item Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Game item link"
                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-400">
                      Optional WoW item link
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Source & Source Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Source / Boss
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Ragnaros, Onyxia"
                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Source Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_TYPES.map(type => (
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
            </div>

            {/* Roll Type & Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rollType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Roll Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select roll type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLL_TYPES.map(type => (
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

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Cost (DKP/Points)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="e.g., 100"
                        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Date/Time & Event */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="awardedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Date/Time</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          className="bg-slate-900/50 border-slate-700 text-slate-100"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={setCurrentDateTime}
                        className="text-xs text-purple-400 hover:text-purple-300 hover:bg-slate-700"
                      >
                        Now
                      </Button>
                    </div>
                    <FormDescription className="text-xs text-slate-400">
                      Defaults to current time if empty
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Link to Event
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {loadingEvents ? (
                          <SelectItem value="loading" disabled>
                            Loading events...
                          </SelectItem>
                        ) : events.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No recent events
                          </SelectItem>
                        ) : (
                          events.map(event => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                              {event.startsAt && (
                                <span className="text-slate-400 ml-2 text-xs">
                                  (
                                  {new Date(
                                    event.startsAt
                                  ).toLocaleDateString()}
                                  )
                                </span>
                              )}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-slate-400">
                      Optional link to raid/event
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  setCharacterSearch('')
                  setCustomCharacterMode(false)
                  onOpenChange(false)
                }}
                disabled={recordMutation.isPending}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={recordMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {recordMutation.isPending ? 'Recording...' : 'Record Loot'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
