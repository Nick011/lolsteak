'use client'

import { motion } from 'framer-motion'
import { Calendar, Mail, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { CharacterList } from '~/components/roster/character-list'
import { RoleBadges } from '~/components/roster/role-badges'
import { MemberActions } from '~/components/roster/member-actions'

interface Character {
  id: string
  name: string
  class: string
  level: number
  itemLevel?: number
  isMain: boolean
  realm?: string
}

interface Role {
  id: string
  name: string
  color: string
  permissions?: string[]
}

interface Member {
  id: string
  name: string
  nickname?: string
  avatar?: string | null
  joinedAt: Date
  rank: string
  roles: Role[]
  characters: Character[]
  stats?: {
    raidsAttended: number
    totalRaids: number
    lootReceived: number
    dkpBalance: number
  }
  notes?: string
}

interface MemberProfileClientProps {
  member: Member
  isOfficer: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

export function MemberProfileClient({
  member,
  isOfficer,
}: MemberProfileClientProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const attendancePercentage = member.stats
    ? Math.round((member.stats.raidsAttended / member.stats.totalRaids) * 100)
    : 0

  return (
    <motion.div
      className="container mx-auto p-6 space-y-6 max-w-7xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Link href="/roster">
          <Button variant="outline" size="sm">
            ← Back to Roster
          </Button>
        </Link>
      </motion.div>

      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 border-2 border-purple-500/50">
                <AvatarImage
                  src={member.avatar || undefined}
                  alt={member.name}
                />
                <AvatarFallback className="bg-slate-700 text-2xl text-white">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {member.name}
                  </h1>
                  {member.nickname && (
                    <p className="text-lg text-slate-400 italic">
                      &quot;{member.nickname}&quot;
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">{member.rank}</span>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-4 bg-slate-600"
                  />
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(member.joinedAt)}</span>
                  </div>
                </div>

                {/* Roles */}
                <RoleBadges roles={member.roles} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Characters */}
          <motion.div variants={itemVariants}>
            <CharacterList characters={member.characters} />
          </motion.div>

          {/* Stats / Activity */}
          {member.stats && (
            <motion.div variants={itemVariants}>
              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Activity & Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Raid Attendance</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-white">
                          {attendancePercentage}%
                        </p>
                        <p className="text-sm text-slate-500">
                          ({member.stats.raidsAttended}/
                          {member.stats.totalRaids})
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Loot Received</p>
                      <p className="text-2xl font-bold text-white">
                        {member.stats.lootReceived}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">DKP Balance</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {member.stats.dkpBalance}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="text-2xl font-bold text-green-400">
                        Active
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notes */}
          {member.notes && (
            <motion.div variants={itemVariants}>
              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Officer Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{member.notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Officer Actions */}
          {isOfficer && (
            <motion.div variants={itemVariants}>
              <MemberActions
                memberId={member.id}
                memberName={member.name}
                currentNickname={member.nickname}
                currentRank={member.rank}
                onNicknameUpdate={nickname => {
                  console.log('Update nickname:', nickname)
                  // TODO: Implement tRPC mutation
                }}
                onPromote={() => {
                  console.log('Promote member:', member.id)
                  // TODO: Implement tRPC mutation
                }}
                onDemote={() => {
                  console.log('Demote member:', member.id)
                  // TODO: Implement tRPC mutation
                }}
                onKick={() => {
                  console.log('Kick member:', member.id)
                  // TODO: Implement tRPC mutation
                }}
              />
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Implement message functionality
                    console.log('Send message to:', member.id)
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
