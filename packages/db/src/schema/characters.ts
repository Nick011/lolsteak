import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, members } from './tenants'

export const wowClassEnum = pgEnum('wow_class', [
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

export const wowRoleEnum = pgEnum('wow_role', ['tank', 'healer', 'dps'])

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 100 }).notNull(),
  realm: varchar('realm', { length: 100 }),
  class: wowClassEnum('class'),
  spec: varchar('spec', { length: 50 }),
  role: wowRoleEnum('role'),
  level: integer('level'),
  // Flexible storage for game-specific data
  gameData: jsonb('game_data').default({}).$type<CharacterGameData>(),
  isMain: text('is_main').default('false'), // Using text for boolean to work with RLS
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const charactersRelations = relations(characters, ({ one }) => ({
  tenant: one(tenants, {
    fields: [characters.tenantId],
    references: [tenants.id],
  }),
  member: one(members, {
    fields: [characters.memberId],
    references: [members.id],
  }),
}))

// Flexible game data type
export interface CharacterGameData {
  // WoW specific
  guild?: string
  guildRank?: string
  professions?: string[]
  gearscore?: number
  warcraftLogsId?: string
  // General
  notes?: string
  [key: string]: unknown
}
