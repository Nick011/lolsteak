import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  pgEnum,
  unique,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, members } from './tenants'

export const guideCategoryEnum = pgEnum('guide_category', [
  'raid_strats',
  'class_guides',
  'pvp',
  'professions',
  'general',
])

export const guides = pgTable(
  'guides',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Content fields
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    excerpt: text('excerpt'), // Short description
    content: text('content').notNull(), // Markdown content

    // Author and categorization
    authorId: uuid('author_id').references(() => members.id, {
      onDelete: 'set null',
    }),
    category: guideCategoryEnum('category').notNull(),
    tags: jsonb('tags').default([]).$type<GuideTags>(),

    // Publishing status
    isPublished: boolean('is_published').notNull().default(false),
    publishedAt: timestamp('published_at'),

    // Metrics
    viewCount: integer('view_count').notNull().default(0),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Ensure unique slug per tenant
    uniqueSlugPerTenant: unique().on(table.tenantId, table.slug),
  })
)

export const guidesRelations = relations(guides, ({ one }) => ({
  tenant: one(tenants, {
    fields: [guides.tenantId],
    references: [tenants.id],
  }),
  author: one(members, {
    fields: [guides.authorId],
    references: [members.id],
  }),
}))

/**
 * Type for guide tags - array of strings for searchability
 */
export type GuideTags = string[]
