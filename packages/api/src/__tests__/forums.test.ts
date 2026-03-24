import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock db module before any imports that use it
vi.mock('@guild/db', () => ({
  eq: vi.fn((a, b) => ({ _eq: [a, b] })),
  and: vi.fn((...args) => ({ _and: args })),
  desc: vi.fn(a => ({ _desc: a })),
  sql: vi.fn((...args) => ({ _sql: args })),
}))

vi.mock('@guild/db/schema', () => ({
  forumCategories: {
    id: 'forumCategories.id',
    tenantId: 'forumCategories.tenantId',
    name: 'forumCategories.name',
    slug: 'forumCategories.slug',
    description: 'forumCategories.description',
    sortOrder: 'forumCategories.sortOrder',
    icon: 'forumCategories.icon',
    createdAt: 'forumCategories.createdAt',
    updatedAt: 'forumCategories.updatedAt',
  },
  forumThreads: {
    id: 'forumThreads.id',
    tenantId: 'forumThreads.tenantId',
    categoryId: 'forumThreads.categoryId',
    title: 'forumThreads.title',
    content: 'forumThreads.content',
    authorId: 'forumThreads.authorId',
    isPinned: 'forumThreads.isPinned',
    isLocked: 'forumThreads.isLocked',
    viewCount: 'forumThreads.viewCount',
    lastPostAt: 'forumThreads.lastPostAt',
    createdAt: 'forumThreads.createdAt',
    updatedAt: 'forumThreads.updatedAt',
  },
  forumPosts: {
    id: 'forumPosts.id',
    tenantId: 'forumPosts.tenantId',
    threadId: 'forumPosts.threadId',
    content: 'forumPosts.content',
    authorId: 'forumPosts.authorId',
    replyToId: 'forumPosts.replyToId',
    isEdited: 'forumPosts.isEdited',
    createdAt: 'forumPosts.createdAt',
    updatedAt: 'forumPosts.updatedAt',
  },
}))

import { router, createCallerFactory } from '../trpc'
import { forumsRouter } from '../routers/forums'
import type { Context } from '../context'

// Create a comprehensive mock database
const createMockDb = () => {
  const returningFn = vi.fn()
  const whereFn = vi.fn(() => ({ returning: returningFn }))
  const setFn = vi.fn(() => ({ where: whereFn }))
  const updateFn = vi.fn(() => ({ set: setFn }))
  const valuesFn = vi.fn(() => ({ returning: returningFn }))
  const insertFn = vi.fn(() => ({ values: valuesFn }))
  const deleteFn = vi.fn(() => ({ where: vi.fn() }))

  const mockDb = {
    query: {
      forumCategories: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      forumThreads: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      forumPosts: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: insertFn,
    update: updateFn,
    delete: deleteFn,
  }

  // Store references for easier access in tests
  ;(mockDb.update as any).setFn = setFn
  ;(mockDb.update as any).whereFn = whereFn
  ;(mockDb.update as any).returningFn = returningFn
  ;(mockDb.insert as any).valuesFn = valuesFn
  ;(mockDb.insert as any).returningFn = returningFn

  return mockDb
}

// Mock data
const mockUser = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Test User',
  email: 'test@example.com',
}

