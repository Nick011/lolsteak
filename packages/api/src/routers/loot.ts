import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { lootHistory, characters } from '@guild/db/schema'
import { eq, and, desc, ilike } from '@guild/db'

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
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Try to match character by name if not provided
      let characterId = input.characterId
      if (!characterId) {
        const character = await ctx.db.query.characters.findFirst({
          where: and(
            eq(characters.tenantId, ctx.tenant.id),
            eq(characters.name, input.characterName)
          ),
        })
        characterId = character?.id
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
              awardedAt: z.string().datetime(),
              rollType: z.string().optional(),
              importHash: z.string(),
              metadata: z.record(z.unknown()).optional(),
            })
          )
          .max(500, 'Maximum 500 items per import'),
        importSource: z.string().default('gargul'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build a map of character names to IDs
      const allCharacters = await ctx.db.query.characters.findMany({
        where: eq(characters.tenantId, ctx.tenant.id),
      })
      const charMap = new Map(
        allCharacters.map(c => [c.name.toLowerCase(), c.id])
      )

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
        return { imported: 0, skipped: input.items.length }
      }

      const values = newItems.map(item => ({
        tenantId: ctx.tenant.id,
        characterId: charMap.get(item.characterName.toLowerCase()),
        characterName: item.characterName,
        itemId: item.itemId,
        itemName: item.itemName,
        itemLink: item.itemLink,
        source: item.source,
        awardedAt: new Date(item.awardedAt),
        rollType: item.rollType,
        importSource: input.importSource,
        importHash: item.importHash,
        metadata: item.metadata ?? {},
      }))

      await ctx.db.insert(lootHistory).values(values)

      return {
        imported: newItems.length,
        skipped: input.items.length - newItems.length,
      }
    }),
})
