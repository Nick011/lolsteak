import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants } from './tenants'

export const integrationTypeEnum = pgEnum('integration_type', [
  'discord',
  'warcraft_logs',
  'thatsmybis',
  'softres',
  'battlenet',
])

export const integrationStatusEnum = pgEnum('integration_status', [
  'active',
  'inactive',
  'error',
  'pending',
])

export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  type: integrationTypeEnum('type').notNull(),
  status: integrationStatusEnum('status').notNull().default('pending'),

  // Integration-specific configuration
  config: jsonb('config').default({}).$type<IntegrationConfig>(),

  // Credentials (encrypted at rest)
  credentials: jsonb('credentials').default({}).$type<IntegrationCredentials>(),

  // Sync state
  lastSyncAt: timestamp('last_sync_at'),
  lastError: text('last_error'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const integrationsRelations = relations(integrations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [integrations.tenantId],
    references: [tenants.id],
  }),
}))

export interface IntegrationConfig {
  // Discord
  guildId?: string
  channelIds?: {
    announcements?: string
    signups?: string
    loot?: string
  }
  roleIds?: {
    officer?: string
    member?: string
    raider?: string
  }

  // Warcraft Logs
  wclGuildId?: string
  wclRegion?: string
  wclRealm?: string

  // General
  syncEnabled?: boolean
  syncInterval?: number // minutes
  [key: string]: unknown
}

export interface IntegrationCredentials {
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  apiKey?: string
  webhookUrl?: string
  [key: string]: unknown
}
