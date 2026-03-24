import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  varchar,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants } from './tenants'

export const faqCategories = pgTable(
  'faq_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Category details
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Ensure unique slugs per tenant
    uniqueSlugPerTenant: unique().on(table.tenantId, table.slug),
  })
)

export const faqItems = pgTable('faq_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => faqCategories.id, { onDelete: 'cascade' }),

  // FAQ details
  question: varchar('question', { length: 500 }).notNull(),
  answer: text('answer').notNull(), // Markdown content
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const faqCategoriesRelations = relations(
  faqCategories,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [faqCategories.tenantId],
      references: [tenants.id],
    }),
    items: many(faqItems),
  })
)

export const faqItemsRelations = relations(faqItems, ({ one }) => ({
  tenant: one(tenants, {
    fields: [faqItems.tenantId],
    references: [tenants.id],
  }),
  category: one(faqCategories, {
    fields: [faqItems.categoryId],
    references: [faqCategories.id],
  }),
}))
