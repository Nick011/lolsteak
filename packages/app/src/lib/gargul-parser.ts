/**
 * Gargul Import Parser
 *
 * Parses Gargul addon export data in various formats (CSV, JSON, TSV)
 * and converts it to a standardized format for import.
 */

export interface ParsedLootItem {
  characterName: string
  itemId?: number
  itemName: string
  itemLink?: string
  source?: string
  awardedAt: string // ISO datetime string
  rollType?: string
  importHash: string // For deduplication
  metadata?: Record<string, unknown>
}

interface RawGargulItem {
  timestamp?: string | number
  date?: string
  player?: string
  character?: string
  characterName?: string
  itemId?: string | number
  itemID?: string | number
  item_id?: string | number
  itemName?: string
  item_name?: string
  item?: string
  itemLink?: string
  item_link?: string
  link?: string
  source?: string
  boss?: string
  rollType?: string
  roll_type?: string
  roll?: string
  response?: string
}

/**
 * Generate consistent hash for deduplication
 */
export function generateImportHash(
  timestamp: string,
  player: string,
  itemId: number | string
): string {
  const key = `${timestamp}-${player}-${itemId}`
  // Use TextEncoder for Unicode-safe encoding, then base64
  if (typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(key)
    // Convert Uint8Array to base64
    const binary = String.fromCharCode(...bytes)
    return btoa(binary).slice(0, 32)
  }
  // Fallback to Buffer for server-side (already handles UTF-8)
  return Buffer.from(key, 'utf-8').toString('base64').slice(0, 32)
}

/**
 * Parse timestamp to ISO datetime string
 */
function parseTimestamp(timestamp: string | number | undefined): string {
  if (!timestamp) {
    return new Date().toISOString()
  }

  // Unix timestamp (seconds or milliseconds)
  if (typeof timestamp === 'number') {
    // If it's in seconds, convert to milliseconds
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp
    return new Date(ms).toISOString()
  }

  // String timestamp
  const parsed = new Date(timestamp)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }

  // Try parsing as unix timestamp string
  const numericTimestamp = parseInt(timestamp, 10)
  if (!isNaN(numericTimestamp)) {
    const ms =
      numericTimestamp < 10000000000
        ? numericTimestamp * 1000
        : numericTimestamp
    return new Date(ms).toISOString()
  }

  // Fallback to current time
  return new Date().toISOString()
}

/**
 * Extract item ID from item link
 * WoW item link format: |cffXXXXXX|Hitem:12345:...
 */
function extractItemIdFromLink(itemLink: string): number | undefined {
  const match = itemLink.match(/item:(\d+)/)
  if (match?.[1]) {
    return parseInt(match[1], 10)
  }
  return undefined
}

/**
 * Normalize a raw Gargul item to ParsedLootItem
 */
function normalizeItem(raw: RawGargulItem): ParsedLootItem | null {
  // Get character name (required)
  const characterName = raw.player || raw.character || raw.characterName || ''
  if (!characterName) {
    return null
  }

  // Get item ID
  let itemId: number | undefined
  const rawItemId = raw.itemId || raw.itemID || raw.item_id
  if (rawItemId) {
    itemId = typeof rawItemId === 'number' ? rawItemId : parseInt(rawItemId, 10)
  }

  // Get item link and try to extract ID from it
  const itemLink = raw.itemLink || raw.item_link || raw.link || undefined

  // If we don't have an itemId yet, try to extract from link
  if (!itemId && itemLink) {
    itemId = extractItemIdFromLink(itemLink)
  }

  // Get item name (required)
  const itemName = raw.itemName || raw.item_name || raw.item || ''
  if (!itemName) {
    return null
  }

  // Parse timestamp
  const awardedAt = parseTimestamp(raw.timestamp || raw.date)

  // Get source
  const source = raw.source || raw.boss || undefined

  // Get roll type
  const rollType =
    raw.rollType || raw.roll_type || raw.roll || raw.response || undefined

  // Generate import hash
  const importHash = generateImportHash(
    awardedAt,
    characterName,
    itemId || itemName
  )

  return {
    characterName,
    itemId,
    itemName,
    itemLink,
    source,
    awardedAt,
    rollType,
    importHash,
    metadata: {
      rawData: raw,
    },
  }
}

/**
 * Parse CSV format
 * Expected format: timestamp,player,itemId,itemLink,source,rollType
 */
function parseCSV(data: string): ParsedLootItem[] {
  const lines = data.trim().split('\n')
  const items: ParsedLootItem[] = []

  // Detect if first line is a header
  const firstLine = lines[0]?.toLowerCase() || ''
  const hasHeader =
    firstLine.includes('timestamp') ||
    firstLine.includes('player') ||
    firstLine.includes('item')

  const startIndex = hasHeader ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]?.trim()
    if (!line) continue

    const parts = line.split(',').map(p => p.trim())

    // Skip if not enough columns
    if (parts.length < 2) continue

    const raw: RawGargulItem = {
      timestamp: parts[0],
      player: parts[1],
      itemId: parts[2],
      itemLink: parts[3],
      source: parts[4],
      rollType: parts[5],
    }

    const normalized = normalizeItem(raw)
    if (normalized) {
      items.push(normalized)
    }
  }

  return items
}

/**
 * Parse TSV format (tab-separated)
 */
function parseTSV(data: string): ParsedLootItem[] {
  const lines = data.trim().split('\n')
  const items: ParsedLootItem[] = []

  // Detect if first line is a header
  const firstLine = lines[0]?.toLowerCase() || ''
  const hasHeader =
    firstLine.includes('timestamp') ||
    firstLine.includes('player') ||
    firstLine.includes('item')

  const startIndex = hasHeader ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]?.trim()
    if (!line) continue

    const parts = line.split('\t').map(p => p.trim())

    // Skip if not enough columns
    if (parts.length < 2) continue

    const raw: RawGargulItem = {
      timestamp: parts[0],
      player: parts[1],
      itemId: parts[2],
      itemLink: parts[3],
      source: parts[4],
      rollType: parts[5],
    }

    const normalized = normalizeItem(raw)
    if (normalized) {
      items.push(normalized)
    }
  }

  return items
}

/**
 * Parse JSON format
 */
function parseJSON(data: string): ParsedLootItem[] {
  try {
    const parsed = JSON.parse(data)

    // Handle array of items
    if (Array.isArray(parsed)) {
      const items: ParsedLootItem[] = []
      for (const raw of parsed) {
        const normalized = normalizeItem(raw as RawGargulItem)
        if (normalized) {
          items.push(normalized)
        }
      }
      return items
    }

    // Handle single item
    const normalized = normalizeItem(parsed as RawGargulItem)
    return normalized ? [normalized] : []
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}

/**
 * Auto-detect format and parse Gargul export data
 */
export function parseGargulData(data: string): ParsedLootItem[] {
  const trimmed = data.trim()

  if (!trimmed) {
    throw new Error('No data provided')
  }

  // Try JSON first
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return parseJSON(trimmed)
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Detect TSV (tabs are more common in Gargul exports than commas in some versions)
  if (trimmed.includes('\t')) {
    const items = parseTSV(trimmed)
    if (items.length > 0) {
      return items
    }
  }

  // Try CSV
  if (trimmed.includes(',')) {
    const items = parseCSV(trimmed)
    if (items.length > 0) {
      return items
    }
  }

  // Try CSV anyway (might be single column or different delimiter)
  const csvItems = parseCSV(trimmed)
  if (csvItems.length > 0) {
    return csvItems
  }

  throw new Error(
    'Could not parse data. Supported formats: CSV, TSV, or JSON array'
  )
}
