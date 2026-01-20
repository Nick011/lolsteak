'use client'

import { useState } from 'react'
import { Edit, Shield, UserX, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface MemberActionsProps {
  memberId: string
  memberName: string
  currentNickname?: string
  currentRank: string
  onNicknameUpdate?: (nickname: string) => void
  onPromote?: () => void
  onDemote?: () => void
  onKick?: () => void
}

export function MemberActions({
  memberId,
  memberName,
  currentNickname,
  currentRank,
  onNicknameUpdate,
  onPromote,
  onDemote,
  onKick,
}: MemberActionsProps) {
  const [nickname, setNickname] = useState(currentNickname || '')
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false)
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false)

  const handleNicknameSubmit = () => {
    onNicknameUpdate?.(nickname)
    setIsNicknameDialogOpen(false)
  }

  const handleKickConfirm = () => {
    onKick?.()
    setIsKickDialogOpen(false)
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-lg text-white">Officer Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Edit Nickname */}
        <Dialog
          open={isNicknameDialogOpen}
          onOpenChange={setIsNicknameDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="h-4 w-4" />
              Edit Nickname
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-700 bg-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Nickname</DialogTitle>
              <DialogDescription className="text-slate-400">
                Set a custom nickname for {memberName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-slate-300">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Enter nickname"
                  className="border-slate-600 bg-slate-900 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNicknameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleNicknameSubmit}>Save Nickname</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Roles */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            // TODO: Implement role management dialog
            console.log('Manage roles for', memberId)
          }}
        >
          <Shield className="h-4 w-4" />
          Manage Roles
        </Button>

        <div className="border-t border-slate-700 pt-3" />

        {/* Promote */}
        <Button
          variant="outline"
          className="w-full justify-start text-green-400 hover:text-green-300"
          onClick={onPromote}
        >
          <ChevronUp className="h-4 w-4" />
          Promote
        </Button>

        {/* Demote */}
        <Button
          variant="outline"
          className="w-full justify-start text-yellow-400 hover:text-yellow-300"
          onClick={onDemote}
        >
          <ChevronDown className="h-4 w-4" />
          Demote
        </Button>

        <div className="border-t border-slate-700 pt-3" />

        {/* Kick Member */}
        <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full justify-start">
              <UserX className="h-4 w-4" />
              Kick Member
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-700 bg-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Kick Member</DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to kick {memberName} from the guild? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsKickDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleKickConfirm}>
                Kick Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
