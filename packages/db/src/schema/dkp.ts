import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, members } from './tenants'
import { characters } from './characters'
import { events } from './events'
import { lootHistory } from './loot'

export const dkpTransactionTypeEnum = pgEnum('dkp_transaction_type', [
  'raid_attendance',
  'boss_kill',
  'loot_purchase',
  'decay',
  'adjustment',
  'bonus',
])

export const dkpTransactions = pgTable('dkp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'set null',
  }),

  // Transaction details
  amount: integer('amount').notNull(), // Positive for earned, negative for spent
  type: dkpTransactionTypeEnum('type').notNull(),
  reason: text('reason'), // Optional description

  // References to related entities
  lootHistoryId: uuid('loot_history_id').references(() => lootHistory.id, {
    onDelete: 'set null',
  }),
  eventId: uuid('event_id').references(() => events.id, {
    onDelete: 'set null',
  }),
  awardedBy: uuid('awarded_by').references(() => members.id, {
    onDelete: 'set null',
  }), // The officer who awarded the points

  // Flexible metadata storage
  metadata: jsonb('metadata').default({}).$type<DkpTransactionMetadata>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const dkpBalances = pgTable(
  'dkp_balances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),

    // Balance tracking
    currentBalance: integer('current_balance').notNull().default(0),
    lifetimeEarned: integer('lifetime_earned').notNull().default(0),
    lifetimeSpent: integer('lifetime_spent').notNull().default(0),

    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  },
  table => ({
    // Ensure one balance record per member per tenant
    uniqueMemberPerTenant: unique().on(table.tenantId, table.memberId),
  })
)

export const dkpTransactionsRelations = relations(
  dkpTransactions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [dkpTransactions.tenantId],
      references: [tenants.id],
    }),
    member: one(members, {
      fields: [dkpTransactions.memberId],
      references: [members.id],
    }),
    character: one(characters, {
      fields: [dkpTransactions.characterId],
      references: [characters.id],
    }),
    lootHistory: one(lootHistory, {
      fields: [dkpTransactions.lootHistoryId],
      references: [lootHistory.id],
    }),
    event: one(events, {
      fields: [dkpTransactions.eventId],
      references: [events.id],
    }),
    awardedByMember: one(members, {
      fields: [dkpTransactions.awardedBy],
      references: [members.id],
    }),
  })
)

export const dkpBalancesRelations = relations(dkpBalances, ({ one }) => ({
  tenant: one(tenants, {
    fields: [dkpBalances.tenantId],
    references: [tenants.id],
  }),
  member: one(members, {
    fields: [dkpBalances.memberId],
    references: [members.id],
  }),
}))

/**
 * Metadata type for flexible DKP transaction data
 */
export interface DkpTransactionMetadata {
  // Boss kill specific
  bossName?: string
  difficultyLevel?: string

  // Raid attendance specific
  raidDuration?: number // minutes
  raidZone?: string

  // Decay specific
  decayPercentage?: number
  previousBalance?: number

  // Adjustment specific
  adjustmentReason?: string
  officerNote?: string

  // Bonus specific
  bonusType?: string // e.g., "progression_bonus", "performance_bonus"

  // Import tracking
  importSource?: string // e.g., "manual", "gargul", "warcraftlogs"
  importHash?: string // For deduplication

  // General
  [key: string]: unknown
}
