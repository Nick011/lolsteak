'use client'

import { motion } from 'framer-motion'
import { Edit, Trash2, Crown } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  formatClassName,
  getClassColor,
  getRoleColor,
  getRoleIcon,
} from '~/lib/wow-constants'

interface Character {
  id: string
  name: string
  realm?: string | null
  class?: string | null
  spec?: string | null
  role?: string | null
  level?: number | null
  isMain?: string | boolean
  memberId?: string | null
}

interface CharacterCardProps {
  character: Character
  currentMemberId?: string
  canEdit?: boolean
  canDelete?: boolean
  onEdit?: (character: Character) => void
  onDelete?: (characterId: string) => void
}

export function CharacterCard({
  character,
  currentMemberId,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  const isOwner = character.memberId === currentMemberId
  const showActions = (canEdit && isOwner) || canDelete

  // Convert isMain to boolean (handles both string and boolean)
  const isMainCharacter =
    character.isMain === true || character.isMain === 'true'

  const RoleIcon = character.role ? getRoleIcon(character.role) : null
  const classColor = getClassColor(character.class || null)
  const roleColor = getRoleColor(character.role || null)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-slate-600 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Character Info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name and Main Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-lg truncate">
              {character.name}
            </h3>
            {isMainCharacter && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Badge
                  variant="outline"
                  className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 gap-1"
                >
                  <Crown className="h-3 w-3" />
                  Main
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Realm */}
          {character.realm && (
            <p className="text-slate-400 text-sm">{character.realm}</p>
          )}

          {/* Class, Role, and Level Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Class Badge */}
            {character.class && (
              <Badge className={`${classColor} font-medium`}>
                {formatClassName(character.class)}
              </Badge>
            )}

            {/* Spec */}
            {character.spec && (
              <span className="text-slate-300 text-sm font-medium">
                {character.spec}
              </span>
            )}

            {/* Role Badge */}
            {character.role && RoleIcon && (
              <Badge
                variant="outline"
                className={`${roleColor} border gap-1.5`}
              >
                <RoleIcon className="h-3 w-3" />
                {character.role.toUpperCase()}
              </Badge>
            )}

            {/* Level */}
            {character.level && (
              <Badge
                variant="outline"
                className="bg-slate-700/50 text-slate-300 border-slate-600"
              >
                Lv. {character.level}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Edit className="h-4 w-4" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-800 border-slate-700"
            >
              {canEdit && isOwner && (
                <DropdownMenuItem
                  onClick={() => onEdit?.(character)}
                  className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Character
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  {canEdit && isOwner && (
                    <DropdownMenuSeparator className="bg-slate-700" />
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete?.(character.id)}
                    className="text-red-400 focus:bg-red-950 focus:text-red-300 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Character
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
  )
}
