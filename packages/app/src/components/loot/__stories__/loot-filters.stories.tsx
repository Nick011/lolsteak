import type { Meta, StoryObj } from '@storybook/react'
import { LootFilters } from '../loot-filters'

const meta: Meta<typeof LootFilters> = {
  title: 'Components/Loot/LootFilters',
  component: LootFilters,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  args: {
    onSearchChange: () => {},
    onCharacterChange: () => {},
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockCharacters = [
  { id: '1', name: 'Gandalf', class: 'mage' },
  { id: '2', name: 'Arthas', class: 'warrior' },
  { id: '3', name: 'Thrall', class: 'shaman' },
  { id: '4', name: 'Rexxar', class: 'hunter' },
  { id: '5', name: 'Uther', class: 'paladin' },
  { id: '6', name: 'Jaina', class: 'mage' },
  { id: '7', name: 'Sylvanas', class: 'hunter' },
  { id: '8', name: 'Malfurion', class: 'druid' },
]

export const Default: Story = {
  args: {
    characters: mockCharacters,
    searchValue: '',
    characterId: undefined,
  },
}

export const WithSearch: Story = {
  args: {
    characters: mockCharacters,
    searchValue: 'Thunderfury',
    characterId: undefined,
  },
}

export const WithCharacterFilter: Story = {
  args: {
    characters: mockCharacters,
    searchValue: '',
    characterId: '2',
  },
}

export const WithBothFilters: Story = {
  args: {
    characters: mockCharacters,
    searchValue: 'Sulfuras',
    characterId: '3',
  },
}

export const NoCharacters: Story = {
  args: {
    characters: [],
    searchValue: '',
    characterId: undefined,
  },
}
