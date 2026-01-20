import { Shield, Heart, Swords } from 'lucide-react'

// WoW class colors (matching Blizzard's official palette)
export const WOW_CLASS_COLORS: Record<string, string> = {
  warrior: 'bg-amber-700 text-amber-100',
  paladin: 'bg-pink-500 text-pink-100',
  hunter: 'bg-green-600 text-green-100',
  rogue: 'bg-yellow-500 text-yellow-950',
  priest: 'bg-slate-200 text-slate-950',
  shaman: 'bg-blue-600 text-blue-100',
  mage: 'bg-cyan-400 text-cyan-950',
  warlock: 'bg-purple-600 text-purple-100',
  druid: 'bg-orange-600 text-orange-100',
  death_knight: 'bg-red-700 text-red-100',
}

// WoW role colors for badges
export const WOW_ROLE_COLORS: Record<string, string> = {
  tank: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  healer: 'bg-green-500/20 text-green-400 border-green-500/30',
  dps: 'bg-red-500/20 text-red-400 border-red-500/30',
}

// Role icons
export const WOW_ROLE_ICONS = {
  tank: Shield,
  healer: Heart,
  dps: Swords,
}

// WoW classes with proper display names
export const WOW_CLASSES = [
  { value: 'warrior', label: 'Warrior' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'hunter', label: 'Hunter' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'priest', label: 'Priest' },
  { value: 'shaman', label: 'Shaman' },
  { value: 'mage', label: 'Mage' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'druid', label: 'Druid' },
  { value: 'death_knight', label: 'Death Knight' },
] as const

// WoW roles
export const WOW_ROLES = [
  { value: 'tank', label: 'Tank' },
  { value: 'healer', label: 'Healer' },
  { value: 'dps', label: 'DPS' },
] as const

// Class specs mapping (for validation and suggestions)
export const WOW_CLASS_SPECS: Record<string, string[]> = {
  warrior: ['Arms', 'Fury', 'Protection'],
  paladin: ['Holy', 'Protection', 'Retribution'],
  hunter: ['Beast Mastery', 'Marksmanship', 'Survival'],
  rogue: ['Assassination', 'Combat', 'Subtlety'],
  priest: ['Discipline', 'Holy', 'Shadow'],
  shaman: ['Elemental', 'Enhancement', 'Restoration'],
  mage: ['Arcane', 'Fire', 'Frost'],
  warlock: ['Affliction', 'Demonology', 'Destruction'],
  druid: ['Balance', 'Feral', 'Restoration'],
  death_knight: ['Blood', 'Frost', 'Unholy'],
}

// Helper to format class name for display
export function formatClassName(className: string): string {
  return className
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to get class color
export function getClassColor(className: string | null): string {
  if (!className) return 'bg-slate-700 text-slate-300'
  return WOW_CLASS_COLORS[className] || 'bg-slate-700 text-slate-300'
}

// Helper to get role color
export function getRoleColor(role: string | null): string {
  if (!role) return 'bg-slate-700 text-slate-300'
  return WOW_ROLE_COLORS[role] || 'bg-slate-700 text-slate-300'
}

// Helper to get role icon
export function getRoleIcon(role: string | null) {
  if (!role) return Shield
  return WOW_ROLE_ICONS[role as keyof typeof WOW_ROLE_ICONS] || Shield
}
