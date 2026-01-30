'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { trpc } from '~/lib/trpc/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

const ITEMS_PER_PAGE = 25

// Rank badge styling for top 3
const RANK_STYLES = {
  1: {
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    text: 'text-yellow-900',
    icon: 'text-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(250,204,21,0.4)]',
  },
  2: {
    bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
    text: 'text-slate-900',
    icon: 'text-slate-400',
    glow: 'shadow-[0_0_20px_rgba(203,213,225,0.4)]',
  },
  3: {
    bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    text: 'text-orange-900',
    icon: 'text-orange-400',
    glow: 'shadow-[0_0_20px_rgba(251,146,60,0.4)]',
  },
}

interface Member {
  id: string
  name: string
  mainCharacterName?: string | null
  currentBalance: number
  lifetimeEarned: number
  lifetimeSpent: number
}

interface DkpLeaderboardProps {
  onMemberClick?: (memberId: string) => void
}

export function DkpLeaderboard({ onMemberClick }: DkpLeaderboardProps) {
  const [page, setPage] = useState(0)
  const offset = page * ITEMS_PER_PAGE

  const {
    data: balances,
    isLoading,
    error,
  } = trpc.dkp.leaderboard.useQuery({
    limit: ITEMS_PER_PAGE,
    offset,
  })

  const members: Member[] =
    balances?.map(balance => ({
      id: balance.member.id,
      name: balance.member.nickname || balance.member.user?.name || 'Unknown',
      mainCharacterName: null, // TODO: Add main character support
      currentBalance: balance.currentBalance,
      lifetimeEarned: balance.lifetimeEarned,
      lifetimeSpent: balance.lifetimeSpent,
    })) ?? []

  const totalPages = 1 // API doesn't return total, only shows one page for now

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
        <div className="text-red-400 mb-4">Error loading leaderboard</div>
        <p className="text-slate-500 text-sm">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 animate-pulse"
          >
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
        <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-400 mb-2">
          No Members Found
        </h3>
        <p className="text-slate-500">No DKP data available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              <TableHead className="text-slate-400 w-20">Rank</TableHead>
              <TableHead className="text-slate-400">Member</TableHead>
              <TableHead className="text-slate-400 text-right">
                Current Balance
              </TableHead>
              <TableHead className="text-slate-400 text-right">
                Lifetime Earned
              </TableHead>
              <TableHead className="text-slate-400 text-right">
                Lifetime Spent
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {members.map((member: Member, index: number) => {
                const rank = offset + index + 1
                const rankStyle =
                  rank <= 3 ? RANK_STYLES[rank as 1 | 2 | 3] : null
                const isTop3 = rank <= 3

                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: index * 0.03,
                        duration: 0.2,
                      },
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`
                      border-slate-700 transition-all duration-200
                      ${
                        isTop3
                          ? 'bg-slate-800/40 hover:bg-slate-800/60'
                          : 'hover:bg-slate-800/30'
                      }
                      ${onMemberClick ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onMemberClick?.(member.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isTop3 && rankStyle ? (
                          <div
                            className={`
                              flex items-center justify-center
                              w-8 h-8 rounded-full
                              ${rankStyle.bg} ${rankStyle.text}
                              font-bold text-sm ${rankStyle.glow}
                            `}
                          >
                            {rank}
                          </div>
                        ) : (
                          <span className="text-slate-400 ml-2">{rank}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isTop3 && (
                          <Trophy className={`h-4 w-4 ${rankStyle?.icon}`} />
                        )}
                        <div>
                          <div className="text-slate-200 font-medium">
                            {member.mainCharacterName || member.name}
                          </div>
                          {member.mainCharacterName && (
                            <div className="text-xs text-slate-500">
                              {member.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          member.currentBalance >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {member.currentBalance.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {member.lifetimeEarned.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {member.lifetimeSpent.toLocaleString()}
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        <AnimatePresence mode="popLayout">
          {members.map((member: Member, index: number) => {
            const rank = offset + index + 1
            const rankStyle = rank <= 3 ? RANK_STYLES[rank as 1 | 2 | 3] : null
            const isTop3 = rank <= 3

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: index * 0.03,
                    duration: 0.2,
                  },
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`
                  rounded-lg border p-4 transition-all duration-200
                  ${
                    isTop3
                      ? 'bg-slate-800/40 border-slate-600'
                      : 'bg-slate-800/30 border-slate-700'
                  }
                  ${onMemberClick ? 'cursor-pointer hover:bg-slate-800/60' : ''}
                `}
                onClick={() => onMemberClick?.(member.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isTop3 && rankStyle ? (
                      <div
                        className={`
                          flex items-center justify-center
                          w-10 h-10 rounded-full
                          ${rankStyle.bg} ${rankStyle.text}
                          font-bold ${rankStyle.glow}
                        `}
                      >
                        {rank}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 font-semibold">
                          {rank}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-slate-200 font-medium flex items-center gap-2">
                        {isTop3 && (
                          <Trophy className={`h-4 w-4 ${rankStyle?.icon}`} />
                        )}
                        {member.mainCharacterName || member.name}
                      </div>
                      {member.mainCharacterName && (
                        <div className="text-xs text-slate-500">
                          {member.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Balance</div>
                    <div
                      className={`font-semibold ${
                        member.currentBalance >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {member.currentBalance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Earned</div>
                    <div className="text-slate-300">
                      {member.lifetimeEarned.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Spent</div>
                    <div className="text-slate-300">
                      {member.lifetimeSpent.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-slate-400">
            Showing {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
