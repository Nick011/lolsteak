'use client'

import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'

export interface RolePermissions {
  members?: {
    view?: boolean
    invite?: boolean
    kick?: boolean
    editNicknames?: boolean
    assignRoles?: boolean
  }
  roles?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    assign?: boolean
  }
  events?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    manageSignups?: boolean
  }
  loot?: {
    view?: boolean
    record?: boolean
    edit?: boolean
    delete?: boolean
    import?: boolean
  }
  announcements?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    pin?: boolean
  }
  settings?: {
    view?: boolean
    edit?: boolean
    manageIntegrations?: boolean
  }
}

interface PermissionMatrixProps {
  permissions: RolePermissions
  onChange: (permissions: RolePermissions) => void
  disabled?: boolean
}

interface PermissionCategory {
  key: keyof RolePermissions
  label: string
  permissions: {
    key: string
    label: string
    description?: string
  }[]
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: 'members',
    label: 'Members',
    permissions: [
      {
        key: 'view',
        label: 'View',
        description: 'View member list and profiles',
      },
      {
        key: 'invite',
        label: 'Invite',
        description: 'Invite new members to the guild',
      },
      {
        key: 'kick',
        label: 'Kick',
        description: 'Remove members from the guild',
      },
      {
        key: 'editNicknames',
        label: 'Edit Nicknames',
        description: 'Change member nicknames',
      },
      {
        key: 'assignRoles',
        label: 'Assign Roles',
        description: 'Assign roles to members',
      },
    ],
  },
  {
    key: 'roles',
    label: 'Roles',
    permissions: [
      { key: 'view', label: 'View', description: 'View role list and details' },
      { key: 'create', label: 'Create', description: 'Create new roles' },
      { key: 'edit', label: 'Edit', description: 'Edit existing roles' },
      { key: 'delete', label: 'Delete', description: 'Delete roles' },
      {
        key: 'assign',
        label: 'Assign',
        description: 'Assign roles to members',
      },
    ],
  },
  {
    key: 'events',
    label: 'Events',
    permissions: [
      {
        key: 'view',
        label: 'View',
        description: 'View event calendar and details',
      },
      { key: 'create', label: 'Create', description: 'Create new events' },
      { key: 'edit', label: 'Edit', description: 'Edit existing events' },
      { key: 'delete', label: 'Delete', description: 'Delete events' },
      {
        key: 'manageSignups',
        label: 'Manage Signups',
        description: 'Manage event signups',
      },
    ],
  },
  {
    key: 'loot',
    label: 'Loot',
    permissions: [
      { key: 'view', label: 'View', description: 'View loot history' },
      { key: 'record', label: 'Record', description: 'Record new loot drops' },
      { key: 'edit', label: 'Edit', description: 'Edit loot records' },
      { key: 'delete', label: 'Delete', description: 'Delete loot records' },
      {
        key: 'import',
        label: 'Import',
        description: 'Import loot from external sources',
      },
    ],
  },
  {
    key: 'announcements',
    label: 'Announcements',
    permissions: [
      { key: 'view', label: 'View', description: 'View announcements' },
      {
        key: 'create',
        label: 'Create',
        description: 'Create new announcements',
      },
      {
        key: 'edit',
        label: 'Edit',
        description: 'Edit existing announcements',
      },
      { key: 'delete', label: 'Delete', description: 'Delete announcements' },
      { key: 'pin', label: 'Pin', description: 'Pin important announcements' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    permissions: [
      { key: 'view', label: 'View', description: 'View guild settings' },
      { key: 'edit', label: 'Edit', description: 'Edit guild settings' },
      {
        key: 'manageIntegrations',
        label: 'Manage Integrations',
        description: 'Manage third-party integrations',
      },
    ],
  },
]

export function PermissionMatrix({
  permissions,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const handlePermissionChange = (
    category: keyof RolePermissions,
    permission: string,
    checked: boolean
  ) => {
    const newPermissions = { ...permissions }
    if (!newPermissions[category]) {
      newPermissions[category] = {}
    }
    newPermissions[category] = {
      ...newPermissions[category],
      [permission]: checked,
    }
    onChange(newPermissions)
  }

  const isPermissionChecked = (
    category: keyof RolePermissions,
    permission: string
  ): boolean => {
    return (
      permissions[category]?.[
        permission as keyof (typeof permissions)[typeof category]
      ] ?? false
    )
  }

  return (
    <div className="space-y-6">
      {PERMISSION_CATEGORIES.map((category, categoryIndex) => (
        <div key={category.key}>
          {categoryIndex > 0 && <Separator className="my-6" />}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold text-slate-200">
                {category.label}
              </Label>
              <p className="text-sm text-slate-400 mt-1">
                Control what members with this role can do with{' '}
                {category.label.toLowerCase()}
              </p>
            </div>
            <div className="grid gap-3">
              {category.permissions.map(perm => (
                <label
                  key={perm.key}
                  className="flex items-start space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={isPermissionChecked(category.key, perm.key)}
                    onChange={e =>
                      handlePermissionChange(
                        category.key,
                        perm.key,
                        e.target.checked
                      )
                    }
                    disabled={disabled}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-purple-600
                             focus:ring-2 focus:ring-purple-500 focus:ring-offset-0
                             disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                      {perm.label}
                    </div>
                    {perm.description && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {perm.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
