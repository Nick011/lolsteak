'use client'

import { useState } from 'react'
import { trpc } from '~/lib/trpc/client'
import { useToast } from '~/hooks/use-toast'
import { LootSystemSettings, type LootSystemType } from '~/components/settings'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

export default function SettingsPage() {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get current tenant data
  const { data: tenant, isLoading } = trpc.tenant.get.useQuery()

  // Local state for form
  const [lootSystem, setLootSystem] = useState<LootSystemType | undefined>(
    tenant?.settings?.lootSystem
  )

  // Update mutation
  const updateSettings = trpc.tenant.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your guild settings have been saved successfully.',
      })
      utils.tenant.get.invalidate()
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      })
    },
  })

  // Update local state when tenant data loads
  if (tenant?.settings?.lootSystem && !lootSystem) {
    setLootSystem(tenant.settings.lootSystem)
  }

  const handleSave = () => {
    updateSettings.mutate({
      settings: {
        lootSystem,
      },
    })
  }

  const hasChanges = lootSystem !== tenant?.settings?.lootSystem

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Guild Settings</h1>
        <p className="text-slate-400 mt-2">
          Manage your guild configuration and preferences
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="p-6 space-y-6">
          {/* Loot System Settings */}
          <LootSystemSettings
            value={lootSystem}
            onChange={setLootSystem}
            disabled={updateSettings.isPending}
          />

          <Separator className="bg-slate-700" />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateSettings.isPending}
            >
              {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Future Settings Sections */}
      <div className="mt-6 bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          More settings coming soon: guild info, integrations, and more.
        </p>
      </div>
    </div>
  )
}
