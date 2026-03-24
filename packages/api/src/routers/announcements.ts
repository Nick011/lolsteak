import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { announcements } from '@guild/db/schema'
import { eq, and, desc, isNotNull, gt, or, isNull } from '@guild/db'

export const announcementsRouter = router({
  // Get announcements list
  list: tenantProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
          limit: z.number().int().positive().default(50),
          offset: z.number().int().nonnegative().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(announcements.tenantId, ctx.tenant.id)]

      // Filter by published status if specified
      if (input?.published === true) {
        conditions.push(isNotNull(announcements.publishedAt))
      } else if (input?.published === false) {
        conditions.push(isNull(announcements.publishedAt))
      }

      // Exclude expired announcements by default
      // Include if expiresAt is null OR expiresAt is in the future
      conditions.push(
        or(
          isNull(announcements.expiresAt),
          gt(announcements.expiresAt, new Date())
        )!
      )

      return ctx.db.query.announcements.findMany({
        where: and(...conditions),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
        orderBy: [
          desc(announcements.isPinned),
          desc(announcements.publishedAt),
        ],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      })
    }),

  // Get a single announcement by ID
  getById: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const announcement = await ctx.db.query.announcements.findFirst({
        where: and(
          eq(announcements.tenantId, ctx.tenant.id),
          eq(announcements.id, input.id)
        ),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
      })

      if (!announcement) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Announcement not found',
        })
      }

      return announcement
    }),

  // Create a new announcement (officers only)
  create: officerProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        isPinned: z.boolean().optional().default(false),
        publishedAt: z.string().datetime().optional(),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [announcement] = await ctx.db
        .insert(announcements)
        .values({
          tenantId: ctx.tenant.id,
          authorId: ctx.member.id,
          title: input.title,
          content: input.content,
          isPinned: input.isPinned ?? false,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        })
        .returning()

      return announcement
    }),

  // Update an announcement (officers only)
  update: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
        isPinned: z.boolean().optional(),
        publishedAt: z.string().datetime().optional().nullable(),
        expiresAt: z.string().datetime().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify announcement belongs to tenant
      const existing = await ctx.db.query.announcements.findFirst({
        where: and(
          eq(announcements.tenantId, ctx.tenant.id),
          eq(announcements.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Announcement not found',
        })
      }

      // Build update object
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      }

      if (input.title !== undefined) updateData.title = input.title
      if (input.content !== undefined) updateData.content = input.content
      if (input.isPinned !== undefined) updateData.isPinned = input.isPinned
      if (input.publishedAt !== undefined) {
        updateData.publishedAt = input.publishedAt
          ? new Date(input.publishedAt)
          : null
      }
      if (input.expiresAt !== undefined) {
        updateData.expiresAt = input.expiresAt
          ? new Date(input.expiresAt)
          : null
      }

      const [updated] = await ctx.db
        .update(announcements)
        .set(updateData)
        .where(eq(announcements.id, input.id))
        .returning()

      return updated
    }),

  // Delete an announcement (officers only)
  delete: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify announcement belongs to tenant
      const existing = await ctx.db.query.announcements.findFirst({
        where: and(
          eq(announcements.tenantId, ctx.tenant.id),
          eq(announcements.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Announcement not found',
        })
      }

      await ctx.db.delete(announcements).where(eq(announcements.id, input.id))

      return { success: true }
    }),

  // Toggle pinned status (officers only)
  togglePin: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify announcement belongs to tenant
      const existing = await ctx.db.query.announcements.findFirst({
        where: and(
          eq(announcements.tenantId, ctx.tenant.id),
          eq(announcements.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Announcement not found',
        })
      }

      const [updated] = await ctx.db
        .update(announcements)
        .set({
          isPinned: !existing.isPinned,
          updatedAt: new Date(),
        })
        .where(eq(announcements.id, input.id))
        .returning()

      return updated
    }),
})
