import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock db module before any imports that use it
vi.mock('@guild/db', () => ({
  eq: vi.fn((a, b) => ({ _eq: [a, b] })),
  and: vi.fn((...args) => ({ _and: args })),
  or: vi.fn((...args) => ({ _or: args })),
  desc: vi.fn(a => ({ _desc: a })),
  gt: vi.fn((a, b) => ({ _gt: [a, b] })),
  isNull: vi.fn(a => ({ _isNull: a })),
  isNotNull: vi.fn(a => ({ _isNotNull: a })),
}))

vi.mock('@guild/db/schema', () => ({
  announcements: {
    id: 'announcements.id',
    tenantId: 'announcements.tenantId',
    title: 'announcements.title',
    content: 'announcements.content',
    authorId: 'announcements.authorId',
    isPinned: 'announcements.isPinned',
    publishedAt: 'announcements.publishedAt',
    expiresAt: 'announcements.expiresAt',
    createdAt: 'announcements.createdAt',
    updatedAt: 'announcements.updatedAt',
  },
}))

import { router, createCallerFactory } from '../trpc'
import { announcementsRouter } from '../routers/announcements'
import type { Context } from '../context'

// Create a comprehensive mock database
const createMockDb = () => {
  const returningFn = vi.fn()
  const whereFn = vi.fn(() => ({ returning: returningFn }))
  const setFn = vi.fn(() => ({ where: whereFn }))
  const updateFn = vi.fn(() => ({ set: setFn }))
  const valuesFn = vi.fn(() => ({ returning: returningFn }))
  const insertFn = vi.fn(() => ({ values: valuesFn }))
  const deleteFn = vi.fn(() => ({ where: whereFn }))

  const mockDb = {
    query: {
      announcements: {
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
  ;(mockDb.delete as any).whereFn = whereFn

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

const mockAnnouncement = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  tenantId: '22222222-2222-2222-2222-222222222222',
  title: 'Important Announcement',
  content: 'This is an important announcement about upcoming raids.',
  authorId: mockOfficerMember.id,
  isPinned: false,
  publishedAt: new Date('2024-01-15T12:00:00Z'),
  expiresAt: null,
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

describe('announcementsRouter', () => {
  const testRouter = router({ announcements: announcementsRouter })
  const createCaller = createCallerFactory(testRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should return announcements list', async () => {
      const mockDb = createMockDb()
      const mockAnnouncements = [
        {
          ...mockAnnouncement,
          author: {
            ...mockOfficerMember,
            user: mockUser,
          },
        },
      ]
      mockDb.query.announcements.findMany.mockResolvedValueOnce(
        mockAnnouncements
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

      const result = await caller.announcements.list()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Important Announcement')
      expect(mockDb.query.announcements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          with: {
            author: {
              with: {
                user: true,
              },
            },
          },
        })
      )
    })

    it('should filter by published status', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.announcements.list({ published: true })

      expect(mockDb.query.announcements.findMany).toHaveBeenCalled()
    })

    it('should paginate results', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.announcements.list({ limit: 10, offset: 5 })

      expect(mockDb.query.announcements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 5,
        })
      )
    })
  })

  describe('getById', () => {
    it('should return announcement by ID', async () => {
      const mockDb = createMockDb()
      const mockAnnouncementWithAuthor = {
        ...mockAnnouncement,
        author: {
          ...mockOfficerMember,
          user: mockUser,
        },
      }
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(
        mockAnnouncementWithAuthor
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

      const result = await caller.announcements.getById({
        id: mockAnnouncement.id,
      })

      expect(result).toEqual(mockAnnouncementWithAuthor)
      expect(result.title).toBe('Important Announcement')
    })

    it('should throw NOT_FOUND if announcement does not exist', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(null)

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
        caller.announcements.getById({
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        })
      ).rejects.toThrow('Announcement not found')
    })
  })

  describe('create', () => {
    it('should create a new announcement', async () => {
      const mockDb = createMockDb()
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        mockAnnouncement,
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

      const result = await caller.announcements.create({
        title: 'Important Announcement',
        content: 'This is an important announcement about upcoming raids.',
        isPinned: false,
      })

      expect(result).toEqual(mockAnnouncement)
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Important Announcement',
          content: 'This is an important announcement about upcoming raids.',
          authorId: mockOfficerMember.id,
          isPinned: false,
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
        caller.announcements.create({
          title: 'Test',
          content: 'Test content',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update an announcement', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(
        mockAnnouncement
      )
      const updatedAnnouncement = {
        ...mockAnnouncement,
        title: 'Updated Title',
        content: 'Updated content',
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        updatedAnnouncement,
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

      const result = await caller.announcements.update({
        id: mockAnnouncement.id,
        title: 'Updated Title',
        content: 'Updated content',
      })

      expect(result.title).toBe('Updated Title')
      expect(result.content).toBe('Updated content')
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should throw NOT_FOUND if announcement does not exist', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(null)

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

      await expect(
        caller.announcements.update({
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          title: 'Updated Title',
        })
      ).rejects.toThrow('Announcement not found')

      expect(mockDb.update).not.toHaveBeenCalled()
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
        caller.announcements.update({
          id: mockAnnouncement.id,
          title: 'Updated Title',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.query.announcements.findFirst).not.toHaveBeenCalled()
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete an announcement', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(
        mockAnnouncement
      )
      ;(mockDb.delete as any).whereFn.mockResolvedValueOnce(undefined)

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

      const result = await caller.announcements.delete({
        id: mockAnnouncement.id,
      })

      expect(result.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should throw NOT_FOUND if announcement does not exist', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(null)

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

      await expect(
        caller.announcements.delete({
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        })
      ).rejects.toThrow('Announcement not found')

      expect(mockDb.delete).not.toHaveBeenCalled()
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
        caller.announcements.delete({
          id: mockAnnouncement.id,
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.query.announcements.findFirst).not.toHaveBeenCalled()
      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  describe('togglePin', () => {
    it('should toggle pinned status from false to true', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(
        mockAnnouncement
      )
      const pinnedAnnouncement = {
        ...mockAnnouncement,
        isPinned: true,
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        pinnedAnnouncement,
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

      const result = await caller.announcements.togglePin({
        id: mockAnnouncement.id,
      })

      expect(result.isPinned).toBe(true)
      expect(mockDb.update).toHaveBeenCalled()
      expect((mockDb.update as any).setFn).toHaveBeenCalledWith(
        expect.objectContaining({
          isPinned: true,
        })
      )
    })

    it('should toggle pinned status from true to false', async () => {
      const mockDb = createMockDb()
      const pinnedAnnouncement = {
        ...mockAnnouncement,
        isPinned: true,
      }
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(
        pinnedAnnouncement
      )
      const unpinnedAnnouncement = {
        ...mockAnnouncement,
        isPinned: false,
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        unpinnedAnnouncement,
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

      const result = await caller.announcements.togglePin({
        id: mockAnnouncement.id,
      })

      expect(result.isPinned).toBe(false)
      expect(mockDb.update).toHaveBeenCalled()
      expect((mockDb.update as any).setFn).toHaveBeenCalledWith(
        expect.objectContaining({
          isPinned: false,
        })
      )
    })

    it('should throw NOT_FOUND if announcement does not exist', async () => {
      const mockDb = createMockDb()
      mockDb.query.announcements.findFirst.mockResolvedValueOnce(null)

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

      await expect(
        caller.announcements.togglePin({
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        })
      ).rejects.toThrow('Announcement not found')

      expect(mockDb.update).not.toHaveBeenCalled()
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
        caller.announcements.togglePin({
          id: mockAnnouncement.id,
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.query.announcements.findFirst).not.toHaveBeenCalled()
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })
})
