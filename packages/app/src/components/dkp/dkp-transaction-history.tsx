'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  ShoppingBag,
  Users,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { trpc } from '~/lib/trpc/client'

const ITEMS_PER_PAGE = 20

// Transaction type configurations
const TRANSACTION_TYPES = {
  raid_attendance: {
    label: 'Raid Attendance',
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-600',
  },
  boss_kill: {
    label: 'Boss Kill',
    icon: Award,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-600',
  },
  loot_purchase: {
    label: 'Loot Purchase',
    icon: ShoppingBag,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-600',
  },
  adjustment: {
    label: 'Manual Adjustment',
    icon: TrendingUp,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-600',
  },
  decay: {
    label: 'Decay',
    icon: TrendingDown,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-600',
  },
  bonus: {
    label: 'Bonus',
    icon: Award,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-600',
  },
} as const

type TransactionType = keyof typeof TRANSACTION_TYPES

interface Transaction {
  id: string
  amount: number
  type: TransactionType
  reason?: string | null
  createdAt: Date
  event?: { name: string } | null
}

interface DkpTransactionHistoryProps {
  memberId: string
  memberName?: string
}

export function DkpTransactionHistory({
  memberId,
  memberName,
}: DkpTransactionHistoryProps) {
  const [page, setPage] = useState(0)
  const [typeFilter, setTypeFilter] = useState<TransactionType | null>(null)
  const offset = page * ITEMS_PER_PAGE

  const {
    data: rawTransactions,
    isLoading,
    error,
  } = trpc.dkp.getTransactions.useQuery({
    memberId,
    type: typeFilter ?? undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  })

  const transactions: Transaction[] =
    rawTransactions?.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type as TransactionType,
      reason: tx.reason,
      createdAt: tx.createdAt,
      event: tx.event,
    })) ?? []

  const totalPages = 1 // API doesn't return total, only shows one page for now

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
        <div className="text-red-400 mb-4">Error loading transactions</div>
        <p className="text-slate-500 text-sm">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 animate-pulse"
          >
            <div className="h-5 bg-slate-700 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  const clearFilter = () => {
    setTypeFilter(null)
    setPage(0)
  }

  const applyFilter = (type: TransactionType) => {
    setTypeFilter(type === typeFilter ? null : type)
    setPage(0)
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {memberName && (
          <h3 className="text-lg font-semibold text-white">
            Transaction History - {memberName}
          </h3>
        )}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div className="flex gap-2">
            {Object.entries(TRANSACTION_TYPES).map(([key, config]) => {
              const isActive = typeFilter === key
              return (
                <Badge
                  key={key}
                  variant={isActive ? 'default' : 'secondary'}
                  className="cursor-pointer flex-shrink-0"
                  onClick={() => applyFilter(key as TransactionType)}
                >
                  <config.icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              )
            })}
          </div>
          {typeFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="text-xs flex-shrink-0"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Transactions list */}
      {transactions.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No Transactions Found
          </h3>
          <p className="text-slate-500">
            {typeFilter
              ? 'No transactions of this type yet.'
              : 'No transaction history available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {transactions.map((transaction: Transaction, index: number) => {
              const config =
                TRANSACTION_TYPES[transaction.type] ||
                TRANSACTION_TYPES.adjustment
              const Icon = config.icon
              const isPositive = transaction.amount >= 0

              const date = new Date(transaction.createdAt)
              const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year:
                  date.getFullYear() !== new Date().getFullYear()
                    ? 'numeric'
                    : undefined,
              })
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })

              return (
                <motion.div
                  key={transaction.id}
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
                    relative overflow-hidden rounded-lg border p-4
                    transition-all duration-200
                    bg-slate-800/30 ${config.borderColor}
                    hover:bg-slate-800/50
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Type and info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                            p-2 rounded-lg ${config.bgColor} ${config.borderColor} border
                            flex-shrink-0
                          `}
                        >
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Type label */}
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`text-sm font-semibold ${config.color}`}
                            >
                              {config.label}
                            </h4>
                            {transaction.event?.name && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-400 truncate">
                                  {transaction.event.name}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Reason */}
                          {transaction.reason && (
                            <p className="text-sm text-slate-300 mb-1">
                              {transaction.reason}
                            </p>
                          )}

                          {/* Date */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {dateStr} at {timeStr}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Amount */}
                    <div className="flex-shrink-0 text-right">
                      <div
                        className={`
                        flex items-center gap-1 text-lg font-bold
                        ${isPositive ? 'text-green-400' : 'text-red-400'}
                      `}
                      >
                        {isPositive ? (
                          <Plus className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                        {Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-slate-400">
            Showing {transactions.length} transaction
            {transactions.length !== 1 ? 's' : ''}
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
