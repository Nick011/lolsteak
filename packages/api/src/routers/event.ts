import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { events, eventSignups, eventSoftReserves } from '@guild/db/schema'
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
          softReserves: {
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
      // Verify the event exists and belongs to the tenant
      const event = await ctx.db.query.events.findFirst({
        where: and(
          eq(events.id, input.eventId),
          eq(events.tenantId, ctx.tenant.id)
        ),
      })

      if (!event) {
        throw new Error('Event not found')
      }

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

  // Update an event (officers only)
  update: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        eventType: z
          .enum(['raid', 'dungeon', 'pvp', 'social', 'other'])
          .optional(),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
        location: z.string().max(255).optional(),
        maxSize: z.number().int().positive().optional(),
        settings: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, startsAt, endsAt, ...data } = input

      // Verify the event belongs to the tenant
      const existing = await ctx.db.query.events.findFirst({
        where: and(eq(events.id, id), eq(events.tenantId, ctx.tenant.id)),
      })

      if (!existing) {
        throw new Error('Event not found')
      }

      const [updated] = await ctx.db
        .update(events)
        .set({
          ...data,
          ...(startsAt !== undefined && { startsAt: new Date(startsAt) }),
          ...(endsAt !== undefined && { endsAt: new Date(endsAt) }),
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning()

      return updated
    }),

  // Delete an event (officers only)
  delete: officerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the event belongs to the tenant
      const existing = await ctx.db.query.events.findFirst({
        where: and(eq(events.id, input.id), eq(events.tenantId, ctx.tenant.id)),
      })

      if (!existing) {
        throw new Error('Event not found')
      }

      // Delete the event (CASCADE will handle signups)
      await ctx.db.delete(events).where(eq(events.id, input.id))

      return { success: true }
    }),

  // Soft reserve an item for an event
  softReserve: tenantProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        characterId: z.string().uuid(),
        itemId: z.number().int(),
        itemName: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the event exists, belongs to tenant, and has soft reserves enabled
      const event = await ctx.db.query.events.findFirst({
        where: and(
          eq(events.id, input.eventId),
          eq(events.tenantId, ctx.tenant.id)
        ),
      })

      if (!event) {
        throw new Error('Event not found')
      }

      const settings = event.settings as {
        softReserveEnabled?: boolean
        softReserveLimit?: number
      }
      if (!settings?.softReserveEnabled) {
        throw new Error('Soft reserves are not enabled for this event')
      }

      // Verify the character belongs to the current member
      const character = await ctx.db.query.characters.findFirst({
        where: (c, { and, eq }) =>
          and(eq(c.id, input.characterId), eq(c.memberId, ctx.member.id)),
      })

      if (!character) {
        throw new Error('Character not found or does not belong to you')
      }

      // Check if soft reserve limit is reached for this character
      if (settings.softReserveLimit !== undefined) {
        const existingReserves = await ctx.db.query.eventSoftReserves.findMany({
          where: and(
            eq(eventSoftReserves.eventId, input.eventId),
            eq(eventSoftReserves.characterId, input.characterId)
          ),
        })

        if (existingReserves.length >= settings.softReserveLimit) {
          throw new Error(
            `Soft reserve limit reached (${settings.softReserveLimit} items per player)`
          )
        }
      }

      // Check if this item is already soft reserved by this character
      const existing = await ctx.db.query.eventSoftReserves.findFirst({
        where: and(
          eq(eventSoftReserves.eventId, input.eventId),
          eq(eventSoftReserves.characterId, input.characterId),
          eq(eventSoftReserves.itemId, input.itemId)
        ),
      })

      if (existing) {
        throw new Error('You have already soft reserved this item')
      }

      // Create the soft reserve
      const [softReserve] = await ctx.db
        .insert(eventSoftReserves)
        .values({
          eventId: input.eventId,
          characterId: input.characterId,
          itemId: input.itemId,
          itemName: input.itemName,
        })
        .returning()

      return softReserve
    }),

  // Remove a soft reserve
  removeSoftReserve: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the soft reserve and verify ownership
      const softReserve = await ctx.db.query.eventSoftReserves.findFirst({
        where: eq(eventSoftReserves.id, input.id),
        with: {
          character: true,
          event: true,
        },
      })

      if (!softReserve) {
        throw new Error('Soft reserve not found')
      }

      // Verify the event belongs to the tenant
      if (softReserve.event.tenantId !== ctx.tenant.id) {
        throw new Error('Soft reserve not found')
      }

      // Verify the character belongs to the current member
      if (softReserve.character.memberId !== ctx.member.id) {
        throw new Error('You can only remove your own soft reserves')
      }

      // Delete the soft reserve
      await ctx.db
        .delete(eventSoftReserves)
        .where(eq(eventSoftReserves.id, input.id))

      return { success: true }
    }),

  // Get all soft reserves for an event (for display)
  getSoftReserves: tenantProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify the event belongs to the tenant
      const event = await ctx.db.query.events.findFirst({
        where: and(
          eq(events.id, input.eventId),
          eq(events.tenantId, ctx.tenant.id)
        ),
      })

      if (!event) {
        throw new Error('Event not found')
      }

      return ctx.db.query.eventSoftReserves.findMany({
        where: eq(eventSoftReserves.eventId, input.eventId),
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
        orderBy: (sr, { asc }) => asc(sr.createdAt),
      })
    }),
})
