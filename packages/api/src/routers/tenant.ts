import { z } from 'zod'
import { router, protectedProcedure, tenantProcedure } from '../trpc'
import { tenants, members } from '@guild/db/schema'
import { eq } from '@guild/db'

export const tenantRouter = router({
  // Get current tenant info (public within tenant context)
  get: tenantProcedure.query(({ ctx }) => {
    return ctx.tenant
  }),

  // Get tenant by slug (for public pages)
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.tenants.findFirst({
        where: eq(tenants.slug, input.slug),
      })
    }),

  // Create a new tenant/guild
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        slug: z
          .string()
          .min(2)
          .max(100)
          .regex(
            /^[a-z0-9-]+$/,
            'Slug must be lowercase alphanumeric with hyphens'
          ),
        gameType: z.enum([
          'wow_classic',
          'wow_retail',
          'ff14',
          'lol',
          'dota2',
          'cs2',
          'rocket_league',
          'other',
        ]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create tenant
      const [tenant] = await ctx.db
        .insert(tenants)
        .values({
          name: input.name,
          slug: input.slug,
          gameType: input.gameType,
          description: input.description,
        })
        .returning()

      // Make creator the owner
      await ctx.db.insert(members).values({
        tenantId: tenant.id,
        userId: ctx.user.id,
        role: 'owner',
      })

      return tenant
    }),

  // List user's tenants
  listMine: protectedProcedure.query(async ({ ctx }) => {
    const userMembers = await ctx.db.query.members.findMany({
      where: eq(members.userId, ctx.user.id),
      with: {
        tenant: true,
      },
    })

    return userMembers.map(m => ({
      ...m.tenant,
      role: m.role,
    }))
  }),
})
