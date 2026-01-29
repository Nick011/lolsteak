'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Calendar, User, Sword, AlertCircle } from 'lucide-react'
import type { ParsedLootItem } from '~/lib/gargul-parser'

interface ImportPreviewTableProps {
  items: ParsedLootItem[]
}

// Roll type badge variants
const ROLL_TYPE_VARIANTS: Record<
  string,
  'default' | 'destructive' | 'blush' | 'peach' | 'sky'
> = {
  ms: 'destructive',
  os: 'sky',
  sr: 'peach',
  need: 'destructive',
  greed: 'sky',
  free: 'default',
  council: 'blush',
  dkp: 'peach',
}

export function ImportPreviewTable({ items }: ImportPreviewTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-400 mb-2">
          No Items to Preview
        </h3>
        <p className="text-slate-500">No valid items found in the data</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Found {items.length} item{items.length === 1 ? '' : 's'} to import
        </p>
      </div>

      <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-700">
                <TableHead className="text-slate-300 font-semibold">
                  Item
                </TableHead>
                <TableHead className="text-slate-300 font-semibold">
                  Character
                </TableHead>
                <TableHead className="text-slate-300 font-semibold">
                  Source
                </TableHead>
                <TableHead className="text-slate-300 font-semibold">
                  Roll Type
                </TableHead>
                <TableHead className="text-slate-300 font-semibold">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const date = new Date(item.awardedAt)
                const dateStr = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                const timeStr = date.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                const rollTypeVariant = item.rollType
                  ? ROLL_TYPE_VARIANTS[item.rollType.toLowerCase()] || 'default'
                  : 'default'

                return (
                  <TableRow
                    key={`${item.importHash}-${index}`}
                    className="border-slate-700 hover:bg-slate-800/50"
                  >
                    {/* Item */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/20">
                          <Sword className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {item.itemName}
                          </p>
                          {item.itemId && (
                            <p className="text-xs text-slate-500">
                              ID: {item.itemId}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Character */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-300">
                          {item.characterName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      {item.source ? (
                        <span className="text-sm text-slate-400">
                          {item.source}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </TableCell>

                    {/* Roll Type */}
                    <TableCell>
                      {item.rollType ? (
                        <Badge variant={rollTypeVariant} size="sm">
                          {item.rollType}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <div className="text-sm">
                          <p className="text-slate-300">{dateStr}</p>
                          <p className="text-xs text-slate-500">{timeStr}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300/90">
          <p className="font-medium mb-1">Import Summary</p>
          <ul className="space-y-1 text-blue-300/70">
            <li>
              Total items: <strong>{items.length}</strong>
            </li>
            <li>
              Items with IDs:{' '}
              <strong>{items.filter(i => i.itemId).length}</strong>
            </li>
            <li>
              Duplicate check: Items with the same timestamp, character, and
              item ID will be skipped
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
