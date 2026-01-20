'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { MoreVertical, UserCog, UserX, Crown, Shield } from 'lucide-react'

// WoW class colors (matching Blizzard's official palette)
const CLASS_COLORS: Record<string, string> = {
  warrior: 'bg-amber-700 text-amber-100',
  paladin: 'bg-pink-500 text-pink-100',
  hunter: 'bg-green-600 text-green-100',
  rogue: 'bg-yellow-500 text-yellow-950',
  priest: 'bg-slate-200 text-slate-950',
  shaman: 'bg-blue-600 text-blue-100',
  mage: 'bg-cyan-400 text-cyan-950',
  warlock: 'bg-purple-600 text-purple-100',
  druid: 'bg-orange-600 text-orange-100',
  death_knight: 'bg-red-700 text-red-100',
}

// Role colors
const ROLE_COLORS: Record<string, string> = {
  tank: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  healer: 'bg-green-500/20 text-green-400 border-green-500/30',
  dps: 'bg-red-500/20 text-red-400 border-red-500/30',
}

// Member role badge colors
const MEMBER_ROLE_COLORS: Record<string, string> = {
  owner: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  officer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  member: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

interface Character {
  id: string
  name: string
  class: string | null
  role: string | null
  level?: number | null
}

interface Role {
  id: string
  name: string
  color: string | null
}

interface MemberCardProps {
  member: {
    id: string
    userId: string
    nickname: string | null
    role: string
    joinedAt: Date
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
    roles: Role[]
    characters?: Character[]
    mainCharacter?: Character
    // Allow additional fields from API response
    [key: string]: unknown
  }
  isOfficer: boolean
  onEdit?: (memberId: string) => void
  onKick?: (memberId: string) => void
}

export function MemberCard({
  member,
  isOfficer,
  onEdit,
  onKick,
}: MemberCardProps) {
  const displayName = member.nickname || member.user.name || 'Unknown'
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const mainChar = member.mainCharacter
  const classColor = mainChar?.class
    ? CLASS_COLORS[mainChar.class]
    : 'bg-slate-700 text-slate-300'
  const roleColor = mainChar?.role
    ? ROLE_COLORS[mainChar.role]
    : 'bg-slate-700 text-slate-300'

  const joinDate = new Date(member.joinedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const showActions = isOfficer && member.role !== 'owner'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12 ring-2 ring-slate-700">
          <AvatarImage src={member.user.image || undefined} alt={displayName} />
          <AvatarFallback className="bg-slate-700 text-slate-200 font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold truncate">
                  {displayName}
                </h3>
                {member.role === 'owner' && (
                  <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                )}
                {member.role === 'officer' && (
                  <Shield className="h-4 w-4 text-purple-400 flex-shrink-0" />
                )}
              </div>
              {member.nickname && (
                <p className="text-slate-400 text-sm truncate">
                  {member.user.name}
                </p>
              )}
            </div>

            {/* Actions dropdown */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-800 border-slate-700"
                >
                  <DropdownMenuItem
                    onClick={() => onEdit?.(member.id)}
                    className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={() => onKick?.(member.id)}
                    className="text-red-400 focus:bg-red-950 focus:text-red-300 cursor-pointer"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Kick Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Main character */}
          {mainChar ? (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${classColor}`}
              >
                {mainChar.class?.replace('_', ' ').toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${roleColor}`}
              >
                {mainChar.role?.toUpperCase()}
              </span>
              <span className="text-slate-300 text-sm font-medium">
                {mainChar.name}
              </span>
              {mainChar.level && (
                <span className="text-slate-400 text-xs">
                  Lv. {mainChar.level}
                </span>
              )}
            </div>
          ) : (
            <div className="mb-2">
              <span className="text-slate-500 text-sm italic">
                No main character set
              </span>
            </div>
          )}

          {/* Roles and join date */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Member role badge */}
            <span
              className={`px-2 py-0.5 rounded border ${MEMBER_ROLE_COLORS[member.role]}`}
            >
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </span>

            {/* Custom roles */}
            {member.roles.slice(0, 3).map(role => (
              <span
                key={role.id}
                className="px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: role.color ? `${role.color}20` : undefined,
                  borderColor: role.color ? `${role.color}40` : undefined,
                  color: role.color || undefined,
                }}
              >
                {role.name}
              </span>
            ))}
            {member.roles.length > 3 && (
              <span className="text-slate-500">
                +{member.roles.length - 3} more
              </span>
            )}

            {/* Join date */}
            <span className="text-slate-500 ml-auto">Joined {joinDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
