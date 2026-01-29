'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { trpc } from '~/lib/trpc/client'
import { useToast } from '~/hooks/use-toast'

const softReserveSchema = z.object({
  itemName: z.string().min(1, 'Item name is required').max(255),
  itemId: z.number().int().positive('Item ID must be positive'),
})

type SoftReserveFormValues = z.infer<typeof softReserveSchema>

interface SoftReserveFormProps {
  eventId: string
  characterId: string
  onSuccess?: () => void
}

export function SoftReserveForm({
  eventId,
  characterId,
  onSuccess,
}: SoftReserveFormProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const form = useForm<SoftReserveFormValues>({
    // @ts-expect-error - Zod v4 compatibility issue with react-hook-form resolver
    resolver: zodResolver(softReserveSchema),
    defaultValues: {
      itemName: '',
      itemId: undefined,
    },
  })

  const softReserveMutation = trpc.event.softReserve.useMutation({
    onSuccess: () => {
      toast({
        title: 'Item reserved',
        description: 'Your soft reserve has been added successfully.',
      })
      form.reset()
      utils.event.get.invalidate({ id: eventId })
      utils.event.getSoftReserves.invalidate({ eventId })
      onSuccess?.()
    },
    onError: error => {
      toast({
        title: 'Failed to reserve item',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: SoftReserveFormValues) => {
    softReserveMutation.mutate({
      eventId,
      characterId,
      itemId: data.itemId,
      itemName: data.itemName,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="e.g., Thunderfury, Blessed Blade..."
                    className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* Item ID */}
          <FormField
            control={form.control}
            name="itemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Item ID *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="e.g., 19019"
                    className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    onChange={e => {
                      const value = e.target.value
                      field.onChange(value ? parseInt(value, 10) : undefined)
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={softReserveMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {softReserveMutation.isPending ? 'Reserving...' : 'Reserve Item'}
        </Button>
      </form>
    </Form>
  )
}
