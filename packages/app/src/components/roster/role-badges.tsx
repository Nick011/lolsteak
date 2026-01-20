'use client'

import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

interface Role {
  id: string
  name: string
  color: string
  permissions?: string[]
}

interface RoleBadgesProps {
  roles: Role[]
  className?: string
}

const roleColorMap: Record<string, string> = {
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export function RoleBadges({ roles, className }: RoleBadgesProps) {
  if (!roles || roles.length === 0) {
    return (
      <div className={cn('text-sm text-slate-500', className)}>
        No roles assigned
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {roles.map(role => {
        const colorClass =
          roleColorMap[role.color.toLowerCase()] || roleColorMap.slate

        return (
          <Badge
            key={role.id}
            variant="outline"
            className={cn('border transition-all hover:scale-105', colorClass)}
          >
            {role.name}
          </Badge>
        )
      })}
    </div>
  )
}
