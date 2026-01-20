import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { events, eventSignups } from '@guild/db/schema'
import { eq, and, gte } from '@guild/db'

export const eventRouter = router({
  // List upcoming events
  list: tenantProcedure
    .input(
      z
        .object({
          includesPast: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where = input?.includesPast
        ? eq(events.tenantId, ctx.tenant.id)
        : and(
            eq(events.tenantId, ctx.tenant.id),
            gte(events.startsAt, new Date())
          )

      return ctx.db.query.events.findMany({
        where,
        with: {
          signups: {
            with: {
              character: true,
            },
          },
        },
        orderBy: (e, { asc }) => asc(e.startsAt),
      })
    }),

  // Get a single event
  get: tenantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.events.findFirst({
        where: and(eq(events.id, input.id), eq(events.tenantId, ctx.tenant.id)),
        with: {
          signups: {
            with: {
              character: {
                with: {
                  member: {
                    with: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    }),

  // Create an event (officers only)
  create: officerProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        description: z.string().optional(),
        eventType: z.enum(['raid', 'dungeon', 'pvp', 'social', 'other']),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime().optional(),
        location: z.string().max(255).optional(),
        maxSize: z.number().int().positive().optional(),
        settings: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .insert(events)
        .values({
          tenantId: ctx.tenant.id,
          name: input.name,
          description: input.description,
          eventType: input.eventType,
          startsAt: new Date(input.startsAt),
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
          location: input.location,
          maxSize: input.maxSize,
          settings: input.settings ?? {},
        })
        .returning()

      return event
    }),

  // Sign up for an event
  signup: tenantProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        characterId: z.string().uuid(),
        status: z.enum(['confirmed', 'tentative', 'declined', 'standby']),
        role: z.string().max(50).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the character belongs to the current member
      const character = await ctx.db.query.characters.findFirst({
        where: (c, { and, eq }) =>
          and(eq(c.id, input.characterId), eq(c.memberId, ctx.member.id)),
      })

      if (!character) {
        throw new Error('Character not found or does not belong to you')
      }

      // Upsert signup
      const existing = await ctx.db.query.eventSignups.findFirst({
        where: and(
          eq(eventSignups.eventId, input.eventId),
          eq(eventSignups.characterId, input.characterId)
        ),
      })

      if (existing) {
        const [updated] = await ctx.db
          .update(eventSignups)
          .set({
            status: input.status,
            role: input.role,
            notes: input.notes,
            updatedAt: new Date(),
          })
          .where(eq(eventSignups.id, existing.id))
          .returning()
        return updated
      }

      const [signup] = await ctx.db
        .insert(eventSignups)
        .values({
          eventId: input.eventId,
          characterId: input.characterId,
          status: input.status,
          role: input.role,
          notes: input.notes,
        })
        .returning()

      return signup
    }),

  // Cancel signup
  cancelSignup: tenantProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        characterId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the character belongs to the current member
      const character = await ctx.db.query.characters.findFirst({
        where: (c, { and, eq }) =>
          and(eq(c.id, input.characterId), eq(c.memberId, ctx.member.id)),
      })

      if (!character) {
        throw new Error('Character not found or does not belong to you')
      }

      await ctx.db
        .delete(eventSignups)
        .where(
          and(
            eq(eventSignups.eventId, input.eventId),
            eq(eventSignups.characterId, input.characterId)
          )
        )

      return { success: true }
    }),
})
