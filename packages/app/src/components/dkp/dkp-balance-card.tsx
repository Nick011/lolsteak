'use client'

import { TrendingUp, TrendingDown, Coins } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

interface DkpBalanceCardProps {
  currentBalance: number
  lifetimeEarned: number
  lifetimeSpent: number
  memberName?: string
  showChart?: boolean
}

export function DkpBalanceCard({
  currentBalance,
  lifetimeEarned,
  lifetimeSpent,
  memberName,
  showChart = true,
}: DkpBalanceCardProps) {
  const earnedPercentage = lifetimeEarned
    ? (lifetimeEarned / (lifetimeEarned + lifetimeSpent)) * 100
    : 0
  const netGain = lifetimeEarned - lifetimeSpent

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">DKP Balance</CardTitle>
            {memberName && (
              <CardDescription className="mt-1">{memberName}</CardDescription>
            )}
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-600">
            <Coins className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Balance - Large Display */}
        <div className="text-center py-4">
          <div className="text-sm text-slate-400 mb-2">Current Balance</div>
          <div
            className={`text-5xl font-bold ${
              currentBalance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {currentBalance >= 0 ? '+' : ''}
            {currentBalance.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Lifetime Earned */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-600">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
              </div>
              <div className="text-xs text-slate-400">Earned</div>
            </div>
            <div className="text-2xl font-semibold text-green-400">
              {lifetimeEarned.toLocaleString()}
            </div>
          </div>

          {/* Lifetime Spent */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-600">
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              </div>
              <div className="text-xs text-slate-400">Spent</div>
            </div>
            <div className="text-2xl font-semibold text-red-400">
              {lifetimeSpent.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar - Earned vs Spent Ratio */}
        {showChart && (lifetimeEarned > 0 || lifetimeSpent > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Activity Distribution</span>
              <span>
                {earnedPercentage.toFixed(0)}% earned /{' '}
                {(100 - earnedPercentage).toFixed(0)}% spent
              </span>
            </div>

            <div className="relative h-3 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                style={{ width: `${earnedPercentage}%` }}
              />
            </div>

            {/* Net Gain/Loss Badge */}
            <div className="flex items-center justify-center pt-2">
              <Badge
                variant={netGain >= 0 ? 'mint' : 'peach'}
                className="text-xs"
              >
                {netGain >= 0 ? 'Net Gain' : 'Net Loss'}:{' '}
                {Math.abs(netGain).toLocaleString()} DKP
              </Badge>
            </div>
          </div>
        )}

        {/* Empty State */}
        {lifetimeEarned === 0 && lifetimeSpent === 0 && (
          <div className="text-center py-4 text-slate-500 text-sm">
            No DKP activity yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
