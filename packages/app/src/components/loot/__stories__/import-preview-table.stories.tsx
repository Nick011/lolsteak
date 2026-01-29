import type { Meta, StoryObj } from '@storybook/react'
import { ImportPreviewTable } from '../import-preview-table'
import type { ParsedLootItem } from '~/lib/gargul-parser'

const meta = {
  title: 'Loot/ImportPreviewTable',
  component: ImportPreviewTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ImportPreviewTable>

export default meta
type Story = StoryObj<typeof meta>

const sampleItems: ParsedLootItem[] = [
  {
    characterName: 'Thunderstrike',
    itemId: 19019,
    itemName: 'Thunderfury, Blessed Blade of the Windseeker',
    itemLink:
      '|cffa335ee|Hitem:19019:::::::::60:::::::|h[Thunderfury, Blessed Blade of the Windseeker]|h|r',
    source: 'Molten Core - Ragnaros',
    rollType: 'MS',
    awardedAt: new Date('2024-01-23T20:30:00Z').toISOString(),
    importHash: 'MTcwNjAzODIwMDAwMC1UaHVuZGVy',
  },
  {
    characterName: 'Healmaster',
    itemId: 18803,
    itemName: "Finkle's Lava Dredger",
    source: 'Molten Core - Ragnaros',
    rollType: 'SR',
    awardedAt: new Date('2024-01-23T20:35:00Z').toISOString(),
    importHash: 'MTcwNjAzODUwMDAwMC1IZWFsbWFz',
  },
  {
    characterName: 'Tankface',
    itemId: 17076,
    itemName: "Bonereaver's Edge",
    itemLink:
      "|cffa335ee|Hitem:17076:::::::::60:::::::|h[Bonereaver's Edge]|h|r",
    source: 'Molten Core - Ragnaros',
    rollType: 'MS',
    awardedAt: new Date('2024-01-23T20:40:00Z').toISOString(),
    importHash: 'MTcwNjAzODgwMDAwMC1UYW5rZmFj',
  },
  {
    characterName: 'Mageborn',
    itemId: 17102,
    itemName: 'Cloak of the Shrouded Mists',
    source: 'Molten Core - Ragnaros',
    rollType: 'OS',
    awardedAt: new Date('2024-01-23T20:45:00Z').toISOString(),
    importHash: 'MTcwNjAzOTEwMDAwMC1NYWdlYm9y',
  },
  {
    characterName: 'Rogueshadow',
    itemId: 17063,
    itemName: 'Band of Accuria',
    itemLink: '|cffa335ee|Hitem:17063:::::::::60:::::::|h[Band of Accuria]|h|r',
    source: 'Molten Core - Ragnaros',
    rollType: 'MS',
    awardedAt: new Date('2024-01-23T20:50:00Z').toISOString(),
    importHash: 'MTcwNjAzOTQwMDAwMC1Sb2d1ZXNo',
  },
]

export const Default: Story = {
  args: {
    items: sampleItems,
  },
}

export const Empty: Story = {
  args: {
    items: [],
  },
}

export const SingleItem: Story = {
  args: {
    items: [sampleItems[0]!],
  },
}

export const ManyItems: Story = {
  args: {
    items: [
      ...sampleItems,
      ...sampleItems.map((item, i) => ({
        ...item,
        characterName: `${item.characterName}${i}`,
        importHash: `${item.importHash}${i}`,
      })),
      ...sampleItems.map((item, i) => ({
        ...item,
        characterName: `Alt${i}`,
        importHash: `alt${item.importHash}${i}`,
      })),
    ],
  },
}

export const WithoutItemIds: Story = {
  args: {
    items: sampleItems.map(item => ({
      ...item,
      itemId: undefined,
    })),
  },
}

export const WithoutRollTypes: Story = {
  args: {
    items: sampleItems.map(item => ({
      ...item,
      rollType: undefined,
    })),
  },
}

export const WithoutSources: Story = {
  args: {
    items: sampleItems.map(item => ({
      ...item,
      source: undefined,
    })),
  },
}

export const MinimalData: Story = {
  args: {
    items: [
      {
        characterName: 'PlayerName',
        itemName: 'Some Epic Item',
        awardedAt: new Date().toISOString(),
        importHash: 'abc123',
      },
      {
        characterName: 'AnotherPlayer',
        itemName: 'Another Item',
        awardedAt: new Date().toISOString(),
        importHash: 'def456',
      },
    ],
  },
}
