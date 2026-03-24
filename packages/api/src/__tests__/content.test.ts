import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock db module before any imports that use it
vi.mock('@guild/db', () => ({
  eq: vi.fn((a, b) => ({ _eq: [a, b] })),
  and: vi.fn((...args) => ({ _and: args })),
  desc: vi.fn(a => ({ _desc: a })),
  ilike: vi.fn((a, b) => ({ _ilike: [a, b] })),
  sql: vi.fn((...args) => ({ _sql: args })),
}))

vi.mock('@guild/db/schema', () => ({
  faqCategories: {
    id: 'faqCategories.id',
    tenantId: 'faqCategories.tenantId',
    name: 'faqCategories.name',
    slug: 'faqCategories.slug',
    description: 'faqCategories.description',
    sortOrder: 'faqCategories.sortOrder',
    createdAt: 'faqCategories.createdAt',
    updatedAt: 'faqCategories.updatedAt',
  },
  faqItems: {
    id: 'faqItems.id',
    tenantId: 'faqItems.tenantId',
    categoryId: 'faqItems.categoryId',
    question: 'faqItems.question',
    answer: 'faqItems.answer',
    sortOrder: 'faqItems.sortOrder',
    isPublished: 'faqItems.isPublished',
    createdAt: 'faqItems.createdAt',
    updatedAt: 'faqItems.updatedAt',
  },
  guides: {
    id: 'guides.id',
    tenantId: 'guides.tenantId',
    title: 'guides.title',
    slug: 'guides.slug',
    excerpt: 'guides.excerpt',
    content: 'guides.content',
    authorId: 'guides.authorId',
    category: 'guides.category',
    tags: 'guides.tags',
    isPublished: 'guides.isPublished',
    publishedAt: 'guides.publishedAt',
    viewCount: 'guides.viewCount',
    createdAt: 'guides.createdAt',
    updatedAt: 'guides.updatedAt',
  },
}))

