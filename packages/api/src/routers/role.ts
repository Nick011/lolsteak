import { z } from 'zod'
import { router, tenantProcedure, officerProcedure } from '../trpc'
import {
  roles,
  memberRoles,
  DEFAULT_ROLES,
  type RolePermissions,
} from '@guild/db/schema'
import { members } from '@guild/db/schema'
import { eq, and, gt, lt, sql } from '@guild/db'
import { TRPCError } from '@trpc/server'

// Zod schema for role permissions
const rolePermissionsSchema = z.object({
  members: z
    .object({
      view: z.boolean().optional(),
      invite: z.boolean().optional(),
      kick: z.boolean().optional(),
      editNicknames: z.boolean().optional(),
      assignRoles: z.boolean().optional(),
    })
    .optional(),
  roles: z
    .object({
      view: z.boolean().optional(),
      create: z.boolean().optional(),
      edit: z.boolean().optional(),
      delete: z.boolean().optional(),
      assign: z.boolean().optional(),
    })
    .optional(),
  events: z
    .object({
      view: z.boolean().optional(),
      create: z.boolean().optional(),
      edit: z.boolean().optional(),
      delete: z.boolean().optional(),
      manageSignups: z.boolean().optional(),
    })
    .optional(),
  loot: z
    .object({
      view: z.boolean().optional(),
      record: z.boolean().optional(),
      edit: z.boolean().optional(),
      delete: z.boolean().optional(),
      import: z.boolean().optional(),
    })
    .optional(),
  announcements: z
    .object({
      view: z.boolean().optional(),
      create: z.boolean().optional(),
      edit: z.boolean().optional(),
      delete: z.boolean().optional(),
      pin: z.boolean().optional(),
    })
    .optional(),
  settings: z
    .object({
      view: z.boolean().optional(),
      edit: z.boolean().optional(),
      manageIntegrations: z.boolean().optional(),
    })
    .optional(),
}) satisfies z.ZodType<RolePermissions>

