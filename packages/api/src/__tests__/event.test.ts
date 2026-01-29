import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock db module before any imports that use it
vi.mock('@guild/db', () => ({
  eq: vi.fn((a, b) => ({ _eq: [a, b] })),
  and: vi.fn((...args) => ({ _and: args })),
  gte: vi.fn((a, b) => ({ _gte: [a, b] })),
}))

vi.mock('@guild/db/schema', () => ({
  events: { id: 'events.id', tenantId: 'events.tenantId' },
  eventSignups: {
    id: 'eventSignups.id',
    eventId: 'eventSignups.eventId',
    characterId: 'eventSignups.characterId',
  },
  eventSoftReserves: {
    id: 'eventSoftReserves.id',
    eventId: 'eventSoftReserves.eventId',
    characterId: 'eventSoftReserves.characterId',
  },
  characters: { id: 'characters.id', memberId: 'characters.memberId' },
}))

import { router, createCallerFactory } from '../trpc'
import { eventRouter } from '../routers/event'
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
      events: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      characters: {
        findFirst: vi.fn(),
      },
      eventSignups: {
        findFirst: vi.fn(),
      },
      eventSoftReserves: {
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

const mockEvent = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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

const mockOtherTenantEvent = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  tenantId: '33333333-3333-3333-3333-333333333333', // Different tenant
  name: 'Other Guild Event',
  description: 'Not our event',
  eventType: 'raid' as const,
  startsAt: new Date('2026-02-01T19:00:00Z'),
  endsAt: null,
  location: null,
  maxSize: null,
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('eventRouter', () => {
  const testRouter = router({ event: eventRouter })
  const createCaller = createCallerFactory(testRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('update', () => {
    it('should update event with valid data (officer)', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEvent)
      const updatedEvent = {
        ...mockEvent,
        name: 'Updated MC Raid',
        description: 'Updated description',
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updatedEvent])

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

      const result = await caller.event.update({
        id: mockEvent.id,
        name: 'Updated MC Raid',
        description: 'Updated description',
      })

      expect(result.name).toBe('Updated MC Raid')
      expect(result.description).toBe('Updated description')
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should update event dates correctly', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEvent)
      const newStartDate = '2026-02-02T19:00:00Z'
      const newEndDate = '2026-02-02T22:00:00Z'
      const updatedEvent = {
        ...mockEvent,
        startsAt: new Date(newStartDate),
        endsAt: new Date(newEndDate),
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updatedEvent])

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

      const result = await caller.event.update({
        id: mockEvent.id,
        startsAt: newStartDate,
        endsAt: newEndDate,
      })

      expect(result.startsAt).toEqual(new Date(newStartDate))
      expect(result.endsAt).toEqual(new Date(newEndDate))
    })

    it('should update event type and settings', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEvent)
      const updatedEvent = {
        ...mockEvent,
        eventType: 'dungeon' as const,
        maxSize: 5,
        settings: { softReserveEnabled: true },
      }
      ;(mockDb.update as any).returningFn.mockResolvedValueOnce([updatedEvent])

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

      const result = await caller.event.update({
        id: mockEvent.id,
        eventType: 'dungeon',
        maxSize: 5,
        settings: { softReserveEnabled: true },
      })

      expect(result.eventType).toBe('dungeon')
      expect(result.maxSize).toBe(5)
      expect(result.settings).toEqual({ softReserveEnabled: true })
    })

    it('should throw error for invalid event id', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(null)

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

      const invalidId = '00000000-0000-0000-0000-000000000000'
      await expect(
        caller.event.update({
          id: invalidId,
          name: 'Should Fail',
        })
      ).rejects.toThrow('Event not found')
    })

    it('should throw error when updating event from different tenant', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(null) // Different tenant returns null

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
        caller.event.update({
          id: mockOtherTenantEvent.id,
          name: 'Should Fail',
        })
      ).rejects.toThrow('Event not found')
    })

    it('should reject update from non-officer', async () => {
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
        caller.event.update({
          id: mockEvent.id,
          name: 'Should Fail',
        })
      ).rejects.toThrow(TRPCError)

      // Verify it didn't even check for the event
      expect(mockDb.query.events.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete event with valid id (officer)', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEvent)
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

      const result = await caller.event.delete({ id: mockEvent.id })

      expect(result.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should throw error for invalid event id', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(null)

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

      const invalidId = '00000000-0000-0000-0000-000000000000'
      await expect(caller.event.delete({ id: invalidId })).rejects.toThrow(
        'Event not found'
      )

      // Verify delete was never called
      expect(mockDb.delete).not.toHaveBeenCalled()
    })

    it('should throw error when deleting event from different tenant', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(null) // Different tenant returns null

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
        caller.event.delete({ id: mockOtherTenantEvent.id })
      ).rejects.toThrow('Event not found')

      // Verify delete was never called
      expect(mockDb.delete).not.toHaveBeenCalled()
    })

    it('should reject delete from non-officer', async () => {
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

      await expect(caller.event.delete({ id: mockEvent.id })).rejects.toThrow(
        TRPCError
      )

      // Verify it didn't even check for the event
      expect(mockDb.query.events.findFirst).not.toHaveBeenCalled()
      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  describe('signup', () => {
    it('should reject signup to event from different tenant', async () => {
      const mockDb = createMockDb()
      // Event not found because it belongs to different tenant
      mockDb.query.events.findFirst.mockResolvedValueOnce(null)

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
        caller.event.signup({
          eventId: mockOtherTenantEvent.id,
          characterId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
          status: 'confirmed',
        })
      ).rejects.toThrow('Event not found')

      // Verify character check was never reached
      expect(mockDb.query.characters.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('softReserve', () => {
    const mockCharacter = {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'TestChar',
      class: 'Warrior',
      memberId: mockRegularMember.id,
    }

    const mockEventWithSR = {
      ...mockEvent,
      settings: {
        softReserveEnabled: true,
        softReserveLimit: 3,
      },
    }

    const mockSoftReserve = {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      eventId: mockEvent.id,
      characterId: mockCharacter.id,
      itemId: 19019,
      itemName: 'Thunderfury, Blessed Blade of the Windseeker',
      createdAt: new Date(),
    }

    it('should create a soft reserve successfully', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEventWithSR)
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      mockDb.query.eventSoftReserves.findMany.mockResolvedValueOnce([])
      mockDb.query.eventSoftReserves.findFirst.mockResolvedValueOnce(null)
      ;(mockDb.insert as any).returningFn.mockResolvedValueOnce([
        mockSoftReserve,
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

      const result = await caller.event.softReserve({
        eventId: mockEvent.id,
        characterId: mockCharacter.id,
        itemId: 19019,
        itemName: 'Thunderfury, Blessed Blade of the Windseeker',
      })

      expect(result.itemName).toBe(
        'Thunderfury, Blessed Blade of the Windseeker'
      )
      expect(result.itemId).toBe(19019)
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should reject soft reserve if not enabled for event', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEvent)

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
        caller.event.softReserve({
          eventId: mockEvent.id,
          characterId: mockCharacter.id,
          itemId: 19019,
          itemName: 'Thunderfury',
        })
      ).rejects.toThrow('Soft reserves are not enabled for this event')
    })

    it('should reject soft reserve if limit reached', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEventWithSR)
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      mockDb.query.eventSoftReserves.findMany.mockResolvedValueOnce([
        mockSoftReserve,
        { ...mockSoftReserve, id: 'different-id-1', itemId: 123 },
        { ...mockSoftReserve, id: 'different-id-2', itemId: 456 },
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

      await expect(
        caller.event.softReserve({
          eventId: mockEvent.id,
          characterId: mockCharacter.id,
          itemId: 789,
          itemName: 'Another Item',
        })
      ).rejects.toThrow('Soft reserve limit reached (3 items per player)')
    })

    it('should reject duplicate soft reserve', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEventWithSR)
      mockDb.query.characters.findFirst.mockResolvedValueOnce(mockCharacter)
      mockDb.query.eventSoftReserves.findMany.mockResolvedValueOnce([])
      mockDb.query.eventSoftReserves.findFirst.mockResolvedValueOnce(
        mockSoftReserve
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
        caller.event.softReserve({
          eventId: mockEvent.id,
          characterId: mockCharacter.id,
          itemId: 19019,
          itemName: 'Thunderfury',
        })
      ).rejects.toThrow('You have already soft reserved this item')
    })
  })

  describe('removeSoftReserve', () => {
    const mockCharacter = {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'TestChar',
      class: 'Warrior',
      memberId: mockRegularMember.id,
    }

    const mockSoftReserve = {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      eventId: mockEvent.id,
      characterId: mockCharacter.id,
      itemId: 19019,
      itemName: 'Thunderfury',
      createdAt: new Date(),
      character: mockCharacter,
      event: mockEvent,
    }

    it('should remove own soft reserve successfully', async () => {
      const mockDb = createMockDb()
      mockDb.query.eventSoftReserves.findFirst.mockResolvedValueOnce(
        mockSoftReserve
      )
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

      const result = await caller.event.removeSoftReserve({
        id: mockSoftReserve.id,
      })

      expect(result.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should reject removing another members soft reserve', async () => {
      const mockDb = createMockDb()
      const otherMemberReserve = {
        ...mockSoftReserve,
        character: {
          ...mockCharacter,
          memberId: 'other-member-id',
        },
      }
      mockDb.query.eventSoftReserves.findFirst.mockResolvedValueOnce(
        otherMemberReserve
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
        caller.event.removeSoftReserve({ id: mockSoftReserve.id })
      ).rejects.toThrow('You can only remove your own soft reserves')

      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  describe('getSoftReserves', () => {
    it('should get all soft reserves for an event', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(mockEvent)
      const mockReserves = [
        {
          id: 'sr1',
          eventId: mockEvent.id,
          characterId: 'char1',
          itemId: 123,
          itemName: 'Item 1',
          createdAt: new Date(),
        },
        {
          id: 'sr2',
          eventId: mockEvent.id,
          characterId: 'char2',
          itemId: 456,
          itemName: 'Item 2',
          createdAt: new Date(),
        },
      ]
      mockDb.query.eventSoftReserves.findMany.mockResolvedValueOnce(
        mockReserves
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

      const result = await caller.event.getSoftReserves({
        eventId: mockEvent.id,
      })

      expect(result).toHaveLength(2)
      expect(result[0].itemName).toBe('Item 1')
      expect(result[1].itemName).toBe('Item 2')
    })

    it('should reject getting soft reserves for event from different tenant', async () => {
      const mockDb = createMockDb()
      mockDb.query.events.findFirst.mockResolvedValueOnce(null)

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
        caller.event.getSoftReserves({ eventId: mockOtherTenantEvent.id })
      ).rejects.toThrow('Event not found')
    })
  })
})
