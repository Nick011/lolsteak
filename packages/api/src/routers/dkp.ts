import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { dkpTransactions, dkpBalances } from '@guild/db/schema'
import { eq, and, desc, sql } from '@guild/db'

// DKP transaction types
const dkpTransactionTypes = [
  'raid_attendance',
  'boss_kill',
  'loot_purchase',
  'decay',
  'adjustment',
  'bonus',
] as const

export const dkpRouter = router({
  // Get DKP leaderboard/rankings
  leaderboard: tenantProcedure
    .input(
      z
        .object({
          limit: z.number().int().positive().default(50),
          offset: z.number().int().nonnegative().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.dkpBalances.findMany({
        where: eq(dkpBalances.tenantId, ctx.tenant.id),
        with: {
          member: {
            with: {
              user: true,
            },
          },
        },
        orderBy: desc(dkpBalances.currentBalance),
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      })
    }),

  // Get a specific member's DKP balance
  getBalance: tenantProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const balance = await ctx.db.query.dkpBalances.findFirst({
        where: and(
          eq(dkpBalances.tenantId, ctx.tenant.id),
          eq(dkpBalances.memberId, input.memberId)
        ),
      })

      return balance ?? null
    }),

  // Get transaction history
  getTransactions: tenantProcedure
    .input(
      z
        .object({
          memberId: z.string().uuid().optional(),
          type: z.enum(dkpTransactionTypes).optional(),
          limit: z.number().int().positive().default(50),
          offset: z.number().int().nonnegative().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(dkpTransactions.tenantId, ctx.tenant.id)]

      if (input?.memberId) {
        conditions.push(eq(dkpTransactions.memberId, input.memberId))
      }

      if (input?.type) {
        conditions.push(eq(dkpTransactions.type, input.type))
      }

      return ctx.db.query.dkpTransactions.findMany({
        where: and(...conditions),
        with: {
          member: true,
          event: true,
          character: true,
        },
        orderBy: desc(dkpTransactions.createdAt),
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      })
    }),

  // Award DKP to a member (officers only)
  award: officerProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
        amount: z.number().int().positive(),
        type: z.enum(dkpTransactionTypes),
        reason: z.string().optional(),
        eventId: z.string().uuid().optional(),
        characterId: z.string().uuid().optional(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create the transaction
      const [transaction] = await ctx.db
        .insert(dkpTransactions)
        .values({
          tenantId: ctx.tenant.id,
          memberId: input.memberId,
          characterId: input.characterId,
          amount: input.amount,
          type: input.type,
          reason: input.reason,
          eventId: input.eventId,
          awardedBy: ctx.member.id,
          metadata: input.metadata ?? {},
        })
        .returning()

      // Upsert the balance
      await ctx.db
        .insert(dkpBalances)
        .values({
          tenantId: ctx.tenant.id,
          memberId: input.memberId,
          currentBalance: input.amount,
          lifetimeEarned: input.amount,
          lifetimeSpent: 0,
          lastUpdated: new Date(),
        })
        .onConflictDoUpdate({
          target: [dkpBalances.tenantId, dkpBalances.memberId],
          set: {
            currentBalance: sql`${dkpBalances.currentBalance} + ${input.amount}`,
            lifetimeEarned: sql`${dkpBalances.lifetimeEarned} + ${input.amount}`,
            lastUpdated: new Date(),
          },
        })

      return transaction
    }),

  // Spend DKP (e.g., for loot purchases) (officers only)
  spend: officerProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
        amount: z.number().int().positive(),
        type: z.literal('loot_purchase'),
        reason: z.string().optional(),
        lootHistoryId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if member has sufficient balance
      const balance = await ctx.db.query.dkpBalances.findFirst({
        where: and(
          eq(dkpBalances.tenantId, ctx.tenant.id),
          eq(dkpBalances.memberId, input.memberId)
        ),
      })

      const currentBalance = balance?.currentBalance ?? 0

      if (currentBalance < input.amount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient DKP balance. Current: ${currentBalance}, Required: ${input.amount}`,
        })
      }

      // Create the transaction with negative amount
      const [transaction] = await ctx.db
        .insert(dkpTransactions)
        .values({
          tenantId: ctx.tenant.id,
          memberId: input.memberId,
          amount: -input.amount,
          type: input.type,
          reason: input.reason,
          lootHistoryId: input.lootHistoryId,
          awardedBy: ctx.member.id,
          metadata: {},
        })
        .returning()

      // Update the balance
      await ctx.db
        .insert(dkpBalances)
        .values({
          tenantId: ctx.tenant.id,
          memberId: input.memberId,
          currentBalance: -input.amount,
          lifetimeEarned: 0,
          lifetimeSpent: input.amount,
          lastUpdated: new Date(),
        })
        .onConflictDoUpdate({
          target: [dkpBalances.tenantId, dkpBalances.memberId],
          set: {
            currentBalance: sql`${dkpBalances.currentBalance} - ${input.amount}`,
            lifetimeSpent: sql`${dkpBalances.lifetimeSpent} + ${input.amount}`,
            lastUpdated: new Date(),
          },
        })

      return transaction
    }),

  // Award DKP to multiple members at once (e.g., raid attendance) (officers only)
  bulkAward: officerProcedure
    .input(
      z.object({
        memberIds: z.array(z.string().uuid()).min(1),
        amount: z.number().int().positive(),
        type: z.enum(dkpTransactionTypes),
        reason: z.string().optional(),
        eventId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create transactions for all members
      const transactionValues = input.memberIds.map(memberId => ({
        tenantId: ctx.tenant.id,
        memberId,
        amount: input.amount,
        type: input.type,
        reason: input.reason,
        eventId: input.eventId,
        awardedBy: ctx.member.id,
        metadata: {},
      }))

      await ctx.db.insert(dkpTransactions).values(transactionValues)

      // Update balances for all members
      for (const memberId of input.memberIds) {
        await ctx.db
          .insert(dkpBalances)
          .values({
            tenantId: ctx.tenant.id,
            memberId,
            currentBalance: input.amount,
            lifetimeEarned: input.amount,
            lifetimeSpent: 0,
            lastUpdated: new Date(),
          })
          .onConflictDoUpdate({
            target: [dkpBalances.tenantId, dkpBalances.memberId],
            set: {
              currentBalance: sql`${dkpBalances.currentBalance} + ${input.amount}`,
              lifetimeEarned: sql`${dkpBalances.lifetimeEarned} + ${input.amount}`,
              lastUpdated: new Date(),
            },
          })
      }

      return { awarded: input.memberIds.length }
    }),

  // Admin adjustment (can be positive or negative) (officers only)
  adjust: officerProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
        amount: z.number().int(),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create the transaction
      const [transaction] = await ctx.db
        .insert(dkpTransactions)
        .values({
          tenantId: ctx.tenant.id,
          memberId: input.memberId,
          amount: input.amount,
          type: 'adjustment',
          reason: input.reason,
          awardedBy: ctx.member.id,
          metadata: {},
        })
        .returning()

      // Update the balance accordingly
      const balanceChange = input.amount
      const isPositive = input.amount > 0

      await ctx.db
        .insert(dkpBalances)
        .values({
          tenantId: ctx.tenant.id,
          memberId: input.memberId,
          currentBalance: balanceChange,
          lifetimeEarned: isPositive ? balanceChange : 0,
          lifetimeSpent: isPositive ? 0 : -balanceChange,
          lastUpdated: new Date(),
        })
        .onConflictDoUpdate({
          target: [dkpBalances.tenantId, dkpBalances.memberId],
          set: {
            currentBalance: sql`${dkpBalances.currentBalance} + ${balanceChange}`,
            lifetimeEarned: isPositive
              ? sql`${dkpBalances.lifetimeEarned} + ${balanceChange}`
              : dkpBalances.lifetimeEarned,
            lifetimeSpent: !isPositive
              ? sql`${dkpBalances.lifetimeSpent} + ${-balanceChange}`
              : dkpBalances.lifetimeSpent,
            lastUpdated: new Date(),
          },
        })

      return transaction
    }),
})
