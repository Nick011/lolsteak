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
  lootHistory: {
    id: 'lootHistory.id',
    tenantId: 'lootHistory.tenantId',
    characterId: 'lootHistory.characterId',
    itemName: 'lootHistory.itemName',
    importHash: 'lootHistory.importHash',
    awardedAt: 'lootHistory.awardedAt',
  },
  characters: {
    id: 'characters.id',
    tenantId: 'characters.tenantId',
    name: 'characters.name',
  },
  dkpTransactions: {
    id: 'dkpTransactions.id',
    tenantId: 'dkpTransactions.tenantId',
    memberId: 'dkpTransactions.memberId',
  },
  dkpBalances: {
    id: 'dkpBalances.id',
    tenantId: 'dkpBalances.tenantId',
    memberId: 'dkpBalances.memberId',
    currentBalance: 'dkpBalances.currentBalance',
    lifetimeSpent: 'dkpBalances.lifetimeSpent',
  },
}))

import { router, createCallerFactory } from '../trpc'
import { lootRouter } from '../routers/loot'
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
      lootHistory: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      characters: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      dkpBalances: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      dkpTransactions: {
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

const mockCharacter = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  tenantId: '22222222-2222-2222-2222-222222222222',
  memberId: mockRegularMember.id,
  name: 'TestWarrior',
  class: 'Warrior' as const,
  level: 60,
  race: 'Orc' as const,
  realm: 'Test Realm',
  faction: 'Horde' as const,
  isMain: true,
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockEvent = {
  id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  tenantId: '22222222-2222-2222-2222-222222222222',
  name: 'Molten Core Raid',
  description: 'Weekly MC clear',
  eventType: 'raid' as const,
  startsAt: new Date('2026-02-01T19:00:00Z'),
  endsAt: new Date('2026-02-01T22:00:00Z'),
  location: 'Molten Core',
  maxSize: 40,
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockLootEntry = {
  id: 'llllllll-llll-llll-llll-llllllllllll',
  tenantId: '22222222-2222-2222-2222-222222222222',
  characterId: mockCharacter.id,
  characterName: 'TestWarrior',
  eventId: mockEvent.id,
  itemId: 18803,
  itemName: "Finkle's Lava Dredger",
  itemLink:
    "|cffa335ee|Hitem:18803::::::::60:::::|h[Finkle's Lava Dredger]|h|r",
  source: 'Molten Core',
  sourceType: 'boss',
  cost: 150,
  rollType: 'MS',
  importSource: 'manual',
  importHash: null,
  metadata: {},
  awardedAt: new Date('2026-01-28T20:30:00Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockLootEntry2 = {
  id: 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
  tenantId: '22222222-2222-2222-2222-222222222222',
  characterId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  characterName: 'TestMage',
  eventId: mockEvent.id,
  itemId: 18809,
  itemName: 'Sash of Whispered Secrets',
  itemLink:
    '|cffa335ee|Hitem:18809::::::::60:::::|h[Sash of Whispered Secrets]|h|r',
  source: 'Molten Core',
  sourceType: 'boss',
  cost: 100,
  rollType: 'MS',
  importSource: 'manual',
  importHash: null,
  metadata: {},
  awardedAt: new Date('2026-01-28T20:45:00Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('lootRouter', () => {
  const testRouter = router({ loot: lootRouter })
  const createCaller = createCallerFactory(testRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should list loot for tenant', async () => {
      const mockDb = createMockDb()
      const mockLoot = [
        {
          ...mockLootEntry,
          character: mockCharacter,
          event: mockEvent,
        },
        {
          ...mockLootEntry2,
          character: {
            ...mockCharacter,
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            name: 'TestMage',
          },
          event: mockEvent,
        },
      ]
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce(mockLoot)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.loot.list()

      expect(result).toHaveLength(2)
      expect(result[0].itemName).toBe("Finkle's Lava Dredger")
      expect(result[0].character).toBeDefined()
      expect(result[0].event).toBeDefined()
      expect(result[1].itemName).toBe('Sash of Whispered Secrets')
      expect(mockDb.query.lootHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          with: {
            character: true,
            event: true,
          },
        })
      )
    })

    it('should filter by characterId', async () => {
      const mockDb = createMockDb()
      const mockLoot = [
        {
          ...mockLootEntry,
          character: mockCharacter,
          event: mockEvent,
        },
      ]
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce(mockLoot)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.loot.list({
        characterId: mockCharacter.id,
      })

      expect(result).toHaveLength(1)
      expect(result[0].characterId).toBe(mockCharacter.id)
      expect(result[0].characterName).toBe('TestWarrior')
    })

    it('should filter by search term (item name)', async () => {
      const mockDb = createMockDb()
      const mockLoot = [
        {
          ...mockLootEntry,
          character: mockCharacter,
          event: mockEvent,
        },
      ]
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce(mockLoot)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.loot.list({
        search: 'Finkle',
      })

      expect(result).toHaveLength(1)
      expect(result[0].itemName).toContain('Finkle')
    })

    it('should paginate results with limit and offset', async () => {
      const mockDb = createMockDb()
      const mockLoot = [
        {
          ...mockLootEntry2,
          character: {
            ...mockCharacter,
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            name: 'TestMage',
          },
          event: mockEvent,
        },
      ]
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce(mockLoot)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.loot.list({
        limit: 10,
        offset: 1,
      })

      expect(mockDb.query.lootHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 1,
        })
      )
      expect(result).toBeDefined()
    })

    it('should use default pagination values', async () => {
      const mockDb = createMockDb()
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([])

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      await caller.loot.list()

      expect(mockDb.query.lootHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
          offset: 0,
        })
      )
    })

    it('should return character and event relations', async () => {
      const mockDb = createMockDb()
      const mockLoot = [
        {
          ...mockLootEntry,
          character: mockCharacter,
          event: mockEvent,
        },
      ]
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce(mockLoot)

      const caller = createCaller({
        db: mockDb as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockRegularMember as Context['member'],
      })

      const result = await caller.loot.list()

      expect(result[0].character).toEqual(mockCharacter)
      expect(result[0].event).toEqual(mockEvent)
    })
  })

  describe('record', () => {
    it('should record loot with all fields', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      const newLoot = {
        ...mockLootEntry,
        id: 'new-loot-id',
        cost: 200,
        rollType: 'SR',
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([newLoot])

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

      const result = await caller.loot.record({
        characterName: 'TestWarrior',
        characterId: mockCharacter.id,
        itemId: 18803,
        itemName: "Finkle's Lava Dredger",
        itemLink:
          "|cffa335ee|Hitem:18803::::::::60:::::|h[Finkle's Lava Dredger]|h|r",
        source: 'Molten Core',
        sourceType: 'boss',
        cost: 200,
        rollType: 'SR',
        awardedAt: '2026-01-28T20:30:00Z',
        eventId: mockEvent.id,
        metadata: { officerNote: 'Good roll!' },
      })

      expect(result.itemName).toBe("Finkle's Lava Dredger")
      expect(result.cost).toBe(200)
      expect(result.rollType).toBe('SR')
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: mockTenant.id,
          characterId: mockCharacter.id,
          characterName: 'TestWarrior',
          itemId: 18803,
          itemName: "Finkle's Lava Dredger",
          cost: 200,
          rollType: 'SR',
          eventId: mockEvent.id,
          importSource: 'manual',
          metadata: { officerNote: 'Good roll!' },
        })
      )
    })

    it('should record loot with minimal fields', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findFirst.mockResolvedValueOnce(null)
      const minimalLoot = {
        id: 'minimal-loot-id',
        tenantId: mockTenant.id,
        characterId: undefined,
        characterName: 'UnknownPlayer',
        itemName: 'Some Item',
        itemId: null,
        itemLink: null,
        source: null,
        sourceType: null,
        cost: null,
        rollType: null,
        eventId: null,
        importSource: 'manual',
        importHash: null,
        metadata: {},
        awardedAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([minimalLoot])

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

      const result = await caller.loot.record({
        characterName: 'UnknownPlayer',
        itemName: 'Some Item',
      })

      expect(result.characterName).toBe('UnknownPlayer')
      expect(result.itemName).toBe('Some Item')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should auto-match character by name', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      const newLoot = {
        ...mockLootEntry,
        id: 'auto-matched-loot-id',
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([newLoot])

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

      await caller.loot.record({
        characterName: 'TestWarrior',
        itemName: 'Some Item',
      })

      expect(mockDb.query.characters.findFirst).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          characterId: mockCharacter.id,
          characterName: 'TestWarrior',
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
        caller.loot.record({
          characterName: 'TestWarrior',
          itemName: 'Some Item',
        })
      ).rejects.toThrow(TRPCError)

      // Verify it didn't even check for the character
      expect(mockDb.query.characters.findFirst).not.toHaveBeenCalled()
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it('should verify tenant isolation', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      const newLoot = {
        ...mockLootEntry,
        id: 'tenant-isolated-loot-id',
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([newLoot])

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

      await caller.loot.record({
        characterName: 'TestWarrior',
        itemName: 'Some Item',
      })

      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: mockTenant.id,
        })
      )
    })
  })

  describe('bulkImport', () => {
    it('should import multiple items', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findMany.mockResolvedValueOnce([mockCharacter])
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([])
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([])
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([])

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

      const result = await caller.loot.bulkImport({
        items: [
          {
            characterName: 'TestWarrior',
            itemId: 18803,
            itemName: "Finkle's Lava Dredger",
            itemLink:
              "|cffa335ee|Hitem:18803::::::::60:::::|h[Finkle's Lava Dredger]|h|r",
            source: 'Molten Core',
            awardedAt: '2026-01-28T20:30:00Z',
            rollType: 'MS',
            importHash: 'hash1',
          },
          {
            characterName: 'TestWarrior',
            itemId: 18809,
            itemName: 'Sash of Whispered Secrets',
            source: 'Molten Core',
            awardedAt: '2026-01-28T20:45:00Z',
            rollType: 'MS',
            importHash: 'hash2',
          },
        ],
        importSource: 'gargul',
      })

      expect(result.imported).toBe(2)
      expect(result.skipped).toBe(0)
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            characterName: 'TestWarrior',
            itemName: "Finkle's Lava Dredger",
            importHash: 'hash1',
            importSource: 'gargul',
          }),
          expect.objectContaining({
            characterName: 'TestWarrior',
            itemName: 'Sash of Whispered Secrets',
            importHash: 'hash2',
            importSource: 'gargul',
          }),
        ])
      )
    })

    it('should skip duplicates by importHash', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findMany.mockResolvedValueOnce([mockCharacter])
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([])
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([
        { importHash: 'hash1' },
      ])
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        {
          ...mockLootEntry,
          id: 'loot-1',
          importHash: 'hash2',
          characterName: 'TestWarrior',
          metadata: {},
        },
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

      const result = await caller.loot.bulkImport({
        items: [
          {
            characterName: 'TestWarrior',
            itemName: "Finkle's Lava Dredger",
            awardedAt: '2026-01-28T20:30:00Z',
            importHash: 'hash1', // Duplicate
          },
          {
            characterName: 'TestWarrior',
            itemName: 'Sash of Whispered Secrets',
            awardedAt: '2026-01-28T20:45:00Z',
            importHash: 'hash2', // New
          },
        ],
        importSource: 'gargul',
      })

      expect(result.imported).toBe(1)
      expect(result.skipped).toBe(1)
      expect(mockDb.insert).toHaveBeenCalled()
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            importHash: 'hash2',
          }),
        ])
      )
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({
            importHash: 'hash1',
          }),
        ])
      )
    })

    it('should map character names to IDs (case-insensitive)', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findMany.mockResolvedValueOnce([
        mockCharacter,
        {
          ...mockCharacter,
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          name: 'TestMage',
        },
      ])
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([])
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([])
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        {
          ...mockLootEntry,
          id: 'loot-1',
          characterName: 'testwarrior',
          metadata: {},
        },
        {
          ...mockLootEntry,
          id: 'loot-2',
          characterName: 'TESTMAGE',
          metadata: {},
        },
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

      const result = await caller.loot.bulkImport({
        items: [
          {
            characterName: 'testwarrior', // Lowercase variant
            itemName: 'Item 1',
            awardedAt: '2026-01-28T20:30:00Z',
            importHash: 'hash1',
          },
          {
            characterName: 'TESTMAGE', // Uppercase variant
            itemName: 'Item 2',
            awardedAt: '2026-01-28T20:45:00Z',
            importHash: 'hash2',
          },
        ],
        importSource: 'gargul',
      })

      expect(result.imported).toBe(2)
      expect((mockDb.insert as any).valuesFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            characterName: 'testwarrior',
            characterId: mockCharacter.id,
          }),
          expect.objectContaining({
            characterName: 'TESTMAGE',
            characterId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          }),
        ])
      )
    })

    it('should return imported and skipped counts', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findMany.mockResolvedValueOnce([mockCharacter])
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([])
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([
        { importHash: 'hash1' },
        { importHash: 'hash2' },
      ])
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        {
          ...mockLootEntry,
          id: 'loot-3',
          importHash: 'hash3',
          characterName: 'TestWarrior',
          metadata: {},
        },
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

      const result = await caller.loot.bulkImport({
        items: [
          {
            characterName: 'TestWarrior',
            itemName: 'Item 1',
            awardedAt: '2026-01-28T20:30:00Z',
            importHash: 'hash1',
          },
          {
            characterName: 'TestWarrior',
            itemName: 'Item 2',
            awardedAt: '2026-01-28T20:45:00Z',
            importHash: 'hash2',
          },
          {
            characterName: 'TestWarrior',
            itemName: 'Item 3',
            awardedAt: '2026-01-28T21:00:00Z',
            importHash: 'hash3',
          },
        ],
        importSource: 'gargul',
      })

      expect(result.imported).toBe(1)
      expect(result.skipped).toBe(2)
    })

    it('should return early if all items are duplicates', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findMany.mockResolvedValueOnce([mockCharacter])
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([])
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([
        { importHash: 'hash1' },
        { importHash: 'hash2' },
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

      const result = await caller.loot.bulkImport({
        items: [
          {
            characterName: 'TestWarrior',
            itemName: 'Item 1',
            awardedAt: '2026-01-28T20:30:00Z',
            importHash: 'hash1',
          },
          {
            characterName: 'TestWarrior',
            itemName: 'Item 2',
            awardedAt: '2026-01-28T20:45:00Z',
            importHash: 'hash2',
          },
        ],
        importSource: 'gargul',
      })

      expect(result.imported).toBe(0)
      expect(result.skipped).toBe(2)
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
        caller.loot.bulkImport({
          items: [
            {
              characterName: 'TestWarrior',
              itemName: 'Some Item',
              awardedAt: '2026-01-28T20:30:00Z',
              importHash: 'hash1',
            },
          ],
          importSource: 'gargul',
        })
      ).rejects.toThrow(TRPCError)

      // Verify it didn't even check for characters
      expect(mockDb.query.characters.findMany).not.toHaveBeenCalled()
      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('DKP Integration - record', () => {
    const mockDkpBalance = {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      tenantId: '22222222-2222-2222-2222-222222222222',
      memberId: mockRegularMember.id,
      currentBalance: 500,
      lifetimeEarned: 1000,
      lifetimeSpent: 500,
      lastUpdated: new Date(),
    }

    it('should deduct DKP when recording loot with cost', async () => {
      const mockDb = createMockDb()
      const characterWithMember = {
        ...mockCharacter,
        memberId: mockRegularMember.id,
      }
      mockDb.query.characters.findFirst.mockResolvedValueOnce(
        characterWithMember
      )
      mockDb.query.dkpBalances.findFirst.mockResolvedValueOnce(mockDkpBalance)

      const newLoot = {
        ...mockLootEntry,
        id: 'new-loot-id',
        cost: 150,
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([newLoot])

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

      await caller.loot.record({
        characterName: 'TestWarrior',
        characterId: mockCharacter.id,
        itemName: "Finkle's Lava Dredger",
        cost: 150,
      })

      // Verify DKP transaction was created
      expect(mockDb.insert).toHaveBeenCalledTimes(2) // Once for loot, once for DKP transaction
      const insertCalls = (mockDb.insert as any).mock.calls

      // Verify DKP balance was updated
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should not deduct DKP when loot has no cost', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      const newLoot = {
        ...mockLootEntry,
        id: 'new-loot-id',
        cost: null,
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([newLoot])

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

      await caller.loot.record({
        characterName: 'TestWarrior',
        itemName: 'Some Item',
      })

      // Only loot insert, no DKP operations
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
      expect(mockDb.query.dkpBalances.findFirst).not.toHaveBeenCalled()
    })

    it('should skip DKP deduction when deductDkp is false', async () => {
      const mockDb = createMockDb()
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      const newLoot = {
        ...mockLootEntry,
        id: 'new-loot-id',
        cost: 150,
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([newLoot])

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

      await caller.loot.record({
        characterName: 'TestWarrior',
        itemName: 'Some Item',
        cost: 150,
        deductDkp: false,
      })

      // Only loot insert, no DKP operations
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
      expect(mockDb.query.dkpBalances.findFirst).not.toHaveBeenCalled()
    })

    it('should handle insufficient DKP balance', async () => {
      const mockDb = createMockDb()
      const characterWithMember = {
        ...mockCharacter,
        memberId: mockRegularMember.id,
      }
      // When characterId is provided, only one findFirst call happens (to get full character)
      mockDb.query.characters.findFirst.mockResolvedValueOnce(
        characterWithMember
      )

      const lowBalance = { ...mockDkpBalance, currentBalance: 50 }
      mockDb.query.dkpBalances.findFirst.mockResolvedValueOnce(lowBalance)

      const newLoot = {
        ...mockLootEntry,
        id: 'new-loot-id',
        cost: 150,
        metadata: {},
      }
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([newLoot])

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

      await caller.loot.record({
        characterName: 'TestWarrior',
        characterId: mockCharacter.id,
        itemName: "Finkle's Lava Dredger",
        cost: 150,
      })

      // Loot was recorded
      expect(mockDb.insert).toHaveBeenCalledTimes(1)

      // Metadata was updated with DKP not deducted info
      expect(mockDb.update).toHaveBeenCalled()
      expect((mockDb.update as any).setFn).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            dkpNotDeducted: true,
            dkpNotDeductedReason: 'insufficient_balance',
          }),
        })
      )
    })
  })

  describe('DKP Integration - bulkImport', () => {
    it('should return dkpDeducted and dkpSkipped counts', async () => {
      const mockDb = createMockDb()
      const characterWithMember = {
        ...mockCharacter,
        memberId: mockRegularMember.id,
      }
      mockDb.query.characters.findMany.mockResolvedValueOnce([
        characterWithMember,
      ])

      const mockDkpBalance = {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        tenantId: '22222222-2222-2222-2222-222222222222',
        memberId: mockRegularMember.id,
        currentBalance: 500,
        lifetimeEarned: 1000,
        lifetimeSpent: 500,
        lastUpdated: new Date(),
      }
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([mockDkpBalance])
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([])

      const insertedLoot = [
        {
          ...mockLootEntry,
          id: 'loot-1',
          cost: 100,
          characterName: 'TestWarrior',
          metadata: {},
        },
        {
          ...mockLootEntry,
          id: 'loot-2',
          cost: null,
          characterName: 'TestWarrior',
          metadata: {},
        },
      ]
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce(insertedLoot)

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

      const result = await caller.loot.bulkImport({
        items: [
          {
            characterName: 'TestWarrior',
            itemName: 'Item with cost',
            cost: 100,
            awardedAt: '2026-01-28T20:30:00Z',
            importHash: 'hash1',
          },
          {
            characterName: 'TestWarrior',
            itemName: 'Item without cost',
            awardedAt: '2026-01-28T20:45:00Z',
            importHash: 'hash2',
          },
        ],
        importSource: 'gargul',
      })

      expect(result.imported).toBe(2)
      expect(result.dkpDeducted).toBe(1)
      expect(result.dkpSkipped).toBe(0)
    })

    it('should skip DKP for items without member link', async () => {
      const mockDb = createMockDb()
      const characterNoMember = { ...mockCharacter, memberId: null }
      mockDb.query.characters.findMany.mockResolvedValueOnce([
        characterNoMember,
      ])
      mockDb.query.dkpBalances.findMany.mockResolvedValueOnce([])
      mockDb.query.lootHistory.findMany.mockResolvedValueOnce([])

      const insertedLoot = [
        {
          ...mockLootEntry,
          id: 'loot-1',
          cost: 100,
          characterName: 'TestWarrior',
          metadata: {},
        },
      ]
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce(insertedLoot)

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

      const result = await caller.loot.bulkImport({
        items: [
          {
            characterName: 'TestWarrior',
            itemName: 'Item with cost',
            cost: 100,
            awardedAt: '2026-01-28T20:30:00Z',
            importHash: 'hash1',
          },
        ],
        importSource: 'gargul',
      })

      expect(result.imported).toBe(1)
      expect(result.dkpDeducted).toBe(0)
      expect(result.dkpSkipped).toBe(1)
    })
  })
})
