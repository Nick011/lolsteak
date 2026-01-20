'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { PermissionMatrix, type RolePermissions } from './permission-matrix'
import { Separator } from '~/components/ui/separator'

export interface Role {
  id: string
  name: string
  color: string
  position: number
  isDefault: boolean
  isAdmin: boolean
  permissions: RolePermissions
  memberCount?: number
}

interface RoleEditorProps {
  role?: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (role: Partial<Role>) => Promise<void> | void
  onDelete?: (roleId: string) => Promise<void> | void
}

const PRESET_COLORS = [
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Green', value: '#10B981' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Rose', value: '#F43F5E' },
]

export function RoleEditor({
  role,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: RoleEditorProps) {
  const [name, setName] = useState(role?.name ?? '')
  const [color, setColor] = useState(role?.color ?? '#6B7280')
  const [customColor, setCustomColor] = useState('')
  const [isAdmin, setIsAdmin] = useState(role?.isAdmin ?? false)
  const [permissions, setPermissions] = useState<RolePermissions>(
    role?.permissions ?? {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditing = !!role

  const handleSave = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    try {
      const roleData: Partial<Role> = {
        name: name.trim(),
        color: customColor || color,
        isAdmin,
        permissions: isAdmin ? {} : permissions,
      }

      if (isEditing && role) {
        roleData.id = role.id
      }

      await onSave(roleData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save role:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!role || !onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(role.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete role:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor)
    setCustomColor('')
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomColor(value)
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setColor(value)
    }
  }

  const canDelete = role && !role.isDefault && (role.memberCount ?? 0) === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            {isEditing ? 'Edit Role' : 'Create Role'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditing
              ? 'Update the role settings and permissions'
              : 'Create a new role with custom permissions for your guild members'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="role-name" className="text-slate-200">
              Role Name
            </Label>
            <Input
              id="role-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Raid Leader"
              maxLength={50}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400
                       focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="text-slate-200">Role Color</Label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {PRESET_COLORS.map(presetColor => (
                <button
                  key={presetColor.value}
                  type="button"
                  onClick={() => handleColorSelect(presetColor.value)}
                  className={`h-10 w-full rounded-md transition-all hover:scale-110
                           ${
                             color === presetColor.value && !customColor
                               ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                               : ''
                           }`}
                  style={{ backgroundColor: presetColor.value }}
                  title={presetColor.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-color" className="text-slate-400 text-sm">
                Custom:
              </Label>
              <Input
                id="custom-color"
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#6B7280"
                maxLength={7}
                className="w-32 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400
                         focus:border-purple-500 focus:ring-purple-500"
              />
              <div
                className="h-10 w-10 rounded-md border-2 border-slate-600 flex-shrink-0"
                style={{ backgroundColor: customColor || color }}
              />
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Admin Toggle */}
          <div className="space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={e => setIsAdmin(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-purple-600
                         focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  Administrator
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Members with this role have all permissions automatically.
                  This bypasses all permission settings below.
                </div>
              </div>
            </label>
          </div>

          {/* Permissions Matrix */}
          {!isAdmin && (
            <>
              <Separator className="bg-slate-700" />
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold text-slate-200">
                    Permissions
                  </Label>
                  <p className="text-sm text-slate-400 mt-1">
                    Configure what members with this role can access and manage
                  </p>
                </div>
                <PermissionMatrix
                  permissions={permissions}
                  onChange={setPermissions}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {canDelete && onDelete && (
              <>
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSaving || isDeleting}
                  >
                    Delete Role
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      Are you sure?
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      isLoading={isDeleting}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || isSaving || isDeleting}
            isLoading={isSaving}
          >
            {isEditing ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
