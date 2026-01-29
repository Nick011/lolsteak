/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
  LootSystemSettings,
  type LootSystemType,
} from '~/components/settings/loot-system-settings'

const meta = {
  title: 'Settings/LootSystemSettings',
  component: LootSystemSettings,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LootSystemSettings>

export default meta
type Story = StoryObj<typeof meta>

// Wrapper component to handle state
function LootSystemSettingsWrapper({
  initialValue,
  disabled,
}: {
  initialValue?: LootSystemType
  disabled?: boolean
}) {
  const [value, setValue] = useState<LootSystemType | undefined>(initialValue)

  return (
    <div className="w-[600px] p-6 bg-slate-900 rounded-lg">
      <LootSystemSettings
        value={value}
        onChange={setValue}
        disabled={disabled}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <LootSystemSettingsWrapper />,
}

export const WithPersonalLoot: Story = {
  render: () => <LootSystemSettingsWrapper initialValue="personal" />,
}

export const WithNeedGreed: Story = {
  render: () => <LootSystemSettingsWrapper initialValue="need_greed" />,
}

export const WithDKP: Story = {
  render: () => <LootSystemSettingsWrapper initialValue="dkp" />,
}

export const WithEPGP: Story = {
  render: () => <LootSystemSettingsWrapper initialValue="epgp" />,
}

export const WithLootCouncil: Story = {
  render: () => <LootSystemSettingsWrapper initialValue="loot_council" />,
}

export const WithSoftReserve: Story = {
  render: () => <LootSystemSettingsWrapper initialValue="soft_reserve" />,
}

export const Disabled: Story = {
  render: () => <LootSystemSettingsWrapper initialValue="dkp" disabled />,
}
