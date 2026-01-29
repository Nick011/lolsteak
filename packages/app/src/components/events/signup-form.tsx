'use client'

import { useState } from 'react'
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
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { trpc } from '~/lib/trpc/client'
import { useToast } from '~/hooks/use-toast'

const signupSchema = z.object({
  characterId: z.string().min(1, 'Please select a character'),
  status: z.enum(['confirmed', 'tentative', 'standby'] as const),
  role: z.enum(['tank', 'healer', 'dps'] as const),
  notes: z.string().optional(),
})

type SignupFormValues = z.infer<typeof signupSchema>

interface Character {
  id: string
  name: string
  class: string | null
  level: number | null
}

interface SignupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  characters: Character[]
  existingSignup?: {
    id: string
    characterId: string
    status: string
    role: string | null
    notes: string | null
  }
}

export function SignupForm({
  open,
  onOpenChange,
  eventId,
  characters,
  existingSignup,
}: SignupFormProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const form = useForm<SignupFormValues>({
    // @ts-expect-error - Zod v4 compatibility issue with react-hook-form resolver
    resolver: zodResolver(signupSchema),
    defaultValues: {
      characterId: existingSignup?.characterId || '',
      status:
        (existingSignup?.status as 'confirmed' | 'tentative' | 'standby') ||
        'confirmed',
      role: (existingSignup?.role as 'tank' | 'healer' | 'dps') || 'dps',
      notes: existingSignup?.notes || '',
    },
  })

  const signupMutation = trpc.event.signup.useMutation({
    onSuccess: () => {
      toast({
        title: existingSignup ? 'Signup updated' : 'Signed up successfully',
        description: existingSignup
          ? 'Your signup has been updated.'
          : 'You have been signed up for this event.',
      })
      form.reset()
      onOpenChange(false)
      utils.event.get.invalidate({ id: eventId })
    },
    onError: error => {
      toast({
        title: 'Failed to sign up',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate({
      eventId,
      characterId: data.characterId,
      status: data.status,
      role: data.role,
      notes: data.notes || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {existingSignup ? 'Update Signup' : 'Sign Up for Event'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {existingSignup
              ? 'Update your signup details for this event.'
              : 'Choose your character and signup status.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Character Selection */}
            <FormField
              control={form.control}
              name="characterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Character *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                        <SelectValue placeholder="Select a character" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {characters.map(character => (
                        <SelectItem key={character.id} value={character.id}>
                          <div className="flex items-center gap-2">
                            <span>{character.name}</span>
                            {character.class && (
                              <span className="text-xs text-slate-500 capitalize">
                                {character.class.replace('_', ' ')}
                              </span>
                            )}
                            {character.level && (
                              <span className="text-xs text-slate-500">
                                Lv {character.level}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="tentative">Tentative</SelectItem>
                      <SelectItem value="standby">Standby</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Role *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tank">Tank</SelectItem>
                      <SelectItem value="healer">Healer</SelectItem>
                      <SelectItem value="dps">DPS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any special notes or comments..."
                      className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
                disabled={signupMutation.isPending}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={signupMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {signupMutation.isPending
                  ? existingSignup
                    ? 'Updating...'
                    : 'Signing up...'
                  : existingSignup
                    ? 'Update Signup'
                    : 'Sign Up'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