export const roleRouter = router({
  // List all roles in tenant
  list: tenantProcedure.query(async ({ ctx }) => {
    const roleList = await ctx.db.query.roles.findMany({
      where: eq(roles.tenantId, ctx.tenant.id),
      orderBy: (r, { asc }) => asc(r.position),
    })

    return roleList
  }),

  // Get a single role by ID
  get: tenantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.query.roles.findFirst({
        where: and(eq(roles.id, input.id), eq(roles.tenantId, ctx.tenant.id)),
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Get count of members with this role
      const memberCountResult = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(memberRoles)
        .where(eq(memberRoles.roleId, role.id))

      return {
        ...role,
        memberCount: memberCountResult[0]?.count ?? 0,
      }
    }),

  // Create a new role
  create: officerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .default('#6B7280'),
        position: z.number().int().min(0).optional(),
        isDefault: z.boolean().default(false),
        isAdmin: z.boolean().default(false),
        permissions: rolePermissionsSchema.default({}),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if role name already exists in tenant
      const existing = await ctx.db.query.roles.findFirst({
        where: and(
          eq(roles.tenantId, ctx.tenant.id),
          eq(roles.name, input.name)
        ),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A role with this name already exists',
        })
      }

      // If position not specified, add at the end
      let position = input.position
      if (position === undefined) {
        const maxPositionResult = await ctx.db
          .select({ max: sql<number>`coalesce(max(position), -1)::int` })
          .from(roles)
          .where(eq(roles.tenantId, ctx.tenant.id))
        position = (maxPositionResult[0]?.max ?? -1) + 1
      } else {
        // Shift existing roles down to make room
        await ctx.db
          .update(roles)
          .set({
            position: sql`${roles.position} + 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(roles.tenantId, ctx.tenant.id),
              gt(roles.position, position - 1)
            )
          )
      }

      // If setting as default, unset other defaults
      if (input.isDefault) {
        await ctx.db
          .update(roles)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(eq(roles.tenantId, ctx.tenant.id), eq(roles.isDefault, true))
          )
      }

      const [created] = await ctx.db
        .insert(roles)
        .values({
          tenantId: ctx.tenant.id,
          name: input.name,
          color: input.color,
          position,
          isDefault: input.isDefault,
          isAdmin: input.isAdmin,
          permissions: input.permissions,
        })
        .returning()

      return created
    }),

  // Update role
  update: officerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(50).optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        position: z.number().int().min(0).optional(),
        isDefault: z.boolean().optional(),
        isAdmin: z.boolean().optional(),
        permissions: rolePermissionsSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const role = await ctx.db.query.roles.findFirst({
        where: and(eq(roles.id, id), eq(roles.tenantId, ctx.tenant.id)),
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Check name uniqueness if changing name
      if (data.name && data.name !== role.name) {
        const existing = await ctx.db.query.roles.findFirst({
          where: and(
            eq(roles.tenantId, ctx.tenant.id),
            eq(roles.name, data.name)
          ),
        })

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A role with this name already exists',
          })
        }
      }

      // Handle position change
      if (data.position !== undefined && data.position !== role.position) {
        const oldPosition = role.position
        const newPosition = data.position

        if (newPosition < oldPosition) {
          // Moving up - shift roles in between down
          await ctx.db
            .update(roles)
            .set({
              position: sql`${roles.position} + 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(roles.tenantId, ctx.tenant.id),
                gt(roles.position, newPosition - 1),
                lt(roles.position, oldPosition)
              )
            )
        } else {
          // Moving down - shift roles in between up
          await ctx.db
            .update(roles)
            .set({
              position: sql`${roles.position} - 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(roles.tenantId, ctx.tenant.id),
                gt(roles.position, oldPosition),
                lt(roles.position, newPosition + 1)
              )
            )
        }
      }

      // If setting as default, unset other defaults
      if (data.isDefault === true) {
        await ctx.db
          .update(roles)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(eq(roles.tenantId, ctx.tenant.id), eq(roles.isDefault, true))
          )
      }

      const [updated] = await ctx.db
        .update(roles)
        .set({
          ...(data.name !== undefined && { name: data.name }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.position !== undefined && { position: data.position }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          ...(data.isAdmin !== undefined && { isAdmin: data.isAdmin }),
          ...(data.permissions !== undefined && {
            permissions: data.permissions,
          }),
          updatedAt: new Date(),
        })
        .where(eq(roles.id, id))
        .returning()

      return updated
    }),

  // Delete a role
  delete: officerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.query.roles.findFirst({
        where: and(eq(roles.id, input.id), eq(roles.tenantId, ctx.tenant.id)),
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Check if any members have this role
      const memberCountResult = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(memberRoles)
        .where(eq(memberRoles.roleId, role.id))

      const memberCount = memberCountResult[0]?.count ?? 0

      if (memberCount > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete role with ${memberCount} member(s) assigned. Remove the role from all members first.`,
        })
      }

      // Delete the role
      await ctx.db.delete(roles).where(eq(roles.id, input.id))

      // Reorder remaining roles to close the gap
      await ctx.db
        .update(roles)
        .set({
          position: sql`${roles.position} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(roles.tenantId, ctx.tenant.id),
            gt(roles.position, role.position)
          )
        )

      return { success: true }
    }),

  // Assign a role to a member
  assignToMember: officerProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        memberId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify role exists and belongs to tenant
      const role = await ctx.db.query.roles.findFirst({
        where: and(
          eq(roles.id, input.roleId),
          eq(roles.tenantId, ctx.tenant.id)
        ),
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Verify member exists and belongs to tenant
      const member = await ctx.db.query.members.findFirst({
        where: and(
          eq(members.id, input.memberId),
          eq(members.tenantId, ctx.tenant.id)
        ),
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      // Check if assignment already exists
      const existing = await ctx.db.query.memberRoles.findFirst({
        where: and(
          eq(memberRoles.memberId, input.memberId),
          eq(memberRoles.roleId, input.roleId)
        ),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Member already has this role',
        })
      }

      const [assignment] = await ctx.db
        .insert(memberRoles)
        .values({
          memberId: input.memberId,
          roleId: input.roleId,
          assignedBy: ctx.member.id,
        })
        .returning()

      return assignment
    }),

  // Remove a role from a member
  removeFromMember: officerProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        memberId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the assignment exists
      const assignment = await ctx.db.query.memberRoles.findFirst({
        where: and(
          eq(memberRoles.memberId, input.memberId),
          eq(memberRoles.roleId, input.roleId)
        ),
        with: {
          role: true,
        },
      })

      if (!assignment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member does not have this role',
        })
      }

      // Verify role belongs to tenant
      if (assignment.role.tenantId !== ctx.tenant.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Role does not belong to this guild',
        })
      }

      await ctx.db
        .delete(memberRoles)
        .where(
          and(
            eq(memberRoles.memberId, input.memberId),
            eq(memberRoles.roleId, input.roleId)
          )
        )

      return { success: true }
    }),

  // Seed default roles for a new guild
  // Note: Only seeds roles for the caller's current tenant (no cross-tenant seeding)
  seedDefaults: officerProcedure.mutation(async ({ ctx }) => {
    const targetTenantId = ctx.tenant.id

    // Check if roles already exist for this tenant
    const existingRoles = await ctx.db.query.roles.findFirst({
      where: eq(roles.tenantId, targetTenantId),
    })

    if (existingRoles) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Roles already exist for this guild',
      })
    }

    // Insert default roles
    const createdRoles = await ctx.db
      .insert(roles)
      .values(
        DEFAULT_ROLES.map(role => ({
          tenantId: targetTenantId,
          name: role.name,
          color: role.color,
          position: role.position,
          isDefault: role.isDefault,
          isAdmin: role.isAdmin,
          permissions: role.permissions,
        }))
      )
      .returning()

    return createdRoles
  }),
})
