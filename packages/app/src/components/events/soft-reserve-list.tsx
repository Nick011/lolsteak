'use client'

import { trpc } from '~/lib/trpc/client'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useToast } from '~/hooks/use-toast'

interface SoftReserveListProps {
  eventId: string
  currentMemberId?: string
}

export function SoftReserveList({
  eventId,
  currentMemberId,
}: SoftReserveListProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const { data: softReserves, isLoading } = trpc.event.getSoftReserves.useQuery(
    { eventId }
  )

  const removeMutation = trpc.event.removeSoftReserve.useMutation({
    onSuccess: () => {
      toast({
        title: 'Soft reserve removed',
        description: 'Your soft reserve has been removed successfully.',
      })
      utils.event.get.invalidate({ id: eventId })
      utils.event.getSoftReserves.invalidate({ eventId })
    },
    onError: error => {
      toast({
        title: 'Failed to remove soft reserve',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  if (isLoading) {
    return (
      <div className="text-slate-400 text-center py-8">
        Loading soft reserves...
      </div>
    )
  }

  if (!softReserves || softReserves.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No items have been soft reserved yet.
      </div>
    )
  }

  // Group soft reserves by character
  const reservesByCharacter = softReserves.reduce(
    (acc, reserve) => {
      const characterId = reserve.characterId
      if (!acc[characterId]) {
        acc[characterId] = {
          character: reserve.character,
          reserves: [],
        }
      }
      acc[characterId].reserves.push(reserve)
      return acc
    },
    {} as Record<
      string,
      {
        character: (typeof softReserves)[0]['character']
        reserves: typeof softReserves
      }
    >
  )

  return (
    <div className="space-y-4">
      {Object.entries(reservesByCharacter).map(([characterId, data]) => {
        const isOwnCharacter = data.character.memberId === currentMemberId

        return (
          <Card key={characterId} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{data.character.name}</span>
                  <span className="text-sm text-slate-400 font-normal">
                    {data.character.class}
                  </span>
                </div>
                {data.character.member?.user && (
                  <span className="text-sm text-slate-400 font-normal">
                    {data.character.member.user.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.reserves.map(reserve => (
                  <li
                    key={reserve.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-200 font-medium">
                        {reserve.itemName}
                      </span>
                      <span className="text-xs text-slate-500">
                        ID: {reserve.itemId}
                      </span>
                    </div>
                    {isOwnCharacter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeMutation.mutate({ id: reserve.id })
                        }
                        disabled={removeMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                      >
                        Remove
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