import { router, createCallerFactory } from '../trpc'
import { contentRouter } from '../routers/content'
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
      faqCategories: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      faqItems: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      guides: {
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

const mockFaqCategory = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  tenantId: '22222222-2222-2222-2222-222222222222',
  name: 'Getting Started',
  slug: 'getting-started',
  description: 'Basic information for new members',
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockFaqItem = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  tenantId: '22222222-2222-2222-2222-222222222222',
  categoryId: mockFaqCategory.id,
  question: 'How do I join raids?',
  answer: 'Sign up on the events page.',
  sortOrder: 0,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockGuide = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  tenantId: '22222222-2222-2222-2222-222222222222',
  title: 'Molten Core Guide',
  slug: 'molten-core-guide',
  excerpt: 'Complete guide for MC',
  content: '# Molten Core\n\nThis is a comprehensive guide...',
  authorId: mockOfficerMember.id,
  category: 'raid_strats' as const,
  tags: ['mc', 'raid', 'classic'],
  isPublished: true,
  publishedAt: new Date(),
  viewCount: 42,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('contentRouter', () => {
  const testRouter = router({ content: contentRouter })
  const createCaller = createCallerFactory(testRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================
  // FAQ Category Tests
  // ===========================

  describe('faqCategories', () => {
    it('should return all FAQ categories with published items', async () => {
      const mockDb = createMockDb()
      const mockCategories = [
        {
          ...mockFaqCategory,
          items: [mockFaqItem],
        },
      ]
      mockDb.query.faqCategories.findMany.mockResolvedValueOnce(mockCategories)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.content.faqCategories()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Getting Started')
      expect(result[0].items).toHaveLength(1)
      expect(mockDb.query.faqCategories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          with: expect.objectContaining({
            items: expect.any(Object),
          }),
        })
      )
    })
  })

  describe('faqItems', () => {
    it('should return all published FAQ items', async () => {
      const mockDb = createMockDb()
      mockDb.query.faqItems.findMany.mockResolvedValueOnce([
        { ...mockFaqItem, category: mockFaqCategory },
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.content.faqItems()

      expect(result).toHaveLength(1)
      expect(result[0].question).toBe('How do I join raids?')
    })

    it('should filter by categoryId', async () => {
      const mockDb = createMockDb()
      mockDb.query.faqItems.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.content.faqItems({ categoryId: mockFaqCategory.id })

      expect(mockDb.query.faqItems.findMany).toHaveBeenCalled()
    })
  })

  describe('createFaqCategory', () => {
    it('should create a new FAQ category as officer', async () => {
      const mockDb = createMockDb()
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        mockFaqCategory,
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.content.createFaqCategory({
        name: 'Getting Started',
        slug: 'getting-started',
        description: 'Basic information',
        sortOrder: 0,
      })

      expect(result).toEqual(mockFaqCategory)
      expect(mockDb.insert).toHaveBeenCalled()
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
        caller.content.createFaqCategory({
          name: 'Test',
          slug: 'test',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('updateFaqCategory', () => {
    it('should update FAQ category as officer', async () => {
      const mockDb = createMockDb()
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        { ...mockFaqCategory, name: 'Updated Name' },
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.content.updateFaqCategory({
        id: mockFaqCategory.id,
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
        caller.content.updateFaqCategory({
          id: mockFaqCategory.id,
          name: 'Test',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteFaqCategory', () => {
    it('should delete FAQ category as officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      await caller.content.deleteFaqCategory({ id: mockFaqCategory.id })

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
        caller.content.deleteFaqCategory({ id: mockFaqCategory.id })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  // ===========================
  // FAQ Item Tests
  // ===========================

  describe('createFaqItem', () => {
    it('should create FAQ item as officer', async () => {
      const mockDb = createMockDb()
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([mockFaqItem])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.content.createFaqItem({
        categoryId: mockFaqCategory.id,
        question: 'How do I join raids?',
        answer: 'Sign up on the events page.',
      })

      expect(result).toEqual(mockFaqItem)
      expect(mockDb.insert).toHaveBeenCalled()
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
        caller.content.createFaqItem({
          categoryId: mockFaqCategory.id,
          question: 'Test',
          answer: 'Test',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('updateFaqItem', () => {
    it('should update FAQ item as officer', async () => {
      const mockDb = createMockDb()
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        { ...mockFaqItem, question: 'Updated question?' },
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.content.updateFaqItem({
        id: mockFaqItem.id,
        question: 'Updated question?',
      })

      expect(result.question).toBe('Updated question?')
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
        caller.content.updateFaqItem({
          id: mockFaqItem.id,
          question: 'Test',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteFaqItem', () => {
    it('should delete FAQ item as officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      await caller.content.deleteFaqItem({ id: mockFaqItem.id })

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
        caller.content.deleteFaqItem({ id: mockFaqItem.id })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  // ===========================
  // Guides Tests
  // ===========================

  describe('guides', () => {
    it('should return all guides', async () => {
      const mockDb = createMockDb()
      mockDb.query.guides.findMany.mockResolvedValueOnce([
        {
          ...mockGuide,
          author: {
            ...mockOfficerMember,
            user: {
              id: '55555555-5555-5555-5555-555555555555',
              name: 'Officer',
              email: 'officer@test.com',
            },
          },
        },
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.content.guides()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Molten Core Guide')
    })

    it('should filter by category', async () => {
      const mockDb = createMockDb()
      mockDb.query.guides.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.content.guides({ category: 'raid_strats' })

      expect(mockDb.query.guides.findMany).toHaveBeenCalled()
    })

    it('should filter by published status', async () => {
      const mockDb = createMockDb()
      mockDb.query.guides.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.content.guides({ published: true })

      expect(mockDb.query.guides.findMany).toHaveBeenCalled()
    })

    it('should search by title', async () => {
      const mockDb = createMockDb()
      mockDb.query.guides.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.content.guides({ search: 'molten' })

      expect(mockDb.query.guides.findMany).toHaveBeenCalled()
    })
  })

  describe('guideBySlug', () => {
    it('should return guide by slug and increment view count', async () => {
      const mockDb = createMockDb()
      mockDb.query.guides.findFirst.mockResolvedValueOnce({
        ...mockGuide,
        author: {
          ...mockOfficerMember,
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
        },
      })

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.content.guideBySlug({
        slug: 'molten-core-guide',
      })

      expect(result?.title).toBe('Molten Core Guide')
      expect(mockDb.update).toHaveBeenCalled() // View count increment
    })

    it('should return null if guide not found', async () => {
      const mockDb = createMockDb()
      mockDb.query.guides.findFirst.mockResolvedValueOnce(null)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.content.guideBySlug({ slug: 'nonexistent' })

      expect(result).toBeNull()
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('createGuide', () => {
    it('should create guide as officer with authorId set to current member', async () => {
      const mockDb = createMockDb()
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([mockGuide])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.content.createGuide({
        title: 'Molten Core Guide',
        slug: 'molten-core-guide',
        content: 'Guide content...',
        category: 'raid_strats',
      })

      expect(result).toEqual(mockGuide)
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: mockOfficerMember.id,
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
        caller.content.createGuide({
          title: 'Test',
          slug: 'test',
          content: 'Content',
          category: 'general',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('updateGuide', () => {
    it('should update guide as officer', async () => {
      const mockDb = createMockDb()
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        { ...mockGuide, title: 'Updated Title' },
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.content.updateGuide({
        id: mockGuide.id,
        title: 'Updated Title',
      })

      expect(result.title).toBe('Updated Title')
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
        caller.content.updateGuide({
          id: mockGuide.id,
          title: 'Test',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteGuide', () => {
    it('should delete guide as officer', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      await caller.content.deleteGuide({ id: mockGuide.id })

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
        caller.content.deleteGuide({ id: mockGuide.id })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  describe('publishGuide', () => {
    it('should publish guide as officer', async () => {
      const mockDb = createMockDb()
      const publishedGuide = {
        ...mockGuide,
        isPublished: true,
        publishedAt: new Date(),
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        publishedGuide,
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: {
            id: '55555555-5555-5555-5555-555555555555',
            name: 'Officer',
            email: 'officer@test.com',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOfficerMember as Context['member'],
      })

      const result = await caller.content.publishGuide({ id: mockGuide.id })

      expect(result.isPublished).toBe(true)
      expect(result.publishedAt).toBeDefined()
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
        caller.content.publishGuide({ id: mockGuide.id })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  // ===========================
  // Tenant Isolation Tests
  // ===========================

  describe('tenant isolation', () => {
    it('should only return FAQ categories for current tenant', async () => {
      const mockDb = createMockDb()
      mockDb.query.faqCategories.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.content.faqCategories()

      expect(mockDb.query.faqCategories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            _eq: expect.arrayContaining(['faqCategories.tenantId']),
          }),
        })
      )
    })

    it('should only return guides for current tenant', async () => {
      const mockDb = createMockDb()
      mockDb.query.guides.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.content.guides()

      expect(mockDb.query.guides.findMany).toHaveBeenCalled()
    })
  })
})
