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
  dkpTransactions: {
    id: 'dkpTransactions.id',
    tenantId: 'dkpTransactions.tenantId',
    memberId: 'dkpTransactions.memberId',
    amount: 'dkpTransactions.amount',
    type: 'dkpTransactions.type',
    createdAt: 'dkpTransactions.createdAt',
  },
  dkpBalances: {
    id: 'dkpBalances.id',
    tenantId: 'dkpBalances.tenantId',
    memberId: 'dkpBalances.memberId',
    currentBalance: 'dkpBalances.currentBalance',
    lifetimeEarned: 'dkpBalances.lifetimeEarned',
    lifetimeSpent: 'dkpBalances.lifetimeSpent',
    lastUpdated: 'dkpBalances.lastUpdated',
  },
}))

import { router, createCallerFactory } from '../trpc'
import { dkpRouter } from '../routers/dkp'
import type { Context } from '../context'

// Create a comprehensive mock database
const createMockDb = () => {
  const returningFn = vi.fn()
  const whereFn = vi.fn(() => ({ returning: returningFn }))
  const setFn = vi.fn(() => ({ where: whereFn }))
  const updateFn = vi.fn(() => ({ set: setFn }))
  const onConflictDoUpdateFn = vi.fn(() => Promise.resolve())
  const valuesFn = vi.fn(() => ({
    returning: returningFn,
    onConflictDoUpdate: onConflictDoUpdateFn,
  }))
  const insertFn = vi.fn(() => ({ values: valuesFn }))
  const deleteFn = vi.fn(() => ({ where: vi.fn() }))

  const mockDb = {
    query: {
      dkpBalances: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      dkpTransactions: {
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
  ;(mockDb.insert as any).onConflictDoUpdateFn = onConflictDoUpdateFn

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

const mockMember2 = {
  id: '88888888-8888-8888-8888-888888888888',
  tenantId: '22222222-2222-2222-2222-222222222222',
  userId: '99999999-9999-9999-9999-999999999999',
  role: 'member' as const,
  nickname: null,
  notes: null,
  joinedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockBalance = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  tenantId: '22222222-2222-2222-2222-222222222222',
  memberId: mockRegularMember.id,
  currentBalance: 150,
  lifetimeEarned: 200,
  lifetimeSpent: 50,
  lastUpdated: new Date(),
}

const mockTransaction = {
  id: 'tttttttt-tttt-tttt-tttt-tttttttttttt',
  tenantId: '22222222-2222-2222-2222-222222222222',
  memberId: mockRegularMember.id,
  characterId: null,
  amount: 50,
  type: 'raid_attendance' as const,
  reason: 'MC raid attendance',
  lootHistoryId: null,
  eventId: null,
  awardedBy: mockOfficerMember.id,
  metadata: {},
  createdAt: new Date(),
}

describe('dkpRouter', () => {
  const testRouter = router({ dkp: dkpRouter })
  const createCaller = createCallerFactory(testRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('leaderboard', () => {
    it('should return ranked members by DKP balance', async () => {
      const mockDb = createMockDb()
      const mockBalances = [
        {
          ...mockBalance,
          currentBalance: 500,
          member: {
            ...mockRegularMember,
            user: mockUser,
          },
        },
        {
          ...mockBalance,
          id: 'balance-2',
          memberId: mockMember2.id,
          currentBalance: 300,
          member: {
            ...mockMember2,
            user: { ...mockUser, id: 'user-2', name: 'User 2' },
          },
        },
      ]
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce(mockBalances)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.dkp.leaderboard()

      expect(result).toHaveLength(2)
      expect(result[0].currentBalance).toBe(500)
      expect(result[1].currentBalance).toBe(300)
      expect(mockDb.query.dkpBalances.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          with: {
            member: {
              with: {
                user: true,
              },
            },
          },
        })
      )
    })

    it('should paginate results', async () => {
      const mockDb = createMockDb()
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.dkp.leaderboard({ limit: 10, offset: 5 })

      expect(mockDb.query.dkpBalances.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 5,
        })
      )
    })
  })

  describe('getBalance', () => {
    it('should return member balance', async () => {
      const mockDb = createMockDb()
      mockDb.query.dkpBalances.findFirst.mockResolvedValueOnce(mockBalance)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.dkp.getBalance({
        memberId: mockRegularMember.id,
      })

      expect(result).toEqual(mockBalance)
      expect(result?.currentBalance).toBe(150)
    })

    it('should return null if balance does not exist', async () => {
      const mockDb = createMockDb()
      mockDb.query.dkpBalances.findFirst.mockResolvedValueOnce(null)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.dkp.getBalance({
        memberId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      })

      expect(result).toBeNull()
    })
  })

  describe('getTransactions', () => {
    it('should return transaction history', async () => {
      const mockDb = createMockDb()
      const mockTransactions = [
        {
          ...mockTransaction,
          member: mockRegularMember,
          event: null,
          character: null,
        },
      ]
      mockDb.query.dkpTransactions.findMany.mockResolvedValueOnce(
        mockTransactions
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

      const result = await caller.dkp.getTransactions()

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(50)
      expect(result[0].type).toBe('raid_attendance')
    })

    it('should filter by memberId', async () => {
      const mockDb = createMockDb()
      mockDb.query.dkpTransactions.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.dkp.getTransactions({
        memberId: mockRegularMember.id,
      })

      expect(mockDb.query.dkpTransactions.findMany).toHaveBeenCalled()
    })

    it('should filter by type', async () => {
      const mockDb = createMockDb()
      mockDb.query.dkpTransactions.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.dkp.getTransactions({
        type: 'loot_purchase',
      })

      expect(mockDb.query.dkpTransactions.findMany).toHaveBeenCalled()
    })
  })

  describe('award', () => {
    it('should award DKP to a member', async () => {
      const mockDb = createMockDb()
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        mockTransaction,
      ])
      ;(mockDb.insert as any).onConflictDoUpdateFn.mockResolvedValueOnce(
        undefined
      )

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

      const result = await caller.dkp.award({
        memberId: mockRegularMember.id,
        amount: 50,
        type: 'raid_attendance',
        reason: 'MC raid',
      })

      expect(result).toEqual(mockTransaction)
      expect(mockDb.insert).toHaveBeenCalledTimes(2) // Once for transaction, once for balance
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          memberId: mockRegularMember.id,
          amount: 50,
          type: 'raid_attendance',
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
        caller.dkp.award({
          memberId: mockRegularMember.id,
          amount: 50,
          type: 'raid_attendance',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('spend', () => {
    it('should deduct DKP when member has sufficient balance', async () => {
      const mockDb = createMockDb()
      mockDb.query.dkpBalances.findFirst.mockResolvedValueOnce(mockBalance)
      const spendTransaction = {
        ...mockTransaction,
        amount: -100,
        type: 'loot_purchase' as const,
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        spendTransaction,
      ])
      ;(mockDb.insert as any).onConflictDoUpdateFn.mockResolvedValueOnce(
        undefined
      )

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

      const result = await caller.dkp.spend({
        memberId: mockRegularMember.id,
        amount: 100,
        type: 'loot_purchase',
        reason: 'Thunderfury',
      })

      expect(result.amount).toBe(-100)
      expect(mockDb.query.dkpBalances.findFirst).toHaveBeenCalled()
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
    })

    it('should reject if insufficient balance', async () => {
      const mockDb = createMockDb()
      mockDb.query.dkpBalances.findFirst.mockResolvedValueOnce({
        ...mockBalance,
        currentBalance: 50,
      })

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
        caller.dkp.spend({
          memberId: mockRegularMember.id,
          amount: 100,
          type: 'loot_purchase',
        })
      ).rejects.toThrow('Insufficient DKP balance')

      // Should not have created a transaction
      expect(mockDb.insert).not.toHaveBeenCalled()
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
        caller.dkp.spend({
          memberId: mockRegularMember.id,
          amount: 50,
          type: 'loot_purchase',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.query.dkpBalances.findFirst).not.toHaveBeenCalled()
      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('bulkAward', () => {
    it('should award DKP to multiple members', async () => {
      const mockDb = createMockDb()
      // First insert returns void for transactions, subsequent inserts return onConflictDoUpdate chain
      ;(mockDb.insert as any).valuesFn.mockReturnValue({
        returning: (mockDb.insert as any).returningFn,
        onConflictDoUpdate: (mockDb.insert as any).onConflictDoUpdateFn,
      })
      ;(mockDb.insert as any).onConflictDoUpdateFn.mockResolvedValue(undefined)

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

      const result = await caller.dkp.bulkAward({
        memberIds: [mockRegularMember.id, mockMember2.id],
        amount: 50,
        type: 'raid_attendance',
        reason: 'MC raid attendance',
      })

      expect(result.awarded).toBe(2)
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            memberId: mockRegularMember.id,
            amount: 50,
          }),
          expect.objectContaining({
            memberId: mockMember2.id,
            amount: 50,
          }),
        ])
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
        caller.dkp.bulkAward({
          memberIds: [mockRegularMember.id, mockMember2.id],
          amount: 50,
          type: 'raid_attendance',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('adjust', () => {
    it('should handle positive adjustments', async () => {
      const mockDb = createMockDb()
      const adjustmentTransaction = {
        ...mockTransaction,
        amount: 100,
        type: 'adjustment' as const,
        reason: 'Bonus for recruitment',
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        adjustmentTransaction,
      ])
      ;(mockDb.insert as any).onConflictDoUpdateFn.mockResolvedValueOnce(
        undefined
      )

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

      const result = await caller.dkp.adjust({
        memberId: mockRegularMember.id,
        amount: 100,
        reason: 'Bonus for recruitment',
      })

      expect(result.amount).toBe(100)
      expect(result.type).toBe('adjustment')
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
    })

    it('should handle negative adjustments', async () => {
      const mockDb = createMockDb()
      const adjustmentTransaction = {
        ...mockTransaction,
        amount: -50,
        type: 'adjustment' as const,
        reason: 'Penalty for no-show',
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        adjustmentTransaction,
      ])
      ;(mockDb.insert as any).onConflictDoUpdateFn.mockResolvedValueOnce(
        undefined
      )

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

      const result = await caller.dkp.adjust({
        memberId: mockRegularMember.id,
        amount: -50,
        reason: 'Penalty for no-show',
      })

      expect(result.amount).toBe(-50)
      expect(result.type).toBe('adjustment')
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
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
        caller.dkp.adjust({
          memberId: mockRegularMember.id,
          amount: 100,
          reason: 'Test adjustment',
        })
      ).rejects.toThrow(TRPCError)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })
})
