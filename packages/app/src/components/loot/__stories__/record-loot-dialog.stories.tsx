/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { RecordLootDialog } from '../record-loot-dialog'
import { useState } from 'react'
import { Button } from '~/components/ui/button'

/**
 * RecordLootDialog allows officers to manually record loot drops.
 *
 * Features:
 * - Character selection with search (guild members or custom names)
 * - Item details with WoW item ID support
 * - Source/boss tracking
 * - Roll type selection (MS, OS, SR, Free Roll, Council, DKP)
 * - Optional DKP/points cost
 * - Date/time tracking
 * - Event linking
 */
const meta: Meta<typeof RecordLootDialog> = {
  title: 'Loot/RecordLootDialog',
  component: RecordLootDialog,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div className="min-h-screen w-screen flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Wrapper component to control dialog state
function DialogWrapper({ open: initialOpen = false }) {
  const [open, setOpen] = useState(initialOpen)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Record Loot</Button>
      <RecordLootDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export const Closed: Story = {
  render: () => <DialogWrapper open={false} />,
}

export const Open: Story = {
  render: () => <DialogWrapper open={true} />,
}

export const InteractiveDemo: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Record Loot
        </Button>
        <RecordLootDialog open={open} onOpenChange={setOpen} />
      </>
    )
  },
}

/**
 * Example use case: Recording raid loot
 *
 * Fill in the form with:
 * - Character: Select from guild roster
 * - Item Name: Thunderfury, Blessed Blade of the Windseeker
 * - Item ID: 19019
 * - Source: Garr
 * - Source Type: Raid
 * - Roll Type: MS (Main Spec)
 * - Link to raid event
 */
export const RaidLootExample: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Common scenario for recording a high-value raid drop with full details.',
      },
    },
  },
}

/**
 * Example use case: DKP System
 *
 * Fill in the form with:
 * - Roll Type: DKP
 * - Cost: 150 (points spent)
 * - All other standard fields
 */
export const DKPExample: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Recording loot with DKP cost for guilds using point systems.',
      },
    },
  },
}

/**
 * Example use case: Custom Character Entry
 *
 * Click "Enter Custom Name" to record loot for characters not in the guild roster.
 * Useful for:
 * - PUG members
 * - Trial members not yet in roster
 * - Cross-guild raids
 */
export const CustomCharacterExample: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Recording loot for characters not in the guild roster using custom name entry.',
      },
    },
  },
}

/**
 * Example: Soft Reserve System
 *
 * Fill in with:
 * - Roll Type: SR (Soft Reserve)
 * - Character who had the SR
 * - Item they reserved
 */
export const SoftReserveExample: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Recording a soft reserve win for an item.',
      },
    },
  },
}

/**
 * Example: Off-Spec Loot
 *
 * Fill in with:
 * - Roll Type: OS (Off Spec)
 * - Typically lower/no DKP cost
 */
export const OffSpecExample: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Recording off-spec loot, typically at reduced or no cost.',
      },
    },
  },
}

/**
 * Example: Loot Council Decision
 *
 * Fill in with:
 * - Roll Type: Council
 * - Loot council awarded the item
 */
export const LootCouncilExample: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Recording loot awarded by loot council decision.',
      },
    },
  },
}

export const MobileView: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'The dialog is responsive and works well on mobile devices. Form fields stack vertically on small screens.',
      },
    },
  },
}
