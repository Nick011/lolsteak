import type { Meta, StoryObj } from '@storybook/react'
import { CharacterList } from '../../roster/character-list'

const meta: Meta<typeof CharacterList> = {
  title: 'Roster/CharacterList',
  component: CharacterList,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const MultipleCharactersWithMain: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Thunderfist',
        class: 'Warrior',
        level: 70,
        itemLevel: 489,
        isMain: true,
        realm: 'Stormrage',
      },
      {
        id: 'char-2',
        name: 'Frostbolt',
        class: 'Mage',
        level: 70,
        itemLevel: 476,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-3',
        name: 'Shadowstrike',
        class: 'Rogue',
        level: 68,
        itemLevel: 445,
        isMain: false,
        realm: 'Stormrage',
      },
    ],
  },
}

export const SingleCharacter: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Holybringer',
        class: 'Priest',
        level: 70,
        itemLevel: 492,
        isMain: true,
        realm: 'Stormrage',
      },
    ],
  },
}

export const EmptyState: Story = {
  args: {
    characters: [],
  },
}

export const CharactersWithoutItemLevel: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Newbie',
        class: 'Hunter',
        level: 25,
        isMain: true,
        realm: 'Stormrage',
      },
      {
        id: 'char-2',
        name: 'Altchar',
        class: 'Warlock',
        level: 15,
        isMain: false,
        realm: 'Stormrage',
      },
    ],
  },
}

export const CharactersWithoutRealm: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Mystery',
        class: 'Druid',
        level: 70,
        itemLevel: 480,
        isMain: true,
      },
      {
        id: 'char-2',
        name: 'Unknown',
        class: 'Shaman',
        level: 70,
        itemLevel: 465,
        isMain: false,
      },
    ],
  },
}

export const AllClasses: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'MainTank',
        class: 'Death Knight',
        level: 70,
        itemLevel: 495,
        isMain: true,
        realm: 'Stormrage',
      },
      {
        id: 'char-2',
        name: 'Havoc',
        class: 'Demon Hunter',
        level: 70,
        itemLevel: 485,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-3',
        name: 'Moonkin',
        class: 'Druid',
        level: 70,
        itemLevel: 480,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-4',
        name: 'Wyrmbinder',
        class: 'Evoker',
        level: 70,
        itemLevel: 475,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-5',
        name: 'Huntmaster',
        class: 'Hunter',
        level: 70,
        itemLevel: 470,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-6',
        name: 'Frostfire',
        class: 'Mage',
        level: 70,
        itemLevel: 488,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-7',
        name: 'Brewmaster',
        class: 'Monk',
        level: 70,
        itemLevel: 482,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-8',
        name: 'HolyShield',
        class: 'Paladin',
        level: 70,
        itemLevel: 490,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-9',
        name: 'Holybringer',
        class: 'Priest',
        level: 70,
        itemLevel: 492,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-10',
        name: 'Backstab',
        class: 'Rogue',
        level: 70,
        itemLevel: 478,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-11',
        name: 'Totemcaller',
        class: 'Shaman',
        level: 70,
        itemLevel: 483,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-12',
        name: 'Shadowfiend',
        class: 'Warlock',
        level: 70,
        itemLevel: 486,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-13',
        name: 'Shieldwall',
        class: 'Warrior',
        level: 70,
        itemLevel: 494,
        isMain: false,
        realm: 'Stormrage',
      },
    ],
  },
}

export const LowLevelCharacters: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Starter',
        class: 'Hunter',
        level: 10,
        isMain: true,
        realm: 'Stormrage',
      },
      {
        id: 'char-2',
        name: 'Beginner',
        class: 'Mage',
        level: 5,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-3',
        name: 'Newb',
        class: 'Warrior',
        level: 1,
        isMain: false,
        realm: 'Stormrage',
      },
    ],
  },
}

export const HighItemLevel: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Mythic',
        class: 'Paladin',
        level: 70,
        itemLevel: 510,
        isMain: true,
        realm: 'Stormrage',
      },
      {
        id: 'char-2',
        name: 'Heroic',
        class: 'Priest',
        level: 70,
        itemLevel: 505,
        isMain: false,
        realm: 'Stormrage',
      },
    ],
  },
}

export const ManyCharacters: Story = {
  args: {
    characters: Array.from({ length: 20 }, (_, i) => ({
      id: `char-${i}`,
      name: `Character${i + 1}`,
      class: ['Warrior', 'Mage', 'Priest', 'Paladin', 'Hunter'][i % 5],
      level: 60 + i,
      itemLevel: 400 + i * 5,
      isMain: i === 0,
      realm: 'Stormrage',
    })),
  },
}

export const NoMainCharacter: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Alt1',
        class: 'Warrior',
        level: 70,
        itemLevel: 480,
        isMain: false,
        realm: 'Stormrage',
      },
      {
        id: 'char-2',
        name: 'Alt2',
        class: 'Mage',
        level: 70,
        itemLevel: 475,
        isMain: false,
        realm: 'Stormrage',
      },
    ],
  },
}

export const LongCharacterNames: Story = {
  args: {
    characters: [
      {
        id: 'char-1',
        name: 'Verylongcharactername',
        class: 'Death Knight',
        level: 70,
        itemLevel: 490,
        isMain: true,
        realm: 'Realm-With-Very-Long-Name',
      },
      {
        id: 'char-2',
        name: 'Anotherverylongname',
        class: 'Demon Hunter',
        level: 70,
        itemLevel: 485,
        isMain: false,
        realm: 'Realm-With-Very-Long-Name',
      },
    ],
  },
}
