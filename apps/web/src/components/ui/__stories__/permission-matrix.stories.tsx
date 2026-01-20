import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
  PermissionMatrix,
  type RolePermissions,
} from '../../settings/permission-matrix'

const meta: Meta<typeof PermissionMatrix> = {
  title: 'Settings/PermissionMatrix',
  component: PermissionMatrix,
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
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Interactive wrapper component
function InteractivePermissionMatrix(props: {
  permissions: RolePermissions
  disabled?: boolean
}) {
  const [permissions, setPermissions] = useState<RolePermissions>(
    props.permissions
  )
  return (
    <PermissionMatrix
      permissions={permissions}
      onChange={setPermissions}
      disabled={props.disabled}
    />
  )
}

export const EmptyPermissions: Story = {
  render: () => <InteractivePermissionMatrix permissions={{}} />,
}

export const BasicMemberPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
        },
        roles: {
          view: true,
        },
        events: {
          view: true,
        },
        loot: {
          view: true,
        },
        announcements: {
          view: true,
        },
        settings: {
          view: false,
        },
      }}
    />
  ),
}

export const RaiderPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
        },
        roles: {
          view: true,
        },
        events: {
          view: true,
          create: true,
        },
        loot: {
          view: true,
          record: true,
        },
        announcements: {
          view: true,
          create: true,
        },
        settings: {
          view: false,
        },
      }}
    />
  ),
}

export const OfficerPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
          invite: true,
          kick: true,
          editNicknames: true,
          assignRoles: true,
        },
        roles: {
          view: true,
          create: true,
          edit: true,
          delete: false,
          assign: true,
        },
        events: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manageSignups: true,
        },
        loot: {
          view: true,
          record: true,
          edit: true,
          delete: false,
          import: true,
        },
        announcements: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          pin: true,
        },
        settings: {
          view: true,
          edit: false,
          manageIntegrations: false,
        },
      }}
    />
  ),
}

export const AdminPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
          invite: true,
          kick: true,
          editNicknames: true,
          assignRoles: true,
        },
        roles: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          assign: true,
        },
        events: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manageSignups: true,
        },
        loot: {
          view: true,
          record: true,
          edit: true,
          delete: true,
          import: true,
        },
        announcements: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          pin: true,
        },
        settings: {
          view: true,
          edit: true,
          manageIntegrations: true,
        },
      }}
    />
  ),
}

export const ReadOnlyPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
        },
        roles: {
          view: true,
        },
        events: {
          view: true,
        },
        loot: {
          view: true,
        },
        announcements: {
          view: true,
        },
        settings: {
          view: true,
        },
      }}
    />
  ),
}

export const SocialRolePermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
          invite: true,
        },
        roles: {
          view: true,
        },
        events: {
          view: true,
          create: true,
        },
        loot: {
          view: false,
        },
        announcements: {
          view: true,
          create: true,
        },
        settings: {
          view: false,
        },
      }}
    />
  ),
}

export const RaidLeaderPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
          assignRoles: true,
        },
        roles: {
          view: true,
          assign: true,
        },
        events: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manageSignups: true,
        },
        loot: {
          view: true,
          record: true,
          edit: true,
          import: true,
        },
        announcements: {
          view: true,
          create: true,
          edit: true,
          pin: true,
        },
        settings: {
          view: true,
        },
      }}
    />
  ),
}

export const LootMasterPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
        },
        roles: {
          view: true,
        },
        events: {
          view: true,
        },
        loot: {
          view: true,
          record: true,
          edit: true,
          delete: true,
          import: true,
        },
        announcements: {
          view: true,
        },
        settings: {
          view: false,
        },
      }}
    />
  ),
}

export const RecruiterPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
          invite: true,
          editNicknames: true,
          assignRoles: true,
        },
        roles: {
          view: true,
          assign: true,
        },
        events: {
          view: true,
        },
        loot: {
          view: false,
        },
        announcements: {
          view: true,
          create: true,
        },
        settings: {
          view: false,
        },
      }}
    />
  ),
}

export const PartialPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
          invite: true,
        },
        events: {
          view: true,
          create: true,
        },
        loot: {
          view: true,
        },
      }}
    />
  ),
}

export const DisabledState: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {
          view: true,
          invite: true,
          kick: true,
        },
        roles: {
          view: true,
          create: true,
        },
        events: {
          view: true,
          create: true,
          edit: true,
        },
      }}
      disabled={true}
    />
  ),
}

export const NoPermissions: Story = {
  render: () => (
    <InteractivePermissionMatrix
      permissions={{
        members: {},
        roles: {},
        events: {},
        loot: {},
        announcements: {},
        settings: {},
      }}
    />
  ),
}
