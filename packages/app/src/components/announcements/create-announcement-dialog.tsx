'use client'

import { useEffect } from 'react'
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
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { trpc } from '~/lib/trpc/client'
import { useToast } from '~/hooks/use-toast'

// Form validation schema
const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content is too long'),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
})

type AnnouncementFormValues = z.infer<typeof announcementSchema>

// Helper function to format date for datetime-local input
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

interface CreateAnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string
  initialData?: {
    title: string
    content: string
    isPinned: boolean
    publishedAt?: Date | null
    expiresAt?: Date | null
  }
}

export function CreateAnnouncementDialog({
  open,
  onOpenChange,
  editId,
  initialData,
}: CreateAnnouncementDialogProps) {
  const { toast } = useToast()
  const isEditMode = !!editId

  const form = useForm<AnnouncementFormValues>({
    // @ts-expect-error - Zod v4 compatibility issue with react-hook-form resolver
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      isPinned: false,
      publishedAt: '',
      expiresAt: '',
    },
  })

  // Reset form when dialog opens with initial data
  useEffect(() => {
    if (open && initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        isPinned: initialData.isPinned,
        publishedAt: initialData.publishedAt
          ? formatDateTimeLocal(new Date(initialData.publishedAt))
          : '',
        expiresAt: initialData.expiresAt
          ? formatDateTimeLocal(new Date(initialData.expiresAt))
          : '',
      })
    } else if (open && !initialData) {
      form.reset({
        title: '',
        content: '',
        isPinned: false,
        publishedAt: '',
        expiresAt: '',
      })
    }
  }, [open, initialData, form])

  const utils = trpc.useUtils()

  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Announcement created',
        description: 'Your announcement has been created successfully.',
      })
      form.reset()
      onOpenChange(false)
      utils.announcements.list.invalidate()
    },
    onError: error => {
      toast({
        title: 'Failed to create announcement',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const updateMutation = trpc.announcements.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Announcement updated',
        description: 'Your announcement has been updated successfully.',
      })
      form.reset()
      onOpenChange(false)
      utils.announcements.list.invalidate()
      if (editId) {
        utils.announcements.getById.invalidate({ id: editId })
      }
    },
    onError: error => {
      toast({
        title: 'Failed to update announcement',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: AnnouncementFormValues) => {
    const payload = {
      title: data.title,
      content: data.content,
      isPinned: data.isPinned,
      publishedAt: data.publishedAt
        ? new Date(data.publishedAt).toISOString()
        : undefined,
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : undefined,
    }

    if (isEditMode && editId) {
      updateMutation.mutate({
        id: editId,
        ...payload,
      })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Set current date/time for publish now button
  const setPublishNow = () => {
    form.setValue('publishedAt', formatDateTimeLocal(new Date()))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {isEditMode ? 'Edit Announcement' : 'Create Announcement'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditMode
              ? 'Update your guild announcement.'
              : 'Share important information with your guild members.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* @ts-expect-error - react-hook-form type inference issue with zod v4 */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <FormField
              // @ts-expect-error - react-hook-form type inference issue with zod v4
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Raid Schedule Update"
                      className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              // @ts-expect-error - react-hook-form type inference issue with zod v4
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your announcement here... (Markdown supported)"
                      rows={8}
                      className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-y"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-slate-400">
                    Use Markdown for formatting (bold, italic, lists, etc.)
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Pin Checkbox */}
            <FormField
              // @ts-expect-error - react-hook-form type inference issue with zod v4
              control={form.control}
              name="isPinned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-slate-200 cursor-pointer">
                      Pin this announcement
                    </FormLabel>
                    <FormDescription className="text-xs text-slate-400">
                      Pinned announcements appear at the top of the feed
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Publish Date */}
            <FormField
              // @ts-expect-error - react-hook-form type inference issue with zod v4
              control={form.control}
              name="publishedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">
                    Publish Date/Time
                  </FormLabel>
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
                      onClick={setPublishNow}
                      className="text-xs text-purple-400 hover:text-purple-300 hover:bg-slate-700 whitespace-nowrap"
                    >
                      Publish Now
                    </Button>
                  </div>
                  <FormDescription className="text-xs text-slate-400">
                    Leave empty to save as draft. Set a future date to schedule.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Expiration Date */}
            <FormField
              // @ts-expect-error - react-hook-form type inference issue with zod v4
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">
                    Expiration Date (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      className="bg-slate-900/50 border-slate-700 text-slate-100"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-slate-400">
                    The announcement will be marked as expired after this date
                  </FormDescription>
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
                disabled={isLoading}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update Announcement'
                    : 'Create Announcement'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
