import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants } from './tenants'
import { characters } from './characters'
import { events } from './events'

export const lootHistory = pgTable('loot_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'set null',
  }),
  characterName: varchar('character_name', { length: 100 }).notNull(), // Denormalized for imports
  eventId: uuid('event_id').references(() => events.id, {
    onDelete: 'set null',
  }),

  // Item information
  itemId: integer('item_id'), // WoW item ID
  itemName: varchar('item_name', { length: 255 }).notNull(),
  itemLink: text('item_link'), // WoW item link string

  // Source information
  source: varchar('source', { length: 100 }), // e.g., "Kel'Thuzad", "Gruul"
  sourceType: varchar('source_type', { length: 50 }), // boss, trash, crafted, etc.

  // Loot system info
  cost: integer('cost'), // DKP/GDKP cost
  rollType: varchar('roll_type', { length: 50 }), // MS, OS, SR, etc.

  // Import tracking
  importSource: varchar('import_source', { length: 50 }), // gargul, manual, warcraftlogs
  importHash: varchar('import_hash', { length: 64 }), // For deduplication

  // Flexible metadata
  metadata: jsonb('metadata').default({}).$type<LootMetadata>(),

  awardedAt: timestamp('awarded_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const lootHistoryRelations = relations(lootHistory, ({ one }) => ({
  tenant: one(tenants, {
    fields: [lootHistory.tenantId],
    references: [tenants.id],
  }),
  character: one(characters, {
    fields: [lootHistory.characterId],
    references: [characters.id],
  }),
  event: one(events, {
    fields: [lootHistory.eventId],
    references: [events.id],
  }),
}))

export interface LootMetadata {
  // Gargul-specific
  gargulSessionId?: string
  softReserved?: boolean
  plusRoll?: number
  // General
  officerNote?: string
  [key: string]: unknown
}
