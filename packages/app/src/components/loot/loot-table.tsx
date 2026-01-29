'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '~/components/ui/badge'
import { Sword, Calendar, User, Coins, Sparkles } from 'lucide-react'

// WoW item quality colors
const QUALITY_COLORS: Record<
  number,
  { text: string; border: string; bg: string }
> = {
  0: {
    text: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-500/10',
  }, // Poor (gray)
  1: { text: 'text-white', border: 'border-slate-500', bg: 'bg-slate-400/10' }, // Common (white)
  2: {
    text: 'text-green-400',
    border: 'border-green-600',
    bg: 'bg-green-500/10',
  }, // Uncommon (green)
  3: { text: 'text-blue-400', border: 'border-blue-600', bg: 'bg-blue-500/10' }, // Rare (blue)
  4: {
    text: 'text-purple-400',
    border: 'border-purple-600',
    bg: 'bg-purple-500/10',
  }, // Epic (purple)
  5: {
    text: 'text-orange-400',
    border: 'border-orange-600',
    bg: 'bg-orange-500/10',
  }, // Legendary (orange)
}

// Roll type configurations
const ROLL_TYPE_CONFIG: Record<
  string,
  {
    label: string
    variant: 'default' | 'destructive' | 'blush' | 'peach' | 'sky'
  }
> = {
  ms: { label: 'MS', variant: 'destructive' },
  os: { label: 'OS', variant: 'sky' },
  sr: { label: 'SR', variant: 'peach' },
  need: { label: 'Need', variant: 'destructive' },
  greed: { label: 'Greed', variant: 'sky' },
  free: { label: 'Free', variant: 'default' },
}

interface Character {
  id: string
  name: string
  class?: string | null
}

interface Event {
  id: string
  name: string
}

interface LootEntry {
  id: string
  itemName: string
  itemLink?: string | null
  itemId?: number | null
  characterName: string
  character?: Character | null
  source?: string | null
  rollType?: string | null
  cost?: number | null
  awardedAt: Date
  event?: Event | null
}

interface LootTableProps {
  loot: LootEntry[]
  isLoading?: boolean
}

// Extract item quality from itemLink (WoW item link format)
function extractItemQuality(itemLink?: string | null): number {
  if (!itemLink) return 1 // Default to common

  // WoW item link format: |cffXXXXXX|Hitem:id:...
  // Quality is typically encoded in the color or we can use a lookup
  const colorMatch = itemLink.match(/\|cff([0-9a-fA-F]{6})/)
  if (colorMatch) {
    const color = colorMatch[1].toLowerCase()
    // Map common WoW colors to quality
    const qualityMap: Record<string, number> = {
      '9d9d9d': 0, // Poor
      ffffff: 1, // Common
      '1eff00': 2, // Uncommon
      '0070dd': 3, // Rare
      a335ee: 4, // Epic
      ff8000: 5, // Legendary
    }
    return qualityMap[color] ?? 1
  }

  return 1
}

export function LootTable({ loot, isLoading }: LootTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 animate-pulse"
          >
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (loot.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
        <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-400 mb-2">
          No Loot Found
        </h3>
        <p className="text-slate-500">No loot has been recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {loot.map((entry, index) => {
          const quality = extractItemQuality(entry.itemLink)
          const qualityStyle = QUALITY_COLORS[quality] || QUALITY_COLORS[1]
          const rollConfig = entry.rollType
            ? ROLL_TYPE_CONFIG[entry.rollType.toLowerCase()]
            : null

          const date = new Date(entry.awardedAt)
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year:
              date.getFullYear() !== new Date().getFullYear()
                ? 'numeric'
                : undefined,
          })

          return (
            <motion.div
              key={entry.id}
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
                bg-slate-800/30 ${qualityStyle.border}
                hover:bg-slate-800/50 hover:border-opacity-70
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left side - Item info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                      p-2 rounded-lg ${qualityStyle.bg} ${qualityStyle.border} border
                      flex-shrink-0
                    `}
                    >
                      <Sword className={`h-4 w-4 ${qualityStyle.text}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Item name */}
                      <h3
                        className={`text-base font-semibold mb-1 truncate ${qualityStyle.text}`}
                      >
                        {entry.itemName}
                      </h3>

                      {/* Character and source */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-slate-300">
                            {entry.characterName}
                          </span>
                        </div>

                        {entry.source && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                              {entry.source}
                            </span>
                          </>
                        )}

                        {entry.event && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="truncate">{entry.event.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Badges and date */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Roll type badge */}
                  {rollConfig && (
                    <Badge variant={rollConfig.variant} size="sm">
                      {rollConfig.label}
                    </Badge>
                  )}

                  {/* Cost badge */}
                  {entry.cost !== null && entry.cost !== undefined && (
                    <Badge variant="default" size="sm">
                      <Coins className="h-3 w-3 mr-1" />
                      {entry.cost}
                    </Badge>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-sm text-slate-400 ml-2">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">{dateStr}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
