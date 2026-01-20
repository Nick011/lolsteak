import type { Meta, StoryObj } from '@storybook/react'
import { RoleBadges } from '../../roster/role-badges'

const meta: Meta<typeof RoleBadges> = {
  title: 'Roster/RoleBadges',
  component: RoleBadges,
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
      <div className="min-w-96 p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const SingleRole: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Raider',
        color: 'green',
      },
    ],
  },
}

export const MultipleRoles: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Raider',
        color: 'green',
      },
      {
        id: 'role-2',
        name: 'Officer',
        color: 'purple',
      },
      {
        id: 'role-3',
        name: 'Recruiter',
        color: 'blue',
      },
    ],
  },
}

export const EmptyRoles: Story = {
  args: {
    roles: [],
  },
}

export const AllRoleColors: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Red Role',
        color: 'red',
      },
      {
        id: 'role-2',
        name: 'Blue Role',
        color: 'blue',
      },
      {
        id: 'role-3',
        name: 'Green Role',
        color: 'green',
      },
      {
        id: 'role-4',
        name: 'Purple Role',
        color: 'purple',
      },
      {
        id: 'role-5',
        name: 'Yellow Role',
        color: 'yellow',
      },
      {
        id: 'role-6',
        name: 'Pink Role',
        color: 'pink',
      },
      {
        id: 'role-7',
        name: 'Orange Role',
        color: 'orange',
      },
      {
        id: 'role-8',
        name: 'Slate Role',
        color: 'slate',
      },
    ],
  },
}

export const RedRoles: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'DPS',
        color: 'red',
      },
      {
        id: 'role-2',
        name: 'Damage Dealer',
        color: 'red',
      },
    ],
  },
}

export const BlueRoles: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Tank',
        color: 'blue',
      },
      {
        id: 'role-2',
        name: 'Main Tank',
        color: 'blue',
      },
    ],
  },
}

export const GreenRoles: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Healer',
        color: 'green',
      },
      {
        id: 'role-2',
        name: 'Raid Healer',
        color: 'green',
      },
    ],
  },
}

export const PurpleRoles: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Officer',
        color: 'purple',
      },
      {
        id: 'role-2',
        name: 'Leadership',
        color: 'purple',
      },
    ],
  },
}

export const YellowRoles: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Guild Master',
        color: 'yellow',
      },
      {
        id: 'role-2',
        name: 'Admin',
        color: 'yellow',
      },
    ],
  },
}

export const MixedColorRoles: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Main Tank',
        color: 'blue',
        permissions: ['kick', 'invite'],
      },
      {
        id: 'role-2',
        name: 'Raid Leader',
        color: 'purple',
        permissions: ['edit_events'],
      },
      {
        id: 'role-3',
        name: 'Social',
        color: 'green',
        permissions: ['view_members'],
      },
      {
        id: 'role-4',
        name: 'Crafter',
        color: 'orange',
        permissions: [],
      },
    ],
  },
}

export const LongRoleName: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Very Long Role Name That Might Wrap',
        color: 'purple',
      },
    ],
  },
}

export const ManyRoles: Story = {
  args: {
    roles: [
      { id: '1', name: 'Role 1', color: 'red' },
      { id: '2', name: 'Role 2', color: 'blue' },
      { id: '3', name: 'Role 3', color: 'green' },
      { id: '4', name: 'Role 4', color: 'purple' },
      { id: '5', name: 'Role 5', color: 'yellow' },
      { id: '6', name: 'Role 6', color: 'pink' },
      { id: '7', name: 'Role 7', color: 'orange' },
      { id: '8', name: 'Role 8', color: 'slate' },
      { id: '9', name: 'Role 9', color: 'red' },
      { id: '10', name: 'Role 10', color: 'blue' },
    ],
  },
}

export const UnknownColor: Story = {
  args: {
    roles: [
      {
        id: 'role-1',
        name: 'Unknown Color',
        color: 'unknown',
      },
    ],
  },
}
