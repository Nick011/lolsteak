import { describe, expect, it, vi } from 'vitest'
import { TRPCError } from '@trpc/server'
import {
  router,
  publicProcedure,
  protectedProcedure,
  tenantProcedure,
  officerProcedure,
  createCallerFactory,
} from '../trpc'
import type { Context } from '../context'

// Create a minimal mock database that satisfies the db interface
const createMockDb = () => ({
  query: {
    tenants: { findFirst: vi.fn(), findMany: vi.fn() },
    members: { findFirst: vi.fn(), findMany: vi.fn() },
    users: { findFirst: vi.fn(), findMany: vi.fn() },
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn(),
    }),
  }),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
})

describe('@guild/api tRPC', () => {
  describe('router and procedures export', () => {
    it('should export router function', () => {
      expect(router).toBeDefined()
      expect(typeof router).toBe('function')
    })

    it('should export publicProcedure', () => {
      expect(publicProcedure).toBeDefined()
    })

    it('should export protectedProcedure', () => {
      expect(protectedProcedure).toBeDefined()
    })

    it('should export tenantProcedure', () => {
      expect(tenantProcedure).toBeDefined()
    })

    it('should export officerProcedure', () => {
      expect(officerProcedure).toBeDefined()
    })

    it('should export createCallerFactory', () => {
      expect(createCallerFactory).toBeDefined()
      expect(typeof createCallerFactory).toBe('function')
    })
  })

  describe('protectedProcedure middleware', () => {
    const testRouter = router({
      protectedQuery: protectedProcedure.query(({ ctx }) => {
        return { user: ctx.user }
      }),
    })

    const createCaller = createCallerFactory(testRouter)

    it('should reject unauthenticated requests', async () => {
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: null,
        tenant: null,
        member: null,
      })

      await expect(caller.protectedQuery()).rejects.toThrow(TRPCError)
      await expect(caller.protectedQuery()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      })
    })

    it('should allow authenticated requests', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      }
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: null,
        member: null,
      })

      const result = await caller.protectedQuery()
      expect(result.user).toEqual(mockUser)
    })
  })

  describe('tenantProcedure middleware', () => {
    const testRouter = router({
      tenantQuery: tenantProcedure.query(({ ctx }) => {
        return { tenant: ctx.tenant, member: ctx.member }
      }),
    })

    const createCaller = createCallerFactory(testRouter)
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    }
    const mockTenant = {
      id: 'tenant-123',
      slug: 'test-guild',
      name: 'Test Guild',
    }
    const mockMember = {
      id: 'member-123',
      role: 'member' as const,
      tenantId: 'tenant-123',
      userId: 'user-123',
    }

    it('should reject when no tenant', async () => {
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: null,
        member: null,
      })

      await expect(caller.tenantQuery()).rejects.toThrow(TRPCError)
      await expect(caller.tenantQuery()).rejects.toMatchObject({
        code: 'NOT_FOUND',
      })
    })

    it('should reject when not a member', async () => {
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: null,
      })

      await expect(caller.tenantQuery()).rejects.toThrow(TRPCError)
      await expect(caller.tenantQuery()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })

    it('should allow tenant members', async () => {
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockMember as Context['member'],
      })

      const result = await caller.tenantQuery()
      expect(result.tenant).toEqual(mockTenant)
      expect(result.member).toEqual(mockMember)
    })
  })

  describe('officerProcedure middleware', () => {
    const testRouter = router({
      officerQuery: officerProcedure.query(() => {
        return { success: true }
      }),
    })

    const createCaller = createCallerFactory(testRouter)
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    }
    const mockTenant = {
      id: 'tenant-123',
      slug: 'test-guild',
      name: 'Test Guild',
    }

    it('should reject regular members', async () => {
      const mockMember = {
        id: 'member-123',
        role: 'member' as const,
        tenantId: 'tenant-123',
        userId: 'user-123',
      }
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockMember as Context['member'],
      })

      await expect(caller.officerQuery()).rejects.toThrow(TRPCError)
      await expect(caller.officerQuery()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })

    it('should allow officers', async () => {
      const mockMember = {
        id: 'member-123',
        role: 'officer' as const,
        tenantId: 'tenant-123',
        userId: 'user-123',
      }
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockMember as Context['member'],
      })

      const result = await caller.officerQuery()
      expect(result.success).toBe(true)
    })

    it('should allow owners', async () => {
      const mockMember = {
        id: 'member-123',
        role: 'owner' as const,
        tenantId: 'tenant-123',
        userId: 'user-123',
      }
      const caller = createCaller({
        db: createMockDb() as unknown as Context['db'],
        session: {
          user: mockUser,
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        tenant: mockTenant as Context['tenant'],
        member: mockMember as Context['member'],
      })

      const result = await caller.officerQuery()
      expect(result.success).toBe(true)
    })
  })
})
