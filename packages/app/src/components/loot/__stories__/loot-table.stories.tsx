import type { Meta, StoryObj } from '@storybook/react'
import { LootTable } from '../loot-table'

const meta = {
  title: 'Components/Loot/LootTable',
  component: LootTable,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LootTable>

export default meta
type Story = StoryObj<typeof meta>

const mockLoot = [
  {
    id: '1',
    itemName: 'Atiesh, Greatstaff of the Guardian',
    itemLink:
      '|cffff8000|Hitem:22630::::::::70:::::|h[Atiesh, Greatstaff of the Guardian]|h|r',
    itemId: 22630,
    characterName: 'Gandalf',
    character: {
      id: '1',
      name: 'Gandalf',
      class: 'mage',
    },
    source: "Kel'Thuzad",
    rollType: 'MS',
    cost: null,
    awardedAt: new Date('2024-01-15T19:30:00'),
    event: {
      id: '1',
      name: 'Naxxramas Raid',
    },
  },
  {
    id: '2',
    itemName: 'Thunderfury, Blessed Blade of the Windseeker',
    itemLink:
      '|cffff8000|Hitem:19019::::::::70:::::|h[Thunderfury, Blessed Blade of the Windseeker]|h|r',
    itemId: 19019,
    characterName: 'Arthas',
    character: {
      id: '2',
      name: 'Arthas',
      class: 'warrior',
    },
    source: 'Baron Geddon',
    rollType: 'MS',
    cost: 250,
    awardedAt: new Date('2024-01-14T20:00:00'),
    event: null,
  },
  {
    id: '3',
    itemName: 'The Eye of Sulfuras',
    itemLink:
      '|cffa335ee|Hitem:17204::::::::70:::::|h[The Eye of Sulfuras]|h|r',
    itemId: 17204,
    characterName: 'Thrall',
    character: {
      id: '3',
      name: 'Thrall',
      class: 'shaman',
    },
    source: 'Ragnaros',
    rollType: 'SR',
    cost: null,
    awardedAt: new Date('2024-01-13T19:00:00'),
    event: {
      id: '2',
      name: 'Molten Core',
    },
  },
  {
    id: '4',
    itemName: 'Chromaggus Fang',
    itemLink: '|cffa335ee|Hitem:19350::::::::70:::::|h[Chromaggus Fang]|h|r',
    itemId: 19350,
    characterName: 'Rexxar',
    character: {
      id: '4',
      name: 'Rexxar',
      class: 'hunter',
    },
    source: 'Chromaggus',
    rollType: 'Need',
    cost: 150,
    awardedAt: new Date('2024-01-12T20:30:00'),
    event: {
      id: '3',
      name: 'Blackwing Lair',
    },
  },
  {
    id: '5',
    itemName: 'Tier 3 Helm',
    itemLink: '|cffa335ee|Hitem:22513::::::::70:::::|h[Dreadnaught Helmet]|h|r',
    itemId: 22513,
    characterName: 'Uther',
    character: {
      id: '5',
      name: 'Uther',
      class: 'paladin',
    },
    source: 'Four Horsemen',
    rollType: 'MS',
    cost: null,
    awardedAt: new Date('2024-01-11T19:30:00'),
    event: {
      id: '1',
      name: 'Naxxramas Raid',
    },
  },
]

export const Default: Story = {
  args: {
    loot: mockLoot,
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    loot: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    loot: [],
    isLoading: false,
  },
}

export const SingleItem: Story = {
  args: {
    loot: [mockLoot[0]],
    isLoading: false,
  },
}

export const ManyItems: Story = {
  args: {
    loot: [
      ...mockLoot,
      ...mockLoot.map((item, i) => ({
        ...item,
        id: `${item.id}-${i}`,
        awardedAt: new Date(Date.now() - i * 86400000),
      })),
    ],
    isLoading: false,
  },
}
