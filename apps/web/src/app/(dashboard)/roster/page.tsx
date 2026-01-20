'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '~/lib/trpc/client'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { MemberCard } from '~/components/roster/member-card'
import { Search, Filter, Users } from 'lucide-react'

export default function RosterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedMemberRoles, setSelectedMemberRoles] = useState<string[]>([])

  const { data: members, isLoading, error } = trpc.member.list.useQuery()
  const { data: currentMember } = trpc.member.me.useQuery()

  const isOfficer =
    currentMember?.role === 'owner' || currentMember?.role === 'officer'

  // Get unique WoW roles from members with main characters
  const availableWowRoles = useMemo(() => {
    if (!members) return []
    const roles = new Set<string>()
    members.forEach(m => {
      if (m.mainCharacter?.role) {
        roles.add(m.mainCharacter.role)
      }
    })
    return Array.from(roles)
  }, [members])

  // Filter members
  const filteredMembers = useMemo(() => {
    if (!members) return []

    return members.filter(member => {
      // Search filter
      const displayName = member.nickname || member.user.name || ''
      const mainCharName = member.mainCharacter?.name || ''
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        displayName.toLowerCase().includes(searchLower) ||
        mainCharName.toLowerCase().includes(searchLower) ||
        (member.user.email?.toLowerCase().includes(searchLower) ?? false)

      if (!matchesSearch) return false

      // WoW role filter
      if (selectedRoles.length > 0) {
        const memberRole = member.mainCharacter?.role
        if (!memberRole || !selectedRoles.includes(memberRole)) {
          return false
        }
      }

      // Member role filter (owner/officer/member)
      if (selectedMemberRoles.length > 0) {
        if (!selectedMemberRoles.includes(member.role)) {
          return false
        }
      }

      return true
    })
  }, [members, searchQuery, selectedRoles, selectedMemberRoles])

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const handleMemberRoleToggle = (role: string) => {
    setSelectedMemberRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const clearFilters = () => {
    setSelectedRoles([])
    setSelectedMemberRoles([])
    setSearchQuery('')
  }

  const hasActiveFilters =
    selectedRoles.length > 0 ||
    selectedMemberRoles.length > 0 ||
    searchQuery.length > 0

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-950/50 border border-red-800 rounded-lg p-6">
          <h2 className="text-red-400 font-semibold mb-2">
            Error Loading Roster
          </h2>
          <p className="text-red-300/80 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Guild Roster</h1>
          <p className="text-slate-400">
            {isLoading ? (
              'Loading members...'
            ) : (
              <>
                {filteredMembers.length} of {members?.length || 0} member
                {members?.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name, character, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
          />
        </div>

        {/* WoW Role filter */}
        {availableWowRoles.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
              >
                <Filter className="mr-2 h-4 w-4" />
                Role
                {selectedRoles.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">
                    {selectedRoles.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              <DropdownMenuLabel className="text-slate-400">
                Filter by role
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              {availableWowRoles.map(role => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleToggle(role)}
                  className="text-slate-300 focus:bg-slate-700 focus:text-white capitalize"
                >
                  {role}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Member rank filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
            >
              <Filter className="mr-2 h-4 w-4" />
              Rank
              {selectedMemberRoles.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">
                  {selectedMemberRoles.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700">
            <DropdownMenuLabel className="text-slate-400">
              Filter by rank
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            {['owner', 'officer', 'member'].map(role => (
              <DropdownMenuCheckboxItem
                key={role}
                checked={selectedMemberRoles.includes(role)}
                onCheckedChange={() => handleMemberRoleToggle(role)}
                className="text-slate-300 focus:bg-slate-700 focus:text-white capitalize"
              >
                {role}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Member list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-4" />
          <p className="text-slate-400">Loading roster...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No members found
          </h3>
          <p className="text-slate-500">
            {hasActiveFilters
              ? 'Try adjusting your filters or search query'
              : 'Your guild roster is empty'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: index * 0.05,
                    duration: 0.3,
                  },
                }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <MemberCard
                  member={member}
                  isOfficer={isOfficer}
                  onEdit={id => {
                    // TODO: Implement edit modal
                    console.log('Edit member:', id)
                  }}
                  onKick={id => {
                    // TODO: Implement kick confirmation
                    console.log('Kick member:', id)
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
