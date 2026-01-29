'use client'

import { motion } from 'framer-motion'
import { Badge } from '~/components/ui/badge'
import { Users, Shield, Heart, Swords } from 'lucide-react'

// Status badge configuration
const STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    variant: 'mint' as const,
  },
  tentative: {
    label: 'Tentative',
    variant: 'peach' as const,
  },
  declined: {
    label: 'Declined',
    variant: 'destructive' as const,
  },
  standby: {
    label: 'Standby',
    variant: 'secondary' as const,
  },
}

// Role icon configuration
const ROLE_CONFIG = {
  tank: {
    label: 'Tanks',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  healer: {
    label: 'Healers',
    icon: Heart,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  dps: {
    label: 'DPS',
    icon: Swords,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  unknown: {
    label: 'Other',
    icon: Users,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
}

// WoW class color mapping
const CLASS_COLORS: Record<string, string> = {
  warrior: 'text-[#C69B6D]',
  paladin: 'text-[#F48CBA]',
  hunter: 'text-[#AAD372]',
  rogue: 'text-[#FFF468]',
  priest: 'text-[#FFFFFF]',
  shaman: 'text-[#0070DD]',
  mage: 'text-[#3FC7EB]',
  warlock: 'text-[#8788EE]',
  druid: 'text-[#FF7C0A]',
  death_knight: 'text-[#C41E3A]',
}

interface Signup {
  id: string
  status: 'confirmed' | 'tentative' | 'declined' | 'standby'
  role: string | null
  notes: string | null
  character: {
    id: string
    name: string
    class: string | null
    level: number | null
    member: {
      id: string
      user: {
        id: string
        name: string | null
      }
    } | null
  }
}

interface SignupRosterProps {
  signups: Signup[]
  requiredRoles?: {
    tanks?: number
    healers?: number
    dps?: number
  }
  maxSize?: number | null
}

export function SignupRoster({
  signups,
  requiredRoles,
  maxSize,
}: SignupRosterProps) {
  // Group signups by role
  const signupsByRole = {
    tank: signups.filter(s => s.role === 'tank'),
    healer: signups.filter(s => s.role === 'healer'),
    dps: signups.filter(s => s.role === 'dps'),
    unknown: signups.filter(
      s => !s.role || !['tank', 'healer', 'dps'].includes(s.role)
    ),
  }

  // Calculate confirmed counts for each role
  const confirmedCounts = {
    tank: signupsByRole.tank.filter(s => s.status === 'confirmed').length,
    healer: signupsByRole.healer.filter(s => s.status === 'confirmed').length,
    dps: signupsByRole.dps.filter(s => s.status === 'confirmed').length,
  }

  const totalConfirmed = Object.values(confirmedCounts).reduce(
    (a, b) => a + b,
    0
  )
  const totalTentative = signups.filter(s => s.status === 'tentative').length

  return (
    <div className="space-y-6">
      {/* Header with total counts */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Signups</h3>
            <p className="text-slate-400 text-sm">
              {totalConfirmed} confirmed
              {totalTentative > 0 && (
                <span className="text-yellow-500/80">
                  {' '}
                  (+{totalTentative} tentative)
                </span>
              )}
              {maxSize && <span> / {maxSize} max</span>}
            </p>
          </div>

          {/* Overall progress bar */}
          {maxSize && (
            <div className="w-48">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total</span>
                <span>
                  {totalConfirmed} / {maxSize}
                </span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((totalConfirmed / maxSize) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${
                    totalConfirmed >= maxSize
                      ? 'bg-green-500'
                      : totalConfirmed >= maxSize * 0.8
                        ? 'bg-yellow-500'
                        : 'bg-purple-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Role requirements progress */}
        {requiredRoles &&
          Object.values(requiredRoles).some(v => v && v > 0) && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/50">
              {(['tank', 'healer', 'dps'] as const).map(role => {
                const required =
                  requiredRoles[
                    role === 'tank'
                      ? 'tanks'
                      : role === 'healer'
                        ? 'healers'
                        : 'dps'
                  ]
                if (!required) return null

                const confirmed = confirmedCounts[role]
                const percentage = Math.min((confirmed / required) * 100, 100)
                const config = ROLE_CONFIG[role]

                return (
                  <div key={role}>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <config.icon className={`h-3 w-3 ${config.color}`} />
                        {config.label}
                      </span>
                      <span>
                        {confirmed} / {required}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 0.5,
                          ease: 'easeOut',
                          delay: 0.1,
                        }}
                        className={`h-full ${
                          confirmed >= required
                            ? 'bg-green-500'
                            : confirmed >= required * 0.8
                              ? 'bg-yellow-500'
                              : config.color.replace('text-', 'bg-')
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>

      {/* Role sections */}
      {(['tank', 'healer', 'dps', 'unknown'] as const).map(role => {
        const roleSignups = signupsByRole[role]
        if (roleSignups.length === 0) return null

        const config = ROLE_CONFIG[role]
        const Icon = config.icon

        return (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden`}
          >
            {/* Role header */}
            <div
              className={`px-4 py-3 border-b ${config.borderColor} bg-slate-900/30`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <h4 className="text-white font-semibold">{config.label}</h4>
                <Badge variant="secondary" size="sm">
                  {roleSignups.length}
                </Badge>
              </div>
            </div>

            {/* Signup list */}
            <div className="divide-y divide-slate-700/30">
              {roleSignups.map(signup => {
                const statusConfig = STATUS_CONFIG[signup.status]
                const classColor = signup.character.class
                  ? CLASS_COLORS[signup.character.class] || 'text-slate-300'
                  : 'text-slate-300'

                return (
                  <motion.div
                    key={signup.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-3 hover:bg-slate-900/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${classColor}`}>
                              {signup.character.name}
                            </span>
                            {signup.character.level && (
                              <span className="text-xs text-slate-500">
                                Lv {signup.character.level}
                              </span>
                            )}
                          </div>
                          {signup.character.class && (
                            <p className="text-xs text-slate-500 capitalize">
                              {signup.character.class.replace('_', ' ')}
                            </p>
                          )}
                          {signup.notes && (
                            <p className="text-xs text-slate-400 mt-1 italic">
                              {signup.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <Badge variant={statusConfig.variant} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )
      })}

      {/* Empty state */}
      {signups.length === 0 && (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No Signups Yet
          </h3>
          <p className="text-slate-500">
            Be the first to sign up for this event
          </p>
        </div>
      )}
    </div>
  )
}
