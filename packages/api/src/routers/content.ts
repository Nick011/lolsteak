import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { faqCategories, faqItems, guides } from '@guild/db/schema'
import { eq, and, desc, ilike, sql } from '@guild/db'

// Guide category enum values
const guideCategoryValues = [
  'raid_strats',
  'class_guides',
  'pvp',
  'professions',
  'general',
] as const

export const contentRouter = router({
  // ===========================
  // FAQ Category Endpoints
  // ===========================

  // List all FAQ categories with their items
  faqCategories: tenantProcedure.query(async ({ ctx }) => {
    return ctx.db.query.faqCategories.findMany({
      where: eq(faqCategories.tenantId, ctx.tenant.id),
      with: {
        items: {
          where: eq(faqItems.isPublished, true),
          orderBy: [faqItems.sortOrder, faqItems.createdAt],
        },
      },
      orderBy: [faqCategories.sortOrder, faqCategories.createdAt],
    })
  }),

  // List FAQ items, optionally filtered by category
  faqItems: tenantProcedure
    .input(
      z
        .object({
          categoryId: z.string().uuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(faqItems.tenantId, ctx.tenant.id),
        eq(faqItems.isPublished, true),
      ]

      if (input?.categoryId) {
        conditions.push(eq(faqItems.categoryId, input.categoryId))
      }

      return ctx.db.query.faqItems.findMany({
        where: and(...conditions),
        with: {
          category: true,
        },
        orderBy: [faqItems.sortOrder, faqItems.createdAt],
      })
    }),

  // Create a new FAQ category (officers only)
  createFaqCategory: officerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await ctx.db
        .insert(faqCategories)
        .values({
          tenantId: ctx.tenant.id,
          name: input.name,
          slug: input.slug,
          description: input.description,
          sortOrder: input.sortOrder,
        })
        .returning()

      return category
    }),

  // Update an FAQ category (officers only)
  updateFaqCategory: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const [category] = await ctx.db
        .update(faqCategories)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(faqCategories.id, id),
            eq(faqCategories.tenantId, ctx.tenant.id)
          )
        )
        .returning()

      return category
    }),

  // Delete an FAQ category (officers only)
  deleteFaqCategory: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(faqCategories)
        .where(
          and(
            eq(faqCategories.id, input.id),
            eq(faqCategories.tenantId, ctx.tenant.id)
          )
        )
    }),

  // ===========================
  // FAQ Item Endpoints
  // ===========================

  // Create a new FAQ item (officers only)
  createFaqItem: officerProcedure
    .input(
      z.object({
        categoryId: z.string().uuid(),
        question: z.string().min(1).max(500),
        answer: z.string().min(1),
        sortOrder: z.number().int().default(0),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .insert(faqItems)
        .values({
          tenantId: ctx.tenant.id,
          categoryId: input.categoryId,
          question: input.question,
          answer: input.answer,
          sortOrder: input.sortOrder,
          isPublished: input.isPublished,
        })
        .returning()

      return item
    }),

  // Update an FAQ item (officers only)
  updateFaqItem: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        categoryId: z.string().uuid().optional(),
        question: z.string().min(1).max(500).optional(),
        answer: z.string().min(1).optional(),
        sortOrder: z.number().int().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const [item] = await ctx.db
        .update(faqItems)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(faqItems.id, id), eq(faqItems.tenantId, ctx.tenant.id)))
        .returning()

      return item
    }),

  // Delete an FAQ item (officers only)
  deleteFaqItem: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(faqItems)
        .where(
          and(eq(faqItems.id, input.id), eq(faqItems.tenantId, ctx.tenant.id))
        )
    }),

  // ===========================
  // Guides Endpoints
  // ===========================

  // List guides with optional filtering
  guides: tenantProcedure
    .input(
      z
        .object({
          category: z.enum(guideCategoryValues).optional(),
          published: z.boolean().optional(),
          search: z.string().optional(),
          limit: z.number().int().positive().default(50),
          offset: z.number().int().nonnegative().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(guides.tenantId, ctx.tenant.id)]

      if (input?.category) {
        conditions.push(eq(guides.category, input.category))
      }

      if (input?.published !== undefined) {
        conditions.push(eq(guides.isPublished, input.published))
      }

      if (input?.search) {
        conditions.push(ilike(guides.title, `%${input.search}%`))
      }

      return ctx.db.query.guides.findMany({
        where: and(...conditions),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
        orderBy: desc(guides.createdAt),
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      })
    }),

  // Get a specific guide by slug and increment view count
  guideBySlug: tenantProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const guide = await ctx.db.query.guides.findFirst({
        where: and(
          eq(guides.tenantId, ctx.tenant.id),
          eq(guides.slug, input.slug)
        ),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
      })

      if (guide) {
        // Increment view count
        await ctx.db
          .update(guides)
          .set({
            viewCount: sql`${guides.viewCount} + 1`,
          })
          .where(eq(guides.id, guide.id))
      }

      return guide
    }),

  // Create a new guide (officers only)
  createGuide: officerProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        category: z.enum(guideCategoryValues),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [guide] = await ctx.db
        .insert(guides)
        .values({
          tenantId: ctx.tenant.id,
          authorId: ctx.member.id,
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          content: input.content,
          category: input.category,
          tags: input.tags ?? [],
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
        })
        .returning()

      return guide
    }),

  // Update a guide (officers only)
  updateGuide: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        category: z.enum(guideCategoryValues).optional(),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const [guide] = await ctx.db
        .update(guides)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(guides.id, id), eq(guides.tenantId, ctx.tenant.id)))
        .returning()

      return guide
    }),

  // Delete a guide (officers only)
  deleteGuide: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(guides)
        .where(and(eq(guides.id, input.id), eq(guides.tenantId, ctx.tenant.id)))
    }),

  // Publish a guide (officers only)
  publishGuide: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [guide] = await ctx.db
        .update(guides)
        .set({
          isPublished: true,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(guides.id, input.id), eq(guides.tenantId, ctx.tenant.id)))
        .returning()

      return guide
    }),
})
