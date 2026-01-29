import { z } from 'zod'
import { router, protectedProcedure, tenantProcedure } from '../trpc'
import { tenants, members } from '@guild/db/schema'
import { eq, and } from '@guild/db'
import { TRPCError } from '@trpc/server'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

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

  // Get tenant by invite code (for joining)
  getByInviteCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenant = await ctx.db.query.tenants.findFirst({
        where: eq(tenants.inviteCode, input.code),
      })

      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid invite code',
        })
      }

      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        gameType: tenant.gameType,
        logoUrl: tenant.logoUrl,
      }
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
      // Check if slug is taken
      const existing = await ctx.db.query.tenants.findFirst({
        where: eq(tenants.slug, input.slug),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This guild URL is already taken',
        })
      }

      // Create tenant with invite code
      const [tenant] = await ctx.db
        .insert(tenants)
        .values({
          name: input.name,
          slug: input.slug,
          gameType: input.gameType,
          description: input.description,
          inviteCode: generateInviteCode(),
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

  // Update tenant settings
  update: tenantProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        logoUrl: z.string().url().optional().nullable(),
        bannerUrl: z.string().url().optional().nullable(),
        settings: z
          .object({
            timezone: z.string().optional(),
            defaultRaidSize: z.number().min(1).max(100).optional(),
            lootSystem: z
              .enum([
                'personal',
                'need_greed',
                'dkp',
                'epgp',
                'loot_council',
                'soft_reserve',
              ])
              .optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or officer
      const membership = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.tenantId, ctx.tenant.id),
          eq(members.userId, ctx.user.id)
        ),
      })

      if (!membership || membership.role === 'member') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only officers and owners can update guild settings',
        })
      }

      const [updated] = await ctx.db
        .update(tenants)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
          ...(input.bannerUrl !== undefined && { bannerUrl: input.bannerUrl }),
          ...(input.settings && {
            settings: { ...ctx.tenant.settings, ...input.settings },
          }),
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenant.id))
        .returning()

      return updated
    }),

  // Generate new invite code
  regenerateInviteCode: tenantProcedure.mutation(async ({ ctx }) => {
    // Check if user is owner or officer
    const membership = await ctx.db.query.members.findFirst({
      where: and(
        eq(members.tenantId, ctx.tenant.id),
        eq(members.userId, ctx.user.id)
      ),
    })

    if (!membership || membership.role === 'member') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only officers and owners can regenerate invite codes',
      })
    }

    const [updated] = await ctx.db
      .update(tenants)
      .set({
        inviteCode: generateInviteCode(),
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, ctx.tenant.id))
      .returning()

    return updated.inviteCode
  }),

  // Join a guild via invite code
  join: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find tenant by invite code
      const tenant = await ctx.db.query.tenants.findFirst({
        where: eq(tenants.inviteCode, input.code),
      })

      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid invite code',
        })
      }

      // Check if already a member
      const existing = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.tenantId, tenant.id),
          eq(members.userId, ctx.user.id)
        ),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already a member of this guild',
        })
      }

      // Add as member
      await ctx.db.insert(members).values({
        tenantId: tenant.id,
        userId: ctx.user.id,
        role: 'member',
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
