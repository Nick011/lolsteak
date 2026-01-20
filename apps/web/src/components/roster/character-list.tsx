'use client'

import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'

interface Character {
  id: string
  name: string
  class: string
  level: number
  itemLevel?: number
  isMain: boolean
  realm?: string
}

interface CharacterListProps {
  characters: Character[]
  className?: string
}

const classColors: Record<string, string> = {
  // Death Knight
  'death knight': 'text-red-500',
  // Demon Hunter
  'demon hunter': 'text-purple-500',
  // Druid
  druid: 'text-orange-400',
  // Evoker
  evoker: 'text-teal-500',
  // Hunter
  hunter: 'text-green-500',
  // Mage
  mage: 'text-cyan-400',
  // Monk
  monk: 'text-emerald-500',
  // Paladin
  paladin: 'text-pink-400',
  // Priest
  priest: 'text-slate-200',
  // Rogue
  rogue: 'text-yellow-400',
  // Shaman
  shaman: 'text-blue-500',
  // Warlock
  warlock: 'text-purple-400',
  // Warrior
  warrior: 'text-amber-600',
}

function CharacterCard({ character }: { character: Character }) {
  const classColor =
    classColors[character.class.toLowerCase()] || 'text-slate-400'

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-slate-800/40 p-4 transition-all hover:bg-slate-800/60',
        character.isMain && 'border-purple-500/50 bg-slate-800/60'
      )}
    >
      {character.isMain && (
        <div className="absolute -top-2 -right-2 rounded-full bg-purple-500 p-1.5 shadow-lg shadow-purple-500/50">
          <Star className="h-3 w-3 fill-white text-white" />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className={cn('font-semibold', classColor)}>
              {character.name}
            </h4>
            {character.realm && (
              <p className="text-xs text-slate-500">{character.realm}</p>
            )}
          </div>
          {character.isMain && (
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
              Main
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className={cn('font-medium', classColor)}>
            {character.class}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">Level {character.level}</span>
          {character.itemLevel && (
            <>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">iLvl {character.itemLevel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function CharacterList({ characters, className }: CharacterListProps) {
  if (!characters || characters.length === 0) {
    return (
      <Card className={cn('border-slate-700 bg-slate-800/50', className)}>
        <CardContent className="p-6">
          <p className="text-center text-slate-500">No characters found</p>
        </CardContent>
      </Card>
    )
  }

  // Sort characters: main character first, then by level
  const sortedCharacters = [...characters].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1
    if (!a.isMain && b.isMain) return 1
    return b.level - a.level
  })

  return (
    <Card className={cn('border-slate-700 bg-slate-800/50', className)}>
      <CardHeader>
        <CardTitle className="text-lg text-white">
          Characters ({characters.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedCharacters.map(character => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </CardContent>
    </Card>
  )
}
