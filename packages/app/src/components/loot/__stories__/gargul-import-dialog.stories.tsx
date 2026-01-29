/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { GargulImportDialog } from '../gargul-import-dialog'
import { Button } from '~/components/ui/button'

const meta: Meta<typeof GargulImportDialog> = {
  title: 'Loot/GargulImportDialog',
  component: GargulImportDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Wrapper component to handle open state
function DialogWrapper() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)} className="bg-purple-600">
        Open Gargul Import
      </Button>
      <GargulImportDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const Default: Story = {
  render: () => <DialogWrapper />,
}

// Example CSV data for testing
export const WithSampleData: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const sampleCSV = `timestamp,player,itemId,itemLink,source,rollType
1706000000,Thunderstrike,19019,[Thunderfury Blessed Blade of the Windseeker],Ragnaros,MS
1706001000,Healmaster,18803,[Finkle's Lava Dredger],Ragnaros,SR
1706002000,Tankface,17076,[Bonereaver's Edge],Ragnaros,MS
1706003000,Mageborn,17102,[Cloak of the Shrouded Mists],Ragnaros,OS
1706004000,Rogueshadow,17063,[Band of Accuria],Ragnaros,MS`

    return (
      <div className="p-8">
        <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Sample CSV Data:</p>
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
            {sampleCSV}
          </pre>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-purple-600">
          Import Sample Data
        </Button>
        <GargulImportDialog open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

// Example JSON data
export const WithJSONData: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const sampleJSON = `[
  {
    "timestamp": 1706000000,
    "player": "Thunderstrike",
    "itemId": 19019,
    "itemName": "Thunderfury, Blessed Blade of the Windseeker",
    "itemLink": "|cffa335ee|Hitem:19019:::::::::60:::::::|h[Thunderfury, Blessed Blade of the Windseeker]|h|r",
    "source": "Molten Core - Ragnaros",
    "rollType": "MS"
  },
  {
    "timestamp": 1706001000,
    "player": "Healmaster",
    "itemId": 18803,
    "itemName": "Finkle's Lava Dredger",
    "source": "Molten Core - Ragnaros",
    "rollType": "SR"
  }
]`

    return (
      <div className="p-8">
        <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Sample JSON Data:</p>
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {sampleJSON}
          </pre>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-purple-600">
          Import JSON Data
        </Button>
        <GargulImportDialog open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

// TSV format example
export const WithTSVData: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const sampleTSV = `timestamp\tplayer\titemId\titemName\tsource\trollType
1706000000\tThunderstrike\t19019\tThunderfury Blessed Blade\tRagnaros\tMS
1706001000\tHealmaster\t18803\tFinkle's Lava Dredger\tRagnaros\tSR
1706002000\tTankface\t17076\tBonereaver's Edge\tRagnaros\tMS`

    return (
      <div className="p-8">
        <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Sample TSV Data:</p>
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
            {sampleTSV}
          </pre>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-purple-600">
          Import TSV Data
        </Button>
        <GargulImportDialog open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}
