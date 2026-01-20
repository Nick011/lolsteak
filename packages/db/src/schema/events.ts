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
import { tenants } from './tenants'
import { characters } from './characters'

export const eventTypeEnum = pgEnum('event_type', [
  'raid',
  'dungeon',
  'pvp',
  'social',
  'other',
])

export const signupStatusEnum = pgEnum('signup_status', [
  'confirmed',
  'tentative',
  'declined',
  'standby',
])

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  eventType: eventTypeEnum('event_type').notNull().default('raid'),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  location: varchar('location', { length: 255 }), // e.g., "Naxxramas", "Karazhan"
  maxSize: integer('max_size'),
  settings: jsonb('settings').default({}).$type<EventSettings>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const eventSignups = pgTable('event_signups', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id')
    .notNull()
    .references(() => characters.id, { onDelete: 'cascade' }),
  status: signupStatusEnum('status').notNull().default('confirmed'),
  role: varchar('role', { length: 50 }), // tank, healer, dps, or custom
  notes: text('notes'),
  signedUpAt: timestamp('signed_up_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const eventsRelations = relations(events, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [events.tenantId],
    references: [tenants.id],
  }),
  signups: many(eventSignups),
}))

export const eventSignupsRelations = relations(eventSignups, ({ one }) => ({
  event: one(events, {
    fields: [eventSignups.eventId],
    references: [events.id],
  }),
  character: one(characters, {
    fields: [eventSignups.characterId],
    references: [characters.id],
  }),
}))

export interface EventSettings {
  softReserveEnabled?: boolean
  softReserveLimit?: number
  discordThreadId?: string
  raidHelperEventId?: string
  requiredRoles?: {
    tanks?: number
    healers?: number
    dps?: number
  }
}
