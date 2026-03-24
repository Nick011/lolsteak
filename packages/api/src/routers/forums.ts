import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { forumCategories, forumThreads, forumPosts } from '@guild/db/schema'
import { eq, and, desc, sql } from '@guild/db'

export const forumsRouter = router({
  // ===========================
  // Category Endpoints
  // ===========================

  // List all categories with thread counts
  categories: tenantProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.query.forumCategories.findMany({
      where: eq(forumCategories.tenantId, ctx.tenant.id),
      orderBy: [forumCategories.sortOrder, forumCategories.createdAt],
    })

    // Get thread counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async category => {
        const threads = await ctx.db.query.forumThreads.findMany({
          where: and(
            eq(forumThreads.tenantId, ctx.tenant.id),
            eq(forumThreads.categoryId, category.id)
          ),
        })

        return {
          ...category,
          threadCount: threads.length,
        }
      })
    )

    return categoriesWithCounts
  }),

  // Create a new category (officers only)
  createCategory: officerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
        sortOrder: z.number().int().default(0),
        icon: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await ctx.db
        .insert(forumCategories)
        .values({
          tenantId: ctx.tenant.id,
          name: input.name,
          slug: input.slug,
          description: input.description,
          sortOrder: input.sortOrder,
          icon: input.icon,
        })
        .returning()

      return category
    }),

  // Update a category (officers only)
  updateCategory: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        sortOrder: z.number().int().optional(),
        icon: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const [category] = await ctx.db
        .update(forumCategories)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(forumCategories.id, id),
            eq(forumCategories.tenantId, ctx.tenant.id)
          )
        )
        .returning()

      return category
    }),

  // Delete a category (officers only)
  deleteCategory: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(forumCategories)
        .where(
          and(
            eq(forumCategories.id, input.id),
            eq(forumCategories.tenantId, ctx.tenant.id)
          )
        )
    }),

  // ===========================
  // Thread Endpoints
  // ===========================

  // List threads by category
  threads: tenantProcedure
    .input(
      z.object({
        categoryId: z.string().uuid(),
        limit: z.number().int().positive().default(50),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const threads = await ctx.db.query.forumThreads.findMany({
        where: and(
          eq(forumThreads.tenantId, ctx.tenant.id),
          eq(forumThreads.categoryId, input.categoryId)
        ),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
        orderBy: [desc(forumThreads.isPinned), desc(forumThreads.lastPostAt)],
        limit: input.limit,
        offset: input.offset,
      })

      // Get post count for each thread
      const threadsWithCounts = await Promise.all(
        threads.map(async thread => {
          const posts = await ctx.db.query.forumPosts.findMany({
            where: and(
              eq(forumPosts.tenantId, ctx.tenant.id),
              eq(forumPosts.threadId, thread.id)
            ),
          })

          return {
            ...thread,
            postCount: posts.length,
          }
        })
      )

      return threadsWithCounts
    }),

  // Get a specific thread with posts
  threadById: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.query.forumThreads.findFirst({
        where: and(
          eq(forumThreads.tenantId, ctx.tenant.id),
          eq(forumThreads.id, input.id)
        ),
        with: {
          author: {
            with: {
              user: true,
            },
          },
          category: true,
          posts: {
            with: {
              author: {
                with: {
                  user: true,
                },
              },
            },
            orderBy: [forumPosts.createdAt],
          },
        },
      })

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      // Increment view count
      await ctx.db
        .update(forumThreads)
        .set({
          viewCount: sql`${forumThreads.viewCount} + 1`,
        })
        .where(eq(forumThreads.id, thread.id))

      return thread
    }),

  // Create a new thread (any member can create)
  createThread: tenantProcedure
    .input(
      z.object({
        categoryId: z.string().uuid(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [thread] = await ctx.db
        .insert(forumThreads)
        .values({
          tenantId: ctx.tenant.id,
          categoryId: input.categoryId,
          title: input.title,
          content: input.content,
          authorId: ctx.member.id,
          lastPostAt: new Date(),
        })
        .returning()

      return thread
    }),

  // Update a thread (author or officer can edit)
  updateThread: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread exists and belongs to tenant
      const existing = await ctx.db.query.forumThreads.findFirst({
        where: and(
          eq(forumThreads.tenantId, ctx.tenant.id),
          eq(forumThreads.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      // Check authorization: must be author or officer
      const isAuthor = existing.authorId === ctx.member.id
      const isOfficer =
        ctx.member.role === 'owner' || ctx.member.role === 'officer'

      if (!isAuthor && !isOfficer) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the author or officers can edit this thread',
        })
      }

      const { id, ...updates } = input

      const [thread] = await ctx.db
        .update(forumThreads)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(forumThreads.id, id))
        .returning()

      return thread
    }),

  // Delete a thread (officers only)
  deleteThread: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread belongs to tenant
      const existing = await ctx.db.query.forumThreads.findFirst({
        where: and(
          eq(forumThreads.tenantId, ctx.tenant.id),
          eq(forumThreads.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      await ctx.db.delete(forumThreads).where(eq(forumThreads.id, input.id))

      return { success: true }
    }),

  // Toggle pin status (officers only)
  togglePinThread: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread belongs to tenant
      const existing = await ctx.db.query.forumThreads.findFirst({
        where: and(
          eq(forumThreads.tenantId, ctx.tenant.id),
          eq(forumThreads.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      const [thread] = await ctx.db
        .update(forumThreads)
        .set({
          isPinned: !existing.isPinned,
          updatedAt: new Date(),
        })
        .where(eq(forumThreads.id, input.id))
        .returning()

      return thread
    }),

  // Toggle lock status (officers only)
  toggleLockThread: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread belongs to tenant
      const existing = await ctx.db.query.forumThreads.findFirst({
        where: and(
          eq(forumThreads.tenantId, ctx.tenant.id),
          eq(forumThreads.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      const [thread] = await ctx.db
        .update(forumThreads)
        .set({
          isLocked: !existing.isLocked,
          updatedAt: new Date(),
        })
        .where(eq(forumThreads.id, input.id))
        .returning()

      return thread
    }),

  // ===========================
  // Post Endpoints
  // ===========================

  // Create a new post (any member can reply)
  createPost: tenantProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        content: z.string().min(1),
        replyToId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread exists and is not locked
      const thread = await ctx.db.query.forumThreads.findFirst({
        where: and(
          eq(forumThreads.tenantId, ctx.tenant.id),
          eq(forumThreads.id, input.threadId)
        ),
      })

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      if (thread.isLocked) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This thread is locked and cannot accept new posts',
        })
      }

      const [post] = await ctx.db
        .insert(forumPosts)
        .values({
          tenantId: ctx.tenant.id,
          threadId: input.threadId,
          content: input.content,
          authorId: ctx.member.id,
          replyToId: input.replyToId,
        })
        .returning()

      // Update thread's lastPostAt
      await ctx.db
        .update(forumThreads)
        .set({
          lastPostAt: new Date(),
        })
        .where(eq(forumThreads.id, input.threadId))

      return post
    }),

  // Update a post (author can edit own post)
  updatePost: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify post exists and belongs to tenant
      const existing = await ctx.db.query.forumPosts.findFirst({
        where: and(
          eq(forumPosts.tenantId, ctx.tenant.id),
          eq(forumPosts.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        })
      }

      // Check authorization: must be the author
      if (existing.authorId !== ctx.member.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the author can edit this post',
        })
      }

      const [post] = await ctx.db
        .update(forumPosts)
        .set({
          content: input.content,
          isEdited: true,
          updatedAt: new Date(),
        })
        .where(eq(forumPosts.id, input.id))
        .returning()

      return post
    }),

  // Delete a post (officers only)
  deletePost: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify post belongs to tenant
      const existing = await ctx.db.query.forumPosts.findFirst({
        where: and(
          eq(forumPosts.tenantId, ctx.tenant.id),
          eq(forumPosts.id, input.id)
        ),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        })
      }

      await ctx.db.delete(forumPosts).where(eq(forumPosts.id, input.id))

      return { success: true }
    }),
})