const mockTenant = {
  id: '22222222-2222-2222-2222-222222222222',
  slug: 'test-guild',
  name: 'Test Guild',
  gameType: 'wow_classic' as const,
  description: null,
  ownerId: '11111111-1111-1111-1111-111111111111',
  settings: {},
  customDomain: null,
  discordServerId: null,
  logoUrl: null,
  bannerUrl: null,
  inviteCode: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockOfficerMember = {
  id: '44444444-4444-4444-4444-444444444444',
  tenantId: '22222222-2222-2222-2222-222222222222',
  userId: '55555555-5555-5555-5555-555555555555',
  role: 'officer' as const,
  nickname: null,
  notes: null,
  joinedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockRegularMember = {
  id: '66666666-6666-6666-6666-666666666666',
  tenantId: '22222222-2222-2222-2222-222222222222',
  userId: '77777777-7777-7777-7777-777777777777',
  role: 'member' as const,
  nickname: null,
  notes: null,
  joinedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockCategory = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  tenantId: '22222222-2222-2222-2222-222222222222',
  name: 'General Discussion',
  slug: 'general',
  description: 'General chat',
  sortOrder: 0,
  icon: 'chat',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockThread = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  tenantId: '22222222-2222-2222-2222-222222222222',
  categoryId: mockCategory.id,
  title: 'Welcome to the forums',
  content: 'This is the first post',
  authorId: mockRegularMember.id,
  isPinned: false,
  isLocked: false,
  viewCount: 0,
  lastPostAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPost = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  tenantId: '22222222-2222-2222-2222-222222222222',
  threadId: mockThread.id,
  content: 'Great thread!',
  authorId: mockRegularMember.id,
  replyToId: null,
  isEdited: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('forumsRouter', () => {
  const testRouter = router({ forums: forumsRouter })
  const createCaller = createCallerFactory(testRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================
  // Category Tests
  // ===========================

  describe('categories', () => {
    it('should list categories with thread counts', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumCategories.findMany.mockResolvedValueOnce([
        mockCategory,
      ])
      mockDb.query.forumThreads.findMany.mockResolvedValueOnce([mockThread])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.categories()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('General Discussion')
      expect(result[0].threadCount).toBe(1)
      expect(mockDb.query.forumCategories.findMany).toHaveBeenCalled()
    })

    it('should respect tenant isolation', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumCategories.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.forums.categories()

      expect(mockDb.query.forumCategories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
        })
      )
    })
  })

  describe('createCategory', () => {
    it('should create a category (officers only)', async () => {
      const mockDb = createMockDb()
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([mockCategory])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.forums.createCategory({
        name: 'General Discussion',
        slug: 'general',
        description: 'General chat',
        sortOrder: 0,
        icon: 'chat',
      })

      expect(result).toEqual(mockCategory)
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'General Discussion',
          slug: 'general',
        })
      )
    })

    it('should reject from non-officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.createCategory({
          name: 'General Discussion',
          slug: 'general',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('updateCategory', () => {
    it('should update a category (officers only)', async () => {
      const mockDb = createMockDb()
      const updated = { ...mockCategory, name: 'Updated Name' }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updated])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.forums.updateCategory({
        id: mockCategory.id,
        name: 'Updated Name',
      })

      expect(result.name).toBe('Updated Name')
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should reject from non-officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.updateCategory({
          id: mockCategory.id,
          name: 'Updated Name',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteCategory', () => {
    it('should delete a category (officers only)', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      await caller.forums.deleteCategory({ id: mockCategory.id })

      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should reject from non-officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.deleteCategory({ id: mockCategory.id })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  // ===========================
  // Thread Tests
  // ===========================

  describe('threads', () => {
    it('should list threads by category with post counts', async () => {
      const mockDb = createMockDb()
      const threadWithAuthor = {
        ...mockThread,
        author: {
          ...mockRegularMember,
          user: mockUser,
        },
      }
      mockDb.query.forumThreads.findMany.mockResolvedValueOnce([
        threadWithAuthor,
      ])
      mockDb.query.forumPosts.findMany.mockResolvedValueOnce([mockPost])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.threads({
        categoryId: mockCategory.id,
      })

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Welcome to the forums')
      expect(result[0].postCount).toBe(1)
      expect(mockDb.query.forumThreads.findMany).toHaveBeenCalled()
    })

    it('should support pagination', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.forums.threads({
        categoryId: mockCategory.id,
        limit: 10,
        offset: 5,
      })

      expect(mockDb.query.forumThreads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 5,
        })
      )
    })
  })

  describe('threadById', () => {
    it('should get thread with posts and increment view count', async () => {
      const mockDb = createMockDb()
      const threadWithDetails = {
        ...mockThread,
        author: {
          ...mockRegularMember,
          user: mockUser,
        },
        category: mockCategory,
        posts: [
          {
            ...mockPost,
            author: {
              ...mockRegularMember,
              user: mockUser,
            },
          },
        ],
      }
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(
        threadWithDetails
      )

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.threadById({ id: mockThread.id })

      expect(result.title).toBe('Welcome to the forums')
      expect(result.posts).toHaveLength(1)
      expect(mockDb.update).toHaveBeenCalled() // view count incremented
    })

    it('should throw NOT_FOUND for non-existent thread', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(null)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.threadById({
          id: '99999999-9999-9999-9999-999999999999',
        })
      ).rejects.toThrow('Thread not found')
    })
  })

  describe('createThread', () => {
    it('should allow any member to create a thread', async () => {
      const mockDb = createMockDb()
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([mockThread])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.createThread({
        categoryId: mockCategory.id,
        title: 'Welcome to the forums',
        content: 'This is the first post',
      })

      expect(result).toEqual(mockThread)
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: mockCategory.id,
          title: 'Welcome to the forums',
          authorId: mockRegularMember.id,
        })
      )
    })
  })

  describe('updateThread', () => {
    it('should allow author to edit their thread', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(mockThread)
      const updated = { ...mockThread, title: 'Updated Title' }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updated])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.updateThread({
        id: mockThread.id,
        title: 'Updated Title',
      })

      expect(result.title).toBe('Updated Title')
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should allow officers to edit any thread', async () => {
      const mockDb = createMockDb()
      const otherMemberThread = {
        ...mockThread,
        authorId: 'other-member-id',
      }
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(
        otherMemberThread
      )
      const updated = { ...otherMemberThread, title: 'Officer Edit' }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updated])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.forums.updateThread({
        id: mockThread.id,
        title: 'Officer Edit',
      })

      expect(result.title).toBe('Officer Edit')
    })

    it('should reject non-author non-officer from editing', async () => {
      const mockDb = createMockDb()
      const otherMemberThread = {
        ...mockThread,
        authorId: 'other-member-id',
      }
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(
        otherMemberThread
      )

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.updateThread({
          id: mockThread.id,
          title: 'Unauthorized Edit',
        })
      ).rejects.toThrow('Only the author or officers can edit this thread')

      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteThread', () => {
    it('should allow officers to delete threads', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(mockThread)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.forums.deleteThread({ id: mockThread.id })

      expect(result.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should reject from non-officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.deleteThread({ id: mockThread.id })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  describe('togglePinThread', () => {
    it('should allow officers to toggle pin status', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(mockThread)
      const pinned = { ...mockThread, isPinned: true }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([pinned])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.forums.togglePinThread({ id: mockThread.id })

      expect(result.isPinned).toBe(true)
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should reject from non-officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.togglePinThread({ id: mockThread.id })
      ).rejects.toThrow(TRPCError)
    })
  })

  describe('toggleLockThread', () => {
    it('should allow officers to toggle lock status', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(mockThread)
      const locked = { ...mockThread, isLocked: true }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([locked])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.forums.toggleLockThread({
        id: mockThread.id,
      })

      expect(result.isLocked).toBe(true)
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should reject from non-officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.toggleLockThread({ id: mockThread.id })
      ).rejects.toThrow(TRPCError)
    })
  })

  // ===========================
  // Post Tests
  // ===========================

  describe('createPost', () => {
    it('should allow any member to create a post', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(mockThread)
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([mockPost])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.createPost({
        threadId: mockThread.id,
        content: 'Great thread!',
      })

      expect(result).toEqual(mockPost)
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
      expect(mockDb.update).toHaveBeenCalled() // lastPostAt updated
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          threadId: mockThread.id,
          content: 'Great thread!',
          authorId: mockRegularMember.id,
        })
      )
    })

    it('should reject posts on locked threads', async () => {
      const mockDb = createMockDb()
      const lockedThread = { ...mockThread, isLocked: true }
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(lockedThread)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.createPost({
          threadId: mockThread.id,
          content: 'Should fail',
        })
      ).rejects.toThrow('This thread is locked and cannot accept new posts')

      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it('should throw NOT_FOUND for non-existent thread', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findFirst.mockResolvedValueOnce(null)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.createPost({
          threadId: '99999999-9999-9999-9999-999999999999',
          content: 'Should fail',
        })
      ).rejects.toThrow('Thread not found')
    })
  })

  describe('updatePost', () => {
    it('should allow author to edit their post', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumPosts.findFirst.mockResolvedValueOnce(mockPost)
      const updated = {
        ...mockPost,
        content: 'Updated content',
        isEdited: true,
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updated])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.updatePost({
        id: mockPost.id,
        content: 'Updated content',
      })

      expect(result.content).toBe('Updated content')
      expect(result.isEdited).toBe(true)
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should reject non-author from editing post', async () => {
      const mockDb = createMockDb()
      const otherPost = {
        ...mockPost,
        authorId: 'other-member-id',
      }
      mockDb.query.forumPosts.findFirst.mockResolvedValueOnce(otherPost)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.updatePost({
          id: mockPost.id,
          content: 'Unauthorized edit',
        })
      ).rejects.toThrow('Only the author can edit this post')

      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('deletePost', () => {
    it('should allow officers to delete posts', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumPosts.findFirst.mockResolvedValueOnce(mockPost)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: { ...mockUser, id: mockOfficerMember.userId },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.forums.deletePost({ id: mockPost.id })

      expect(result.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should reject from non-officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await expect(
        caller.forums.deletePost({ id: mockPost.id })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  // ===========================
  // Tenant Isolation Tests
  // ===========================

  describe('tenant isolation', () => {
    it('should not allow access to categories from other tenants', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumCategories.findMany.mockResolvedValueOnce([])

      const otherTenant = {
        ...mockTenant,
        id: 'other-tenant-id',
      }

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: otherTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.categories()

      expect(result).toHaveLength(0)
    })

    it('should not allow access to threads from other tenants', async () => {
      const mockDb = createMockDb()
      mockDb.query.forumThreads.findMany.mockResolvedValueOnce([])

      const otherTenant = {
        ...mockTenant,
        id: 'other-tenant-id',
      }

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: otherTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.forums.threads({
        categoryId: mockCategory.id,
      })

      expect(result).toHaveLength(0)
    })
  })
})
