import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock db module before any imports that use it
vi.mock('@guild/db', () => ({
  eq: vi.fn((a, b) => ({ _eq: [a, b] })),
  and: vi.fn((...args) => ({ _and: args })),
  inArray: vi.fn((a, b) => ({ _inArray: [a, b] })),
}))

vi.mock('@guild/db/schema', () => ({
  members: { id: 'members.id', tenantId: 'members.tenantId' },
  users: { id: 'users.id' },
  characters: { memberId: 'characters.memberId', tenantId: 'characters.tenantId' },
  roles: { id: 'roles.id' },
  memberRoles: { memberId: 'memberRoles.memberId' },
  DEFAULT_ROLES: [],
}))

import { router, createCallerFactory } from '../trpc'
import { memberRouter } from '../routers/member'
import type { Context } from '../context'

// Create a comprehensive mock database
const createMockDb = () => {
  const returningFn = vi.fn()
  const whereFn = vi.fn(() => ({ returning: returningFn }))
  const setFn = vi.fn(() => ({ where: whereFn }))
  const updateFn = vi.fn(() => ({ set: setFn }))
  const deleteFn = vi.fn(() => ({ where: vi.fn() }))

  const mockDb = {
    query: {
      members: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      memberRoles: {
        findMany: vi.fn(),
      },
      characters: {
        findMany: vi.fn(),
      },
    },
    update: updateFn,
    delete: deleteFn,
  }

  // Store references for easier access in tests
  ;(mockDb.update as any).setFn = setFn
  ;(mockDb.update as any).whereFn = whereFn
  ;(mockDb.update as any).returningFn = returningFn

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
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockOwnerMember = {
  id: '33333333-3333-3333-3333-333333333333',
  tenantId: '22222222-2222-2222-2222-222222222222',
  userId: '11111111-1111-1111-1111-111111111111',
  role: 'owner' as const,
  nickname: null,
  notes: null,
  joinedAt: new Date(),
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
  updatedAt: new Date(),
}

const mockTargetMember = {
  id: '88888888-8888-8888-8888-888888888888',
  tenantId: '22222222-2222-2222-2222-222222222222',
  userId: '99999999-9999-9999-9999-999999999999',
  role: 'member' as const,
  nickname: null,
  notes: null,
  joinedAt: new Date(),
  updatedAt: new Date(),
}

const mockMemberWithUser = {
  ...mockRegularMember,
  user: mockUser,
}

const mockRole = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  tenantId: '22222222-2222-2222-2222-222222222222',
  name: 'Raider',
  color: '#10B981',
  position: 2,
  isDefault: false,
  isAdmin: false,
  permissions: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockCharacter = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  tenantId: '22222222-2222-2222-2222-222222222222',
  memberId: '66666666-6666-6666-6666-666666666666',
  name: 'TestChar',
  class: 'warrior',
  level: 60,
  isMain: 'true',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('memberRouter', () => {
  const testRouter = router({ member: memberRouter })
  const createCaller = createCallerFactory(testRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should return all members with roles and characters', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findMany.mockResolvedValueOnce([mockMemberWithUser])
      mockDb.query.memberRoles.findMany.mockResolvedValueOnce([
        { memberId: mockRegularMember.id, roleId: mockRole.id, role: mockRole },
      ])
      mockDb.query.characters.findMany.mockResolvedValueOnce([mockCharacter])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.member.list()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: mockRegularMember.id,
        user: mockUser,
      })
      expect(result[0].roles).toHaveLength(1)
      expect(result[0].characters).toHaveLength(1)
      expect(result[0].mainCharacter).toEqual(mockCharacter)
    })

    it('should handle members with no roles or characters', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findMany.mockResolvedValueOnce([mockMemberWithUser])
      mockDb.query.memberRoles.findMany.mockResolvedValueOnce([])
      mockDb.query.characters.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.member.list()

      expect(result).toHaveLength(1)
      expect(result[0].roles).toEqual([])
      expect(result[0].characters).toEqual([])
      expect(result[0].mainCharacter).toBeUndefined()
    })
  })

  describe('get', () => {
    it('should return single member with details', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce({
        ...mockRegularMember,
        user: mockUser,
      })
      mockDb.query.memberRoles.findMany.mockResolvedValueOnce([
        { memberId: mockRegularMember.id, roleId: mockRole.id, role: mockRole },
      ])
      mockDb.query.characters.findMany.mockResolvedValueOnce([mockCharacter])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.member.get({ id: mockRegularMember.id })

      expect(result).toMatchObject({
        id: mockRegularMember.id,
        user: mockUser,
      })
      expect(result.roles).toHaveLength(1)
      expect(result.characters).toHaveLength(1)
      expect(result.mainCharacter).toEqual(mockCharacter)
    })

    it('should throw NOT_FOUND for invalid ID', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(null)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const invalidUuid = '00000000-0000-0000-0000-000000000000'
      await expect(caller.member.get({ id: invalidUuid })).rejects.toThrow(
        TRPCError
      )
      await expect(
        caller.member.get({ id: invalidUuid })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      })
    })
  })

  describe('update', () => {
    it('should allow self-edit', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockRegularMember)
      const updatedMember = { ...mockRegularMember, nickname: 'NewNick' }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updatedMember])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.member.update({
        id: mockRegularMember.id,
        nickname: 'NewNick',
      })

      expect(result.nickname).toBe('NewNick')
    })

    it('should allow officer edit', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockTargetMember)
      const updatedMember = { ...mockTargetMember, nickname: 'OfficerEdit' }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updatedMember])

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

      const result = await caller.member.update({
        id: mockTargetMember.id,
        nickname: 'OfficerEdit',
      })

      expect(result.nickname).toBe('OfficerEdit')
    })

    it('should reject unauthorized edit', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValue(mockTargetMember)

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
        caller.member.update({
          id: mockTargetMember.id,
          nickname: 'Unauthorized',
        })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.update({
          id: mockTargetMember.id,
          nickname: 'Unauthorized',
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })
  })

  describe('kick', () => {
    it('should work for officers', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockTargetMember)
      mockDb.delete().where.mockResolvedValueOnce(undefined)

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

      const result = await caller.member.kick({ id: mockTargetMember.id })

      expect(result.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should reject kicking owner', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValue(mockOwnerMember)

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
        caller.member.kick({ id: mockOwnerMember.id })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.kick({ id: mockOwnerMember.id })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })

    it('should reject kicking self', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValue(mockOfficerMember)

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
        caller.member.kick({ id: mockOfficerMember.id })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.kick({ id: mockOfficerMember.id })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      })
    })
  })

  describe('leave', () => {
    it('should work for non-owners', async () => {
      const mockDb = createMockDb()
      mockDb.delete().where.mockResolvedValueOnce(undefined)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.member.leave()

      expect(result.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should reject for owner', async () => {
      const mockDb = createMockDb()

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOwnerMember as Context['member'],
      })

      await expect(caller.member.leave()).rejects.toThrow(TRPCError)
      await expect(caller.member.leave()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })
  })

  describe('transferOwnership', () => {
    it('should work for owner', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockTargetMember)
      ;(mockDb.update as any).returningFn.mockResolvedValue([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOwnerMember as Context['member'],
      })

      const result = await caller.member.transferOwnership({
        newOwnerId: mockTargetMember.id,
      })

      expect(result.success).toBe(true)
      expect(mockDb.update).toHaveBeenCalledTimes(2)
    })

    it('should reject for non-owner', async () => {
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
        caller.member.transferOwnership({ newOwnerId: mockTargetMember.id })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.transferOwnership({ newOwnerId: mockTargetMember.id })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })

    it('should reject for invalid target', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(null)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOwnerMember as Context['member'],
      })

      const invalidUuid = '00000000-0000-0000-0000-000000000000'
      await expect(
        caller.member.transferOwnership({ newOwnerId: invalidUuid })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.transferOwnership({ newOwnerId: invalidUuid })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      })
    })
  })

  describe('promote', () => {
    it('should work for owner', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockTargetMember)
      const promotedMember = { ...mockTargetMember, role: 'officer' as const }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([
        promotedMember,
      ])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOwnerMember as Context['member'],
      })

      const result = await caller.member.promote({ id: mockTargetMember.id })

      expect(result.role).toBe('officer')
    })

    it('should reject for non-owner', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockTargetMember)

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
        caller.member.promote({ id: mockTargetMember.id })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.promote({ id: mockTargetMember.id })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })

    it('should reject promoting already officer', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValue(mockOfficerMember)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOwnerMember as Context['member'],
      })

      await expect(
        caller.member.promote({ id: mockOfficerMember.id })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.promote({ id: mockOfficerMember.id })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      })
    })
  })

  describe('demote', () => {
    it('should work for owner', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockOfficerMember)
      const demotedMember = { ...mockOfficerMember, role: 'member' as const }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([demotedMember])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOwnerMember as Context['member'],
      })

      const result = await caller.member.demote({ id: mockOfficerMember.id })

      expect(result.role).toBe('member')
    })

    it('should reject for non-owner', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValueOnce(mockTargetMember)

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
        caller.member.demote({ id: mockTargetMember.id })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.demote({ id: mockTargetMember.id })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })

    it('should reject demoting non-officer', async () => {
      const mockDb = createMockDb()
      mockDb.query.members.findFirst.mockResolvedValue(mockRegularMember)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockOwnerMember as Context['member'],
      })

      await expect(
        caller.member.demote({ id: mockRegularMember.id })
      ).rejects.toThrow(TRPCError)
      await expect(
        caller.member.demote({ id: mockRegularMember.id })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      })
    })
  })
})
