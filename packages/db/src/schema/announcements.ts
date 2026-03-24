import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, members } from './tenants'

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // Markdown content
  authorId: uuid('author_id').references(() => members.id, {
    onDelete: 'set null',
  }),
  isPinned: boolean('is_pinned').notNull().default(false),
  publishedAt: timestamp('published_at'), // null means draft
  expiresAt: timestamp('expires_at'), // null means never expires
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const announcementsRelations = relations(announcements, ({ one }) => ({
  tenant: one(tenants, {
    fields: [announcements.tenantId],
    references: [tenants.id],
  }),
  author: one(members, {
    fields: [announcements.authorId],
    references: [members.id],
  }),
}))
