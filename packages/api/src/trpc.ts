import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  })
})

// Middleware to check if user has tenant access
const hasTenantAccess = t.middleware(({ ctx, next }) => {
  if (!ctx.tenant) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Tenant not found',
    })
  }
  if (!ctx.member) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Not a member of this guild',
    })
  }
  return next({
    ctx: {
      tenant: ctx.tenant,
      member: ctx.member,
    },
  })
})

// Middleware to check if user is officer or owner
const isOfficer = t.middleware(({ ctx, next }) => {
  if (!ctx.member || !['owner', 'officer'].includes(ctx.member.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Officer access required',
    })
  }
  return next()
})

export const protectedProcedure = t.procedure.use(isAuthed)
export const tenantProcedure = t.procedure.use(isAuthed).use(hasTenantAccess)
export const officerProcedure = t.procedure
  .use(isAuthed)
  .use(hasTenantAccess)
  .use(isOfficer)
