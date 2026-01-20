// WoW Class types
export const WOW_CLASSES = [
  'warrior',
  'paladin',
  'hunter',
  'rogue',
  'priest',
  'shaman',
  'mage',
  'warlock',
  'druid',
  'death_knight',
] as const

export type WowClass = (typeof WOW_CLASSES)[number]

export const WOW_ROLES = ['tank', 'healer', 'dps'] as const
export type WowRole = (typeof WOW_ROLES)[number]

// Class colors for UI
export const WOW_CLASS_COLORS: Record<WowClass, string> = {
  warrior: '#C79C6E',
  paladin: '#F58CBA',
  hunter: '#ABD473',
  rogue: '#FFF569',
  priest: '#FFFFFF',
  shaman: '#0070DE',
  mage: '#69CCF0',
  warlock: '#9482C9',
  druid: '#FF7D0A',
  death_knight: '#C41F3B',
}

// Game types
export const GAME_TYPES = [
  'wow_classic',
  'wow_retail',
  'ff14',
  'lol',
  'dota2',
  'cs2',
  'rocket_league',
  'other',
] as const

export type GameType = (typeof GAME_TYPES)[number]

// Member roles
export const MEMBER_ROLES = ['owner', 'officer', 'member'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

// Event types
export const EVENT_TYPES = [
  'raid',
  'dungeon',
  'pvp',
  'social',
  'other',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

// Signup statuses
export const SIGNUP_STATUSES = [
  'confirmed',
  'tentative',
  'declined',
  'standby',
] as const
export type SignupStatus = (typeof SIGNUP_STATUSES)[number]

// Loot systems
export const LOOT_SYSTEMS = [
  'dkp',
  'loot_council',
  'soft_reserve',
  'gdkp',
  'need_greed',
] as const

export type LootSystem = (typeof LOOT_SYSTEMS)[number]

// Gargul CSV types
export interface GargulLootEntry {
  timestamp: string
  itemId: number
  itemName: string
  itemLink: string
  player: string
  rollType?: string
  roll?: number
  source?: string
}

// Display helpers
export const GAME_TYPE_LABELS: Record<GameType, string> = {
  wow_classic: 'WoW Classic',
  wow_retail: 'WoW Retail',
  ff14: 'Final Fantasy XIV',
  lol: 'League of Legends',
  dota2: 'Dota 2',
  cs2: 'Counter-Strike 2',
  rocket_league: 'Rocket League',
  other: 'Other',
}

export const WOW_CLASS_LABELS: Record<WowClass, string> = {
  warrior: 'Warrior',
  paladin: 'Paladin',
  hunter: 'Hunter',
  rogue: 'Rogue',
  priest: 'Priest',
  shaman: 'Shaman',
  mage: 'Mage',
  warlock: 'Warlock',
  druid: 'Druid',
  death_knight: 'Death Knight',
}
