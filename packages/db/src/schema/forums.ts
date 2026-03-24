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
import { tenants, members } from './tenants'

export const forumCategories = pgTable(
  'forum_categories',
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
    icon: varchar('icon', { length: 50 }), // Icon name for UI

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Ensure unique slugs per tenant
    uniqueSlugPerTenant: unique().on(table.tenantId, table.slug),
  })
)

export const forumThreads = pgTable('forum_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => forumCategories.id, { onDelete: 'cascade' }),

  // Thread details
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // Markdown content - the opening post
  authorId: uuid('author_id').references(() => members.id, {
    onDelete: 'set null',
  }),

  // Thread state
  isPinned: boolean('is_pinned').notNull().default(false),
  isLocked: boolean('is_locked').notNull().default(false), // Prevents new posts

  // Metrics
  viewCount: integer('view_count').notNull().default(0),
  lastPostAt: timestamp('last_post_at'), // For sorting by activity

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const forumPosts = pgTable('forum_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  threadId: uuid('thread_id')
    .notNull()
    .references(() => forumThreads.id, { onDelete: 'cascade' }),

  // Post details
  content: text('content').notNull(), // Markdown content
  authorId: uuid('author_id').references(() => members.id, {
    onDelete: 'set null',
  }),

  // Nested replies - column only, no FK constraint to avoid circular type issues
  replyToId: uuid('reply_to_id'),

  // Post state
  isEdited: boolean('is_edited').notNull().default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const forumCategoriesRelations = relations(
  forumCategories,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [forumCategories.tenantId],
      references: [tenants.id],
    }),
    threads: many(forumThreads),
  })
)

export const forumThreadsRelations = relations(
  forumThreads,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [forumThreads.tenantId],
      references: [tenants.id],
    }),
    category: one(forumCategories, {
      fields: [forumThreads.categoryId],
      references: [forumCategories.id],
    }),
    author: one(members, {
      fields: [forumThreads.authorId],
      references: [members.id],
    }),
    posts: many(forumPosts),
  })
)

export const forumPostsRelations = relations(forumPosts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [forumPosts.tenantId],
    references: [tenants.id],
  }),
  thread: one(forumThreads, {
    fields: [forumPosts.threadId],
    references: [forumThreads.id],
  }),
  author: one(members, {
    fields: [forumPosts.authorId],
    references: [members.id],
  }),
}))
