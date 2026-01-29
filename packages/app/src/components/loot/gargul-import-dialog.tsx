'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { trpc } from '~/lib/trpc/client'
import { useToast } from '~/hooks/use-toast'
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ImportPreviewTable } from './import-preview-table'
import { parseGargulData, type ParsedLootItem } from '~/lib/gargul-parser'

interface GargulImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ImportState = 'input' | 'preview' | 'importing' | 'complete'

export function GargulImportDialog({
  open,
  onOpenChange,
}: GargulImportDialogProps) {
  const { toast } = useToast()
  const [state, setState] = useState<ImportState>('input')
  const [inputData, setInputData] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedLootItem[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{
    imported: number
    skipped: number
  } | null>(null)

  const utils = trpc.useUtils()
  const bulkImportMutation = trpc.loot.bulkImport.useMutation({
    onSuccess: result => {
      setImportResult(result)
      setState('complete')
      toast({
        title: 'Import successful',
        description: `Imported ${result.imported} items, skipped ${result.skipped} duplicates`,
      })
      // Invalidate loot list cache
      utils.loot.list.invalidate()
    },
    onError: error => {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      })
      setState('preview')
    },
  })

  // Handle file upload
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = e => {
        const text = e.target?.result as string
        setInputData(text)
      }
      reader.onerror = () => {
        toast({
          title: 'File read error',
          description: 'Failed to read the uploaded file',
          variant: 'destructive',
        })
      }
      reader.readAsText(file)

      // Reset the input so the same file can be uploaded again
      event.target.value = ''
    },
    [toast]
  )

  // Parse the input data
  const handleParseData = useCallback(() => {
    setParseError(null)

    if (!inputData.trim()) {
      setParseError('Please enter or upload Gargul export data')
      return
    }

    try {
      const items = parseGargulData(inputData)

      if (items.length === 0) {
        setParseError('No valid loot items found in the data')
        return
      }

      setParsedItems(items)
      setState('preview')
    } catch (error) {
      setParseError(
        error instanceof Error ? error.message : 'Failed to parse data'
      )
    }
  }, [inputData])

  // Submit import
  const handleImport = useCallback(() => {
    setState('importing')
    bulkImportMutation.mutate({
      items: parsedItems.map(item => ({
        characterName: item.characterName,
        itemId: item.itemId,
        itemName: item.itemName,
        itemLink: item.itemLink,
        source: item.source,
        awardedAt: item.awardedAt,
        rollType: item.rollType,
        importHash: item.importHash,
        metadata: item.metadata,
      })),
      importSource: 'gargul',
    })
  }, [parsedItems, bulkImportMutation])

  // Reset dialog state
  const handleClose = useCallback(() => {
    setInputData('')
    setParsedItems([])
    setParseError(null)
    setImportResult(null)
    setState('input')
    onOpenChange(false)
  }, [onOpenChange])

  // Go back to input
  const handleBack = useCallback(() => {
    setState('input')
    setParseError(null)
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            Import from Gargul
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {state === 'input' &&
              'Paste your Gargul export data or upload a CSV/JSON file'}
            {state === 'preview' &&
              `Preview ${parsedItems.length} items before importing`}
            {state === 'importing' && 'Importing loot data...'}
            {state === 'complete' && 'Import complete'}
          </DialogDescription>
        </DialogHeader>

        {/* Input State */}
        {state === 'input' && (
          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-slate-200">Upload File</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="relative bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() =>
                    document.getElementById('gargul-file-upload')?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  id="gargul-file-upload"
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="text-sm text-slate-500">
                  CSV, JSON, or TXT format
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-500">or</span>
              </div>
            </div>

            {/* Text Area */}
            <div className="space-y-2">
              <Label className="text-slate-200">Paste Data</Label>
              <Textarea
                value={inputData}
                onChange={e => setInputData(e.target.value)}
                placeholder='Paste Gargul export data here...&#10;&#10;Supports CSV format:&#10;timestamp,player,itemId,itemLink,source,rollType&#10;&#10;Or JSON format:&#10;[{"timestamp": "...", "player": "...", ...}]'
                className="min-h-[300px] font-mono text-sm bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* Parse Error */}
            {parseError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    Parse Error
                  </p>
                  <p className="text-sm text-red-300/80 mt-1">{parseError}</p>
                </div>
              </div>
            )}

            {/* Format Help */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <FileText className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300/90">
                <p className="font-medium mb-1">Supported Formats</p>
                <ul className="list-disc list-inside space-y-1 text-blue-300/70">
                  <li>CSV: timestamp,player,itemId,itemLink,source,rollType</li>
                  <li>JSON: Array of loot objects with player and item data</li>
                  <li>TSV: Tab-separated values</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Preview State */}
        {state === 'preview' && (
          <div className="space-y-4">
            <ImportPreviewTable items={parsedItems} />
          </div>
        )}

        {/* Importing State */}
        {state === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-slate-400">Importing loot data...</p>
          </div>
        )}

        {/* Complete State */}
        {state === 'complete' && importResult && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-lg font-medium text-green-400">
                  Import Successful
                </p>
                <div className="mt-2 space-y-1 text-sm text-green-300/80">
                  <p>Imported: {importResult.imported} items</p>
                  <p>Skipped: {importResult.skipped} duplicates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <DialogFooter className="pt-4">
          {state === 'input' && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleParseData}
                disabled={!inputData.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Parse Data
              </Button>
            </>
          )}

          {state === 'preview' && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {parsedItems.length} Items
              </Button>
            </>
          )}

          {state === 'complete' && (
            <Button
              type="button"
              onClick={handleClose}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
