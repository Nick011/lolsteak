import type { Meta, StoryObj } from '@storybook/react'
import { MemberCard } from '../../roster/member-card'

const meta: Meta<typeof MemberCard> = {
  title: 'Roster/MemberCard',
  component: MemberCard,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const baseUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
}

const warriorCharacter = {
  id: 'char-1',
  name: 'Thunderfist',
  class: 'warrior',
  role: 'tank',
  level: 70,
}

const mageCharacter = {
  id: 'char-2',
  name: 'Frostbolt',
  class: 'mage',
  role: 'dps',
  level: 70,
}

const priestCharacter = {
  id: 'char-3',
  name: 'Holybringer',
  class: 'priest',
  role: 'healer',
  level: 70,
}

export const DefaultMember: Story = {
  args: {
    member: {
      id: 'member-1',
      userId: 'user-1',
      nickname: null,
      role: 'member',
      joinedAt: new Date('2024-01-15'),
      user: baseUser,
      roles: [{ id: 'role-1', name: 'Raider', color: '#10b981' }],
      mainCharacter: warriorCharacter,
    },
    isOfficer: false,
  },
}

export const OwnerMember: Story = {
  args: {
    member: {
      id: 'member-2',
      userId: 'user-2',
      nickname: null,
      role: 'owner',
      joinedAt: new Date('2023-06-01'),
      user: {
        id: 'user-2',
        name: 'Guild Master',
        email: 'gm@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GM',
      },
      roles: [
        { id: 'role-1', name: 'Admin', color: '#eab308' },
        { id: 'role-2', name: 'Raid Leader', color: '#ef4444' },
      ],
      mainCharacter: mageCharacter,
    },
    isOfficer: true,
  },
}

export const OfficerMember: Story = {
  args: {
    member: {
      id: 'member-3',
      userId: 'user-3',
      nickname: 'Officer Nick',
      role: 'officer',
      joinedAt: new Date('2023-08-10'),
      user: {
        id: 'user-3',
        name: 'Nicholas Williams',
        email: 'nick@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nick',
      },
      roles: [
        { id: 'role-1', name: 'Officer', color: '#a855f7' },
        { id: 'role-2', name: 'Recruiter', color: '#3b82f6' },
      ],
      mainCharacter: priestCharacter,
    },
    isOfficer: true,
  },
}

export const MemberWithMultipleRoles: Story = {
  args: {
    member: {
      id: 'member-4',
      userId: 'user-4',
      nickname: 'AltAholic',
      role: 'member',
      joinedAt: new Date('2024-03-20'),
      user: {
        id: 'user-4',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      roles: [
        { id: 'role-1', name: 'Raider', color: '#10b981' },
        { id: 'role-2', name: 'Social', color: '#06b6d4' },
        { id: 'role-3', name: 'Crafter', color: '#f59e0b' },
        { id: 'role-4', name: 'Achievement Hunter', color: '#8b5cf6' },
        { id: 'role-5', name: 'PvP Enthusiast', color: '#ef4444' },
      ],
      mainCharacter: {
        id: 'char-4',
        name: 'Shadowstrike',
        class: 'rogue',
        role: 'dps',
        level: 70,
      },
    },
    isOfficer: false,
  },
}

export const MemberWithMainCharacter: Story = {
  args: {
    member: {
      id: 'member-5',
      userId: 'user-5',
      nickname: null,
      role: 'member',
      joinedAt: new Date('2024-02-01'),
      user: {
        id: 'user-5',
        name: 'Tank Master',
        email: 'tank@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tank',
      },
      roles: [{ id: 'role-1', name: 'Main Tank', color: '#3b82f6' }],
      mainCharacter: {
        id: 'char-5',
        name: 'Shieldwall',
        class: 'paladin',
        role: 'tank',
        level: 70,
      },
    },
    isOfficer: false,
  },
}

export const MemberWithoutCharacters: Story = {
  args: {
    member: {
      id: 'member-6',
      userId: 'user-6',
      nickname: 'NewMember',
      role: 'member',
      joinedAt: new Date('2024-04-10'),
      user: {
        id: 'user-6',
        name: 'Fresh Player',
        email: 'fresh@example.com',
        image: null,
      },
      roles: [],
    },
    isOfficer: true,
  },
}

export const MemberWithActions: Story = {
  args: {
    member: {
      id: 'member-7',
      userId: 'user-7',
      nickname: null,
      role: 'member',
      joinedAt: new Date('2024-01-01'),
      user: {
        id: 'user-7',
        name: 'Editable User',
        email: 'edit@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edit',
      },
      roles: [{ id: 'role-1', name: 'Raider', color: '#10b981' }],
      mainCharacter: warriorCharacter,
    },
    isOfficer: true,
    onEdit: (memberId: string) => {
      console.log('Edit member:', memberId)
    },
    onKick: (memberId: string) => {
      console.log('Kick member:', memberId)
    },
  },
}

export const DeathKnightMember: Story = {
  args: {
    member: {
      id: 'member-8',
      userId: 'user-8',
      nickname: null,
      role: 'member',
      joinedAt: new Date('2024-02-14'),
      user: {
        id: 'user-8',
        name: 'Death Knight Player',
        email: 'dk@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DK',
      },
      roles: [{ id: 'role-1', name: 'DPS', color: '#ef4444' }],
      mainCharacter: {
        id: 'char-8',
        name: 'Frostmourne',
        class: 'death_knight',
        role: 'dps',
        level: 70,
      },
    },
    isOfficer: false,
  },
}
