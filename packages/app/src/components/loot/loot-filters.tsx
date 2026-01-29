'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Search, X, Filter } from 'lucide-react'

interface LootFiltersProps {
  onSearchChange: (search: string) => void
  onCharacterChange: (characterId: string | undefined) => void
  characters: Array<{ id: string; name: string; class?: string | null }>
  searchValue?: string
  characterId?: string
}

export function LootFilters({
  onSearchChange,
  onCharacterChange,
  characters,
  searchValue = '',
  characterId,
}: LootFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  // Debounce search input
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [localSearch, onSearchChange])

  const handleClearFilters = () => {
    setLocalSearch('')
    onCharacterChange(undefined)
    onSearchChange('')
  }

  const hasActiveFilters = localSearch || characterId

  return (
    <div className="space-y-4">
      {/* Search and character filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search items..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Character filter */}
        <Select
          value={characterId || 'all'}
          onValueChange={value =>
            onCharacterChange(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="All Characters" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-slate-300">
              All Characters
            </SelectItem>
            {characters.map(char => (
              <SelectItem
                key={char.id}
                value={char.id}
                className="text-slate-300"
              >
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Filter className="h-4 w-4" />
          <span>
            Filters active
            {localSearch && (
              <span className="mx-1">• Search: "{localSearch}"</span>
            )}
            {characterId && (
              <span className="mx-1">
                • Character: {characters.find(c => c.id === characterId)?.name}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
