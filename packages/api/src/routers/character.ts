import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { characters } from '@guild/db/schema'
import { eq, and } from '@guild/db'

export const characterRouter = router({
  // List all characters in tenant
  list: tenantProcedure.query(async ({ ctx }) => {
    return ctx.db.query.characters.findMany({
      where: eq(characters.tenantId, ctx.tenant.id),
      with: {
        member: {
          with: {
            user: true,
          },
        },
      },
      orderBy: (c, { asc }) => asc(c.name),
    })
  }),

  // Get a single character
  get: tenantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, input.id),
          eq(characters.tenantId, ctx.tenant.id)
        ),
        with: {
          member: {
            with: {
              user: true,
            },
          },
        },
      })
    }),

  // Create a character (officers or self-service)
  create: tenantProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        realm: z.string().max(100).optional(),
        class: z
          .enum([
            'warrior',
            'paladin',
            'hunter',
            'rogue',
            'priest',
            'shaman',
            'mage',
            'warlock',
            'druid',
            'death_knight',
          ])
          .optional(),
        spec: z.string().max(50).optional(),
        role: z.enum(['tank', 'healer', 'dps']).optional(),
        level: z.number().int().min(1).max(80).optional(),
        isMain: z.boolean().optional(),
        gameData: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [character] = await ctx.db
        .insert(characters)
        .values({
          tenantId: ctx.tenant.id,
          memberId: ctx.member.id,
          name: input.name,
          realm: input.realm,
          class: input.class,
          spec: input.spec,
          role: input.role,
          level: input.level,
          isMain: input.isMain ? 'true' : 'false',
          gameData: input.gameData ?? {},
        })
        .returning()

      return character
    }),

  // Update a character
  update: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(100).optional(),
        realm: z.string().max(100).optional(),
        class: z
          .enum([
            'warrior',
            'paladin',
            'hunter',
            'rogue',
            'priest',
            'shaman',
            'mage',
            'warlock',
            'druid',
            'death_knight',
          ])
          .optional(),
        spec: z.string().max(50).optional(),
        role: z.enum(['tank', 'healer', 'dps']).optional(),
        level: z.number().int().min(1).max(80).optional(),
        isMain: z.boolean().optional(),
        gameData: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isMain, ...data } = input

      // Check if user owns this character or is an officer
      const existing = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, id),
          eq(characters.tenantId, ctx.tenant.id)
        ),
      })

      if (!existing) {
        throw new Error('Character not found')
      }

      const isOwner = existing.memberId === ctx.member.id
      const isOfficer = ['owner', 'officer'].includes(ctx.member.role)

      if (!isOwner && !isOfficer) {
        throw new Error('Not authorized to edit this character')
      }

      const [updated] = await ctx.db
        .update(characters)
        .set({
          ...data,
          ...(isMain !== undefined && { isMain: isMain ? 'true' : 'false' }),
          updatedAt: new Date(),
        })
        .where(eq(characters.id, id))
        .returning()

      return updated
    }),

  // Delete a character (officers only)
  delete: officerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(characters)
        .where(
          and(
            eq(characters.id, input.id),
            eq(characters.tenantId, ctx.tenant.id)
          )
        )

      return { success: true }
    }),
})
