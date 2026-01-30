import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import {
  lootHistory,
  characters,
  dkpTransactions,
  dkpBalances,
} from '@guild/db/schema'
import { eq, and, desc, ilike, sql } from '@guild/db'

export const lootRouter = router({
  // List loot history
  list: tenantProcedure
    .input(
      z
        .object({
          characterId: z.string().uuid().optional(),
          search: z.string().optional(),
          limit: z.number().int().positive().default(50),
          offset: z.number().int().nonnegative().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(lootHistory.tenantId, ctx.tenant.id)]

      if (input?.characterId) {
        conditions.push(eq(lootHistory.characterId, input.characterId))
      }

      if (input?.search) {
        conditions.push(ilike(lootHistory.itemName, `%${input.search}%`))
      }

      return ctx.db.query.lootHistory.findMany({
        where: and(...conditions),
        with: {
          character: true,
          event: true,
        },
        orderBy: desc(lootHistory.awardedAt),
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      })
    }),

  // Record a loot drop (officers only)
  record: officerProcedure
    .input(
      z.object({
        characterName: z.string().min(1).max(100),
        characterId: z.string().uuid().optional(),
        itemId: z.number().int().optional(),
        itemName: z.string().min(1).max(255),
        itemLink: z.string().optional(),
        source: z.string().max(100).optional(),
        sourceType: z.string().max(50).optional(),
        cost: z.number().int().optional(),
        rollType: z.string().max(50).optional(),
        awardedAt: z.string().datetime().optional(),
        eventId: z.string().uuid().optional(),
        metadata: z.record(z.unknown()).optional(),
        deductDkp: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Try to match character by name if not provided
      let characterId = input.characterId
      let character = null
      if (!characterId) {
        character = await ctx.db.query.characters.findFirst({
          where: and(
            eq(characters.tenantId, ctx.tenant.id),
            eq(characters.name, input.characterName)
          ),
        })
        characterId = character?.id
      } else {
        character = await ctx.db.query.characters.findFirst({
          where: and(
            eq(characters.tenantId, ctx.tenant.id),
            eq(characters.id, characterId)
          ),
        })
      }

      const [loot] = await ctx.db
        .insert(lootHistory)
        .values({
          tenantId: ctx.tenant.id,
          characterId,
          characterName: input.characterName,
          itemId: input.itemId,
          itemName: input.itemName,
          itemLink: input.itemLink,
          source: input.source,
          sourceType: input.sourceType,
          cost: input.cost,
          rollType: input.rollType,
          eventId: input.eventId,
          awardedAt: input.awardedAt ? new Date(input.awardedAt) : new Date(),
          importSource: 'manual',
          metadata: input.metadata ?? {},
        })
        .returning()

      // DKP deduction logic
      if (input.deductDkp && input.cost && character?.memberId) {
        const balance = await ctx.db.query.dkpBalances.findFirst({
          where: and(
            eq(dkpBalances.tenantId, ctx.tenant.id),
            eq(dkpBalances.memberId, character.memberId)
          ),
        })

        if (balance && balance.currentBalance >= input.cost) {
          // Sufficient balance - deduct DKP
          await ctx.db.insert(dkpTransactions).values({
            tenantId: ctx.tenant.id,
            memberId: character.memberId,
            characterId: character.id,
            amount: -input.cost,
            type: 'loot_purchase',
            reason: `Purchased ${input.itemName}`,
            lootHistoryId: loot.id,
            eventId: input.eventId,
            awardedBy: ctx.member.id,
            metadata: {
              itemId: input.itemId,
              itemName: input.itemName,
            },
          })

          await ctx.db
            .update(dkpBalances)
            .set({
              currentBalance: sql`${dkpBalances.currentBalance} - ${input.cost}`,
              lifetimeSpent: sql`${dkpBalances.lifetimeSpent} + ${input.cost}`,
              lastUpdated: new Date(),
            })
            .where(eq(dkpBalances.id, balance.id))
        } else {
          // Insufficient balance or no balance record
          await ctx.db
            .update(lootHistory)
            .set({
              metadata: {
                ...loot.metadata,
                dkpNotDeducted: true,
                dkpNotDeductedReason: balance
                  ? 'insufficient_balance'
                  : 'no_balance_record',
                currentBalance: balance?.currentBalance ?? 0,
                requiredCost: input.cost,
              },
            })
            .where(eq(lootHistory.id, loot.id))
        }
      }

      return loot
    }),

  // Bulk import loot (for Gargul CSV)
  bulkImport: officerProcedure
    .input(
      z.object({
        items: z
          .array(
            z.object({
              characterName: z.string(),
              itemId: z.number().int().optional(),
              itemName: z.string(),
              itemLink: z.string().optional(),
              source: z.string().optional(),
              cost: z.number().int().optional(),
              awardedAt: z.string().datetime(),
              rollType: z.string().optional(),
              importHash: z.string(),
              metadata: z.record(z.unknown()).optional(),
            })
          )
          .max(500, 'Maximum 500 items per import'),
        importSource: z.string().default('gargul'),
        deductDkp: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build a map of character names to IDs and memberId
      const allCharacters = await ctx.db.query.characters.findMany({
        where: eq(characters.tenantId, ctx.tenant.id),
      })
      const charMap = new Map(
        allCharacters.map(c => [
          c.name.toLowerCase(),
          { id: c.id, memberId: c.memberId },
        ])
      )

      // Fetch all DKP balances upfront for efficiency
      const allBalances = await ctx.db.query.dkpBalances.findMany({
        where: eq(dkpBalances.tenantId, ctx.tenant.id),
      })
      const balanceMap = new Map(allBalances.map(b => [b.memberId, b]))

      // Filter out duplicates by checking import hash
      const existingHashes = await ctx.db.query.lootHistory.findMany({
        where: eq(lootHistory.tenantId, ctx.tenant.id),
        columns: { importHash: true },
      })
      const hashSet = new Set(existingHashes.map(l => l.importHash))

      // Filter duplicates - both from DB and within the batch itself
      const seen = new Set(hashSet)
      const newItems = input.items.filter(item => {
        if (seen.has(item.importHash)) return false
        seen.add(item.importHash)
        return true
      })

      if (newItems.length === 0) {
        return {
          imported: 0,
          skipped: input.items.length,
          dkpDeducted: 0,
          dkpSkipped: 0,
        }
      }

      const values = newItems.map(item => ({
        tenantId: ctx.tenant.id,
        characterId: charMap.get(item.characterName.toLowerCase())?.id,
        characterName: item.characterName,
        itemId: item.itemId,
        itemName: item.itemName,
        itemLink: item.itemLink,
        source: item.source,
        cost: item.cost,
        awardedAt: new Date(item.awardedAt),
        rollType: item.rollType,
        importSource: input.importSource,
        importHash: item.importHash,
        metadata: item.metadata ?? {},
      }))

      const insertedLoot = await ctx.db
        .insert(lootHistory)
        .values(values)
        .returning()

      // DKP deduction logic for bulk import
      let dkpDeducted = 0
      let dkpSkipped = 0

      if (input.deductDkp) {
        const dkpTransactionsToInsert = []
        const balanceUpdates = new Map()

        for (const loot of insertedLoot) {
          if (!loot.cost) {
            continue // Skip items without cost
          }

          const charInfo = charMap.get(loot.characterName.toLowerCase())
          if (!charInfo?.memberId) {
            dkpSkipped++
            continue // Skip if character has no linked member
          }

          const balance = balanceMap.get(charInfo.memberId)
          if (!balance || balance.currentBalance < loot.cost) {
            // Insufficient balance - mark in metadata
            await ctx.db
              .update(lootHistory)
              .set({
                metadata: {
                  ...loot.metadata,
                  dkpNotDeducted: true,
                  dkpNotDeductedReason: balance
                    ? 'insufficient_balance'
                    : 'no_balance_record',
                  currentBalance: balance?.currentBalance ?? 0,
                  requiredCost: loot.cost,
                },
              })
              .where(eq(lootHistory.id, loot.id))
            dkpSkipped++
            continue
          }

          // Sufficient balance - prepare transaction
          dkpTransactionsToInsert.push({
            tenantId: ctx.tenant.id,
            memberId: charInfo.memberId,
            characterId: charInfo.id,
            amount: -loot.cost,
            type: 'loot_purchase' as const,
            reason: `Purchased ${loot.itemName}`,
            lootHistoryId: loot.id,
            eventId: null,
            awardedBy: ctx.member.id,
            metadata: {
              itemId: loot.itemId,
              itemName: loot.itemName,
            },
          })

          // Track balance update
          const currentUpdate = balanceUpdates.get(balance.id) || {
            id: balance.id,
            totalCost: 0,
          }
          currentUpdate.totalCost += loot.cost
          balanceUpdates.set(balance.id, currentUpdate)

          dkpDeducted++
        }

        // Insert all DKP transactions in one batch
        if (dkpTransactionsToInsert.length > 0) {
          await ctx.db.insert(dkpTransactions).values(dkpTransactionsToInsert)
        }

        // Update all balances in batch
        for (const [balanceId, update] of balanceUpdates) {
          await ctx.db
            .update(dkpBalances)
            .set({
              currentBalance: sql`${dkpBalances.currentBalance} - ${update.totalCost}`,
              lifetimeSpent: sql`${dkpBalances.lifetimeSpent} + ${update.totalCost}`,
              lastUpdated: new Date(),
            })
            .where(eq(dkpBalances.id, balanceId))
        }
      }

      return {
        imported: newItems.length,
        skipped: input.items.length - newItems.length,
        dkpDeducted,
        dkpSkipped,
      }
    }),
})
