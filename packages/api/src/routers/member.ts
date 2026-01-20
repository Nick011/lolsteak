import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import { members, users, characters } from '@guild/db/schema'
import { roles, memberRoles, DEFAULT_ROLES } from '@guild/db/schema'
import { eq, and, inArray } from '@guild/db'
import { TRPCError } from '@trpc/server'

export const memberRouter = router({
  // List all members in tenant
  list: tenantProcedure.query(async ({ ctx }) => {
    const memberList = await ctx.db.query.members.findMany({
      where: eq(members.tenantId, ctx.tenant.id),
      with: {
        user: true,
      },
      orderBy: (m, { asc }) => asc(m.joinedAt),
    })

    // Get member roles for each member
    const memberIds = memberList.map(m => m.id)
    const memberRoleAssignments = memberIds.length
      ? await ctx.db.query.memberRoles.findMany({
          where: inArray(memberRoles.memberId, memberIds),
          with: {
            role: true,
          },
        })
      : []

    // Get characters for each member
    const memberCharacters = memberIds.length
      ? await ctx.db.query.characters.findMany({
          where: and(
            inArray(characters.memberId, memberIds),
            eq(characters.tenantId, ctx.tenant.id)
          ),
        })
      : []

    // Group roles and characters by member
    const rolesByMember = memberRoleAssignments.reduce(
      (acc, mr) => {
        if (!acc[mr.memberId]) acc[mr.memberId] = []
        acc[mr.memberId].push(mr.role)
        return acc
      },
      {} as Record<string, (typeof memberRoleAssignments)[0]['role'][]>
    )

    const charsByMember = memberCharacters.reduce(
      (acc, char) => {
        if (!char.memberId) return acc
        if (!acc[char.memberId]) acc[char.memberId] = []
        acc[char.memberId].push(char)
        return acc
      },
      {} as Record<string, typeof memberCharacters>
    )

    return memberList.map(m => ({
      ...m,
      roles: rolesByMember[m.id] || [],
      characters: charsByMember[m.id] || [],
      mainCharacter: charsByMember[m.id]?.find(c => c.isMain === 'true'),
    }))
  }),

  // Get a single member by ID
  get: tenantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.id, input.id),
          eq(members.tenantId, ctx.tenant.id)
        ),
        with: {
          user: true,
        },
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      // Get roles
      const memberRoleList = await ctx.db.query.memberRoles.findMany({
        where: eq(memberRoles.memberId, member.id),
        with: {
          role: true,
        },
      })

      // Get characters
      const memberCharacters = await ctx.db.query.characters.findMany({
        where: and(
          eq(characters.memberId, member.id),
          eq(characters.tenantId, ctx.tenant.id)
        ),
        orderBy: (c, { desc }) => desc(c.isMain),
      })

      return {
        ...member,
        roles: memberRoleList.map(mr => mr.role),
        characters: memberCharacters,
        mainCharacter: memberCharacters.find(c => c.isMain === 'true'),
      }
    }),

  // Get current member (self)
  me: tenantProcedure.query(async ({ ctx }) => {
    const memberRoleList = await ctx.db.query.memberRoles.findMany({
      where: eq(memberRoles.memberId, ctx.member.id),
      with: {
        role: true,
      },
    })

    const memberCharacters = await ctx.db.query.characters.findMany({
      where: and(
        eq(characters.memberId, ctx.member.id),
        eq(characters.tenantId, ctx.tenant.id)
      ),
      orderBy: (c, { desc }) => desc(c.isMain),
    })

    return {
      ...ctx.member,
      roles: memberRoleList.map(mr => mr.role),
      characters: memberCharacters,
      mainCharacter: memberCharacters.find(c => c.isMain === 'true'),
    }
  }),

  // Update a member (officers can edit anyone, members can edit themselves)
  update: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nickname: z.string().max(100).optional().nullable(),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const target = await ctx.db.query.members.findFirst({
        where: and(eq(members.id, id), eq(members.tenantId, ctx.tenant.id)),
      })

      if (!target) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      const isSelf = target.id === ctx.member.id
      const isOfficer = ['owner', 'officer'].includes(ctx.member.role)

      if (!isSelf && !isOfficer) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to edit this member',
        })
      }

      const [updated] = await ctx.db
        .update(members)
        .set({
          ...(data.nickname !== undefined && { nickname: data.nickname }),
          ...(data.notes !== undefined && { notes: data.notes }),
          updatedAt: new Date(),
        })
        .where(eq(members.id, id))
        .returning()

      return updated
    }),

  // Kick a member (officers only, can't kick owner)
  kick: officerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.id, input.id),
          eq(members.tenantId, ctx.tenant.id)
        ),
      })

      if (!target) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      if (target.role === 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot kick the guild owner',
        })
      }

      if (target.id === ctx.member.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot kick yourself',
        })
      }

      // Delete member roles first
      await ctx.db
        .delete(memberRoles)
        .where(eq(memberRoles.memberId, target.id))

      // Delete member
      await ctx.db.delete(members).where(eq(members.id, target.id))

      return { success: true }
    }),

  // Leave guild (self)
  leave: tenantProcedure.mutation(async ({ ctx }) => {
    if (ctx.member.role === 'owner') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Guild owner cannot leave. Transfer ownership first.',
      })
    }

    // Delete member roles
    await ctx.db
      .delete(memberRoles)
      .where(eq(memberRoles.memberId, ctx.member.id))

    // Delete member
    await ctx.db.delete(members).where(eq(members.id, ctx.member.id))

    return { success: true }
  }),

  // Transfer ownership (owner only)
  transferOwnership: tenantProcedure
    .input(z.object({ newOwnerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.member.role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the owner can transfer ownership',
        })
      }

      const newOwner = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.id, input.newOwnerId),
          eq(members.tenantId, ctx.tenant.id)
        ),
      })

      if (!newOwner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target member not found',
        })
      }

      // Demote current owner to officer
      await ctx.db
        .update(members)
        .set({ role: 'officer', updatedAt: new Date() })
        .where(eq(members.id, ctx.member.id))

      // Promote new owner
      await ctx.db
        .update(members)
        .set({ role: 'owner', updatedAt: new Date() })
        .where(eq(members.id, input.newOwnerId))

      return { success: true }
    }),

  // Promote member to officer (owner only)
  promote: tenantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.member.role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the owner can promote members',
        })
      }

      const target = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.id, input.id),
          eq(members.tenantId, ctx.tenant.id)
        ),
      })

      if (!target) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      if (target.role !== 'member') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Member is already an officer or owner',
        })
      }

      const [updated] = await ctx.db
        .update(members)
        .set({ role: 'officer', updatedAt: new Date() })
        .where(eq(members.id, input.id))
        .returning()

      return updated
    }),

  // Demote officer to member (owner only)
  demote: tenantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.member.role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the owner can demote officers',
        })
      }

      const target = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.id, input.id),
          eq(members.tenantId, ctx.tenant.id)
        ),
      })

      if (!target) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      if (target.role !== 'officer') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Member is not an officer',
        })
      }

      const [updated] = await ctx.db
        .update(members)
        .set({ role: 'member', updatedAt: new Date() })
        .where(eq(members.id, input.id))
        .returning()

      return updated
    }),
})
