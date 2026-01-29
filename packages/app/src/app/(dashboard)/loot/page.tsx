'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { GargulImportDialog } from '~/components/loot/gargul-import-dialog'
import { Upload } from 'lucide-react'

export default function LootPage() {
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Loot</h1>
        <Button
          onClick={() => setImportDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import from Gargul
        </Button>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <p className="text-slate-400">
          Loot tracking is coming soon. You can now import loot from Gargul
          addon using the button above.
        </p>
      </div>

      <GargulImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  )
}
