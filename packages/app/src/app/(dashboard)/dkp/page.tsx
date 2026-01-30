'use client'

import { useState } from 'react'
import { DkpLeaderboard } from '~/components/dkp'
import { DkpTransactionHistory } from '~/components/dkp'
import { DkpBalanceCard } from '~/components/dkp'
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { trpc } from '~/lib/trpc/client'

export default function DkpPage() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const { data: memberBalance } = trpc.dkp.getBalance.useQuery(
    { memberId: selectedMemberId ?? '' },
    { enabled: !!selectedMemberId }
  )

  const handleBack = () => {
    setSelectedMemberId(null)
  }

  if (selectedMemberId) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leaderboard
          </Button>
        </div>

        {memberBalance && (
          <DkpBalanceCard
            currentBalance={memberBalance.currentBalance}
            lifetimeEarned={memberBalance.lifetimeEarned}
            lifetimeSpent={memberBalance.lifetimeSpent}
          />
        )}

        <DkpTransactionHistory memberId={selectedMemberId} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">DKP Leaderboard</h1>
          <p className="text-slate-400 mt-1">
            Track member standings and DKP balances
          </p>
        </div>
      </div>

      <DkpLeaderboard onMemberClick={setSelectedMemberId} />
    </div>
  )
}
