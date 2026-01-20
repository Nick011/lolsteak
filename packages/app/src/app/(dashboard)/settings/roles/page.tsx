'use client'

import { useState } from 'react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import {
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  Crown,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { RoleEditor, type Role } from '~/components/settings/role-editor'
import { Separator } from '~/components/ui/separator'

// Mock data - replace with actual data fetching
const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: 'Guild Master',
    color: '#F59E0B',
    position: 0,
    isDefault: false,
    isAdmin: true,
    permissions: {},
    memberCount: 1,
  },
  {
    id: '2',
    name: 'Officer',
    color: '#8B5CF6',
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
    memberCount: 3,
  },
  {
    id: '3',
    name: 'Raider',
    color: '#10B981',
    position: 2,
    isDefault: false,
    isAdmin: false,
    permissions: {
      members: { view: true },
      events: { view: true },
      loot: { view: true },
      announcements: { view: true },
    },
    memberCount: 12,
  },
  {
    id: '4',
    name: 'Member',
    color: '#6B7280',
    position: 3,
    isDefault: true,
    isAdmin: false,
    permissions: {
      members: { view: true },
      events: { view: true },
      loot: { view: true },
      announcements: { view: true },
    },
    memberCount: 45,
  },
]

function getPermissionSummary(role: Role): string {
  if (role.isAdmin) {
    return 'All permissions'
  }

  const permissions = role.permissions
  const categories = Object.keys(permissions).length

  if (categories === 0) {
    return 'No permissions'
  }

  const permissionCount = Object.values(permissions).reduce(
    (count, category) =>
      count + Object.values(category ?? {}).filter(Boolean).length,
    0
  )

  return `${permissionCount} permission${permissionCount !== 1 ? 's' : ''} across ${categories} categor${categories !== 1 ? 'ies' : 'y'}`
}

interface RoleCardProps {
  role: Role
  onEdit: (role: Role) => void
  onMoveUp: (roleId: string) => void
  onMoveDown: (roleId: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function RoleCard({
  role,
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: RoleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-white disabled:opacity-30 cursor-grab active:cursor-grabbing"
                onClick={e => {
                  e.stopPropagation()
                }}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Up/Down Buttons */}
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-slate-400 hover:text-white disabled:opacity-20"
                onClick={() => onMoveUp(role.id)}
                disabled={!canMoveUp}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-slate-400 hover:text-white disabled:opacity-20"
                onClick={() => onMoveDown(role.id)}
                disabled={!canMoveDown}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Color Swatch */}
            <div
              className="h-12 w-12 rounded-lg border-2 border-slate-700 flex-shrink-0"
              style={{ backgroundColor: role.color }}
            />

            {/* Role Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-white text-lg">
                  {role.name}
                </CardTitle>
                {role.isAdmin && (
                  <span title="Administrator">
                    <Crown className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  </span>
                )}
                {role.isDefault && (
                  <span title="Default Role">
                    <Shield className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  </span>
                )}
              </div>
              <CardDescription className="text-slate-400 text-sm mt-1">
                {getPermissionSummary(role)}
              </CardDescription>
            </div>

            {/* Member Count */}
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {role.memberCount ?? 0}
              </span>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(role)}
              className="border-slate-600 hover:border-purple-500 hover:text-purple-400"
            >
              Edit
            </Button>

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Separator className="bg-slate-700" />
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-slate-400 font-medium mb-2">
                      Permissions
                    </div>
                    {role.isAdmin ? (
                      <div className="text-slate-300 bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-amber-400" />
                          <span>
                            This role has administrator privileges with full
                            access to all features
                          </span>
                        </div>
                      </div>
                    ) : Object.keys(role.permissions).length === 0 ? (
                      <div className="text-slate-400 italic">
                        No permissions configured
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(role.permissions).map(
                          ([category, perms]) => {
                            const permCount = Object.values(perms ?? {}).filter(
                              Boolean
                            ).length
                            if (permCount === 0) return null

                            return (
                              <div
                                key={category}
                                className="bg-slate-800/80 border border-slate-700 rounded-md p-2"
                              >
                                <div className="font-medium text-slate-200 capitalize mb-1">
                                  {category}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {Object.entries(perms ?? {})
                                    .filter(([_, value]) => value)
                                    .map(([key]) => key)
                                    .join(', ')}
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    )}
                  </div>

                  {role.isDefault && (
                    <div className="text-slate-300 bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <span>Automatically assigned to new members</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleReorder = (newOrder: Role[]) => {
    const updatedRoles = newOrder.map((role, index) => ({
      ...role,
      position: index,
    }))
    setRoles(updatedRoles)
    // TODO: Persist order to backend
  }

  const handleMoveUp = (roleId: string) => {
    const index = roles.findIndex(r => r.id === roleId)
    if (index <= 0) return

    const newRoles = [...roles]
    const temp = newRoles[index - 1]
    newRoles[index - 1] = newRoles[index]
    newRoles[index] = temp
    handleReorder(newRoles)
  }

  const handleMoveDown = (roleId: string) => {
    const index = roles.findIndex(r => r.id === roleId)
    if (index >= roles.length - 1) return

    const newRoles = [...roles]
    const temp = newRoles[index + 1]
    newRoles[index + 1] = newRoles[index]
    newRoles[index] = temp
    handleReorder(newRoles)
  }

  const handleSave = async (roleData: Partial<Role>) => {
    if (editingRole) {
      // Update existing role
      setRoles(prev =>
        prev.map(r => (r.id === editingRole.id ? { ...r, ...roleData } : r))
      )
      // TODO: API call to update role
    } else {
      // Create new role
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleData.name!,
        color: roleData.color!,
        position: roles.length,
        isDefault: false,
        isAdmin: roleData.isAdmin ?? false,
        permissions: roleData.permissions ?? {},
        memberCount: 0,
      }
      setRoles(prev => [...prev, newRole])
      // TODO: API call to create role
    }

    setEditingRole(null)
    setIsCreating(false)
  }

  const handleDelete = async (roleId: string) => {
    setRoles(prev => prev.filter(r => r.id !== roleId))
    // TODO: API call to delete role
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
  }

  const handleCreate = () => {
    setEditingRole(null)
    setIsCreating(true)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Role Management</h1>
          <Button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
        <p className="text-slate-400">
          Configure roles and permissions for your guild members. Drag roles to
          reorder them by priority.
        </p>
      </div>

      {/* Role List */}
      <div className="space-y-3">
        <Reorder.Group axis="y" values={roles} onReorder={handleReorder}>
          {roles.map((role, index) => (
            <Reorder.Item key={role.id} value={role}>
              <RoleCard
                role={role}
                onEdit={handleEdit}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                canMoveUp={index > 0}
                canMoveDown={index < roles.length - 1}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Role Editor Dialog */}
      <RoleEditor
        role={editingRole}
        open={isCreating || !!editingRole}
        onOpenChange={open => {
          if (!open) {
            setIsCreating(false)
            setEditingRole(null)
          }
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
