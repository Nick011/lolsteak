import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const gameTypeEnum = pgEnum('game_type', [
  'wow_classic',
  'wow_retail',
  'ff14',
  'lol',
  'dota2',
  'cs2',
  'rocket_league',
  'other',
])

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'officer',
  'member',
])

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  gameType: gameTypeEnum('game_type').notNull().default('wow_classic'),
  description: text('description'),
  settings: jsonb('settings').default({}).$type<TenantSettings>(),
  customDomain: varchar('custom_domain', { length: 255 }).unique(),
  discordServerId: varchar('discord_server_id', { length: 50 }),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').notNull().default('member'),
  nickname: varchar('nickname', { length: 100 }),
  notes: text('notes'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const tenantsRelations = relations(tenants, ({ many }) => ({
  members: many(members),
}))

export const membersRelations = relations(members, ({ one }) => ({
  tenant: one(tenants, {
    fields: [members.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}))

// Type for tenant settings
export interface TenantSettings {
  timezone?: string
  defaultRaidSize?: number
  lootSystem?: 'dkp' | 'loot_council' | 'soft_reserve' | 'gdkp' | 'need_greed'
  features?: {
    events?: boolean
    lootTracking?: boolean
    attendance?: boolean
  }
}
