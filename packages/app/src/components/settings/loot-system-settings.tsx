'use client'

import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

export type LootSystemType =
  | 'personal'
  | 'need_greed'
  | 'dkp'
  | 'epgp'
  | 'loot_council'
  | 'soft_reserve'

interface LootSystemOption {
  value: LootSystemType
  label: string
  description: string
}

const LOOT_SYSTEMS: LootSystemOption[] = [
  {
    value: 'personal',
    label: 'Personal Loot',
    description: 'Items drop directly to players (WoW Retail default)',
  },
  {
    value: 'need_greed',
    label: 'Need/Greed',
    description: 'Players roll Need or Greed, highest roll wins',
  },
  {
    value: 'dkp',
    label: 'DKP',
    description: 'Earn points for raids, spend to bid on loot',
  },
  {
    value: 'epgp',
    label: 'EPGP',
    description:
      'Effort points earned, Gear points spent, priority = EP/GP ratio',
  },
  {
    value: 'loot_council',
    label: 'Loot Council',
    description: 'Officers decide who gets loot based on need/performance',
  },
  {
    value: 'soft_reserve',
    label: 'Soft Reserve',
    description: 'Players pre-reserve items, reservers get priority',
  },
]

interface LootSystemSettingsProps {
  value?: LootSystemType
  onChange: (value: LootSystemType) => void
  disabled?: boolean
}

export function LootSystemSettings({
  value,
  onChange,
  disabled = false,
}: LootSystemSettingsProps) {
  const selectedSystem = LOOT_SYSTEMS.find(system => system.value === value)

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold text-slate-200">
          Loot System
        </Label>
        <p className="text-sm text-slate-400 mt-1">
          Choose how loot will be distributed in your guild
        </p>
      </div>

      <div className="space-y-3">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a loot system" />
          </SelectTrigger>
          <SelectContent>
            {LOOT_SYSTEMS.map(system => (
              <SelectItem key={system.value} value={system.value}>
                {system.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSystem && (
          <div className="rounded-md bg-slate-800/30 border border-slate-700 p-4">
            <p className="text-sm text-slate-300">
              {selectedSystem.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
