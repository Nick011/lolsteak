import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, members } from './tenants'

/**
 * Custom roles that guild admins can create and configure.
 * Each tenant has their own set of roles with customizable permissions.
 */
export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    color: varchar('color', { length: 7 }).default('#6B7280'), // Hex color
    position: integer('position').notNull().default(0), // Lower = higher priority
    isDefault: boolean('is_default').default(false), // Auto-assigned to new members
    isAdmin: boolean('is_admin').default(false), // Has all permissions
    permissions: jsonb('permissions').default({}).$type<RolePermissions>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [uniqueIndex('roles_tenant_name_idx').on(table.tenantId, table.name)]
)

/**
 * Join table for member-role assignments.
 * Members can have multiple roles.
 */
export const memberRoles = pgTable(
  'member_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    assignedBy: uuid('assigned_by').references(() => members.id, {
      onDelete: 'set null',
    }),
  },
  table => [
    uniqueIndex('member_roles_unique_idx').on(table.memberId, table.roleId),
  ]
)

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
  memberRoles: many(memberRoles),
}))

export const memberRolesRelations = relations(memberRoles, ({ one }) => ({
  member: one(members, {
    fields: [memberRoles.memberId],
    references: [members.id],
  }),
  role: one(roles, {
    fields: [memberRoles.roleId],
    references: [roles.id],
  }),
  assignedByMember: one(members, {
    fields: [memberRoles.assignedBy],
    references: [members.id],
  }),
}))

/**
 * Granular permissions for roles.
 * Each permission controls access to specific features.
 */
export interface RolePermissions {
  // Member management
  members?: {
    view?: boolean
    invite?: boolean
    kick?: boolean
    editNicknames?: boolean
    assignRoles?: boolean
  }
  // Role management
  roles?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    assign?: boolean
  }
  // Event management
  events?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    manageSignups?: boolean
  }
  // Loot management
  loot?: {
    view?: boolean
    record?: boolean
    edit?: boolean
    delete?: boolean
    import?: boolean
  }
  // Communication
  announcements?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    pin?: boolean
  }
  // Guild settings
  settings?: {
    view?: boolean
    edit?: boolean
    manageIntegrations?: boolean
  }
}

/**
 * Default roles created for new guilds.
 */
export const DEFAULT_ROLES: Array<{
  name: string
  color: string
  position: number
  isDefault: boolean
  isAdmin: boolean
  permissions: RolePermissions
}> = [
  {
    name: 'Guild Master',
    color: '#F59E0B', // Amber
    position: 0,
    isDefault: false,
    isAdmin: true,
    permissions: {}, // Admin has all permissions
  },
  {
    name: 'Officer',
    color: '#8B5CF6', // Purple
    position: 1,
    isDefault: false,
    isAdmin: false,
    permissions: {
      members: {
        view: true,
        invite: true,
        kick: true,
        editNicknames: true,
        assignRoles: true,
      },
      roles: { view: true, assign: true },
      events: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        manageSignups: true,
      },
      loot: { view: true, record: true, edit: true, import: true },
      announcements: { view: true, create: true, edit: true, pin: true },
      settings: { view: true },
    },
  },
  {
    name: 'Raider',
    color: '#10B981', // Emerald
    position: 2,
    isDefault: false,
    isAdmin: false,
    permissions: {
      members: { view: true },
      events: { view: true },
      loot: { view: true },
      announcements: { view: true },
    },
  },
  {
    name: 'Member',
    color: '#6B7280', // Gray
    position: 3,
    isDefault: true,
    isAdmin: false,
    permissions: {
      members: { view: true },
      events: { view: true },
      loot: { view: true },
      announcements: { view: true },
    },
  },
]
