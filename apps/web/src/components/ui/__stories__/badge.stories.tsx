import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../badge'

/**
 * Badge - Soft Glow Design System
 *
 * Pill-shaped badges with glassmorphism and subtle glow effects.
 * Multiple color variants matching the pastel accent spectrum.
 */
const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'mint',
        'peach',
        'blush',
        'sky',
        'destructive',
        'outline',
        'solid-lavender',
        'solid-mint',
        'solid-peach',
      ],
      description: 'Color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Size variant',
    },
    dot: {
      control: 'boolean',
      description: 'Show animated dot indicator',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// === Default Variants ===

export const Default: Story = {
  args: {
    children: 'Default',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

// === Accent Colors ===

export const Mint: Story = {
  args: {
    variant: 'mint',
    children: 'Success',
  },
}

export const Peach: Story = {
  args: {
    variant: 'peach',
    children: 'Warning',
  },
}

export const Blush: Story = {
  args: {
    variant: 'blush',
    children: 'Special',
  },
}

export const Sky: Story = {
  args: {
    variant: 'sky',
    children: 'Info',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Error',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

// === Solid Variants ===

export const SolidLavender: Story = {
  args: {
    variant: 'solid-lavender',
    children: 'Solid',
  },
}

export const SolidMint: Story = {
  args: {
    variant: 'solid-mint',
    children: 'Solid Mint',
  },
}

export const SolidPeach: Story = {
  args: {
    variant: 'solid-peach',
    children: 'Solid Peach',
  },
}

// === Sizes ===

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

// === With Dot ===

export const WithDot: Story = {
  args: {
    dot: true,
    children: 'Active',
  },
}

export const MintWithDot: Story = {
  args: {
    variant: 'mint',
    dot: true,
    children: 'Online',
  },
}

export const DestructiveWithDot: Story = {
  args: {
    variant: 'destructive',
    dot: true,
    children: 'Urgent',
  },
}

// === Use Cases ===

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="mint" dot>
        Online
      </Badge>
      <Badge variant="peach" dot>
        Away
      </Badge>
      <Badge variant="secondary">Offline</Badge>
      <Badge variant="destructive" dot>
        Do Not Disturb
      </Badge>
    </div>
  ),
}

export const RoleBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="solid-lavender">Guild Master</Badge>
      <Badge variant="solid-mint">Officer</Badge>
      <Badge variant="default">Raider</Badge>
      <Badge variant="secondary">Member</Badge>
    </div>
  ),
}

export const ClassBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="mint">Healer</Badge>
      <Badge variant="peach">Tank</Badge>
      <Badge variant="destructive">DPS</Badge>
      <Badge variant="sky">Support</Badge>
    </div>
  ),
}

export const TagBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" size="sm">
        PvE
      </Badge>
      <Badge variant="outline" size="sm">
        Hardcore
      </Badge>
      <Badge variant="outline" size="sm">
        NA-West
      </Badge>
      <Badge variant="outline" size="sm">
        18+
      </Badge>
    </div>
  ),
}

// === Showcase ===

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-[rgba(var(--glow-text-muted))] mb-2">
          Glass Variants
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="mint">Mint</Badge>
          <Badge variant="peach">Peach</Badge>
          <Badge variant="blush">Blush</Badge>
          <Badge variant="sky">Sky</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
      <div>
        <p className="text-xs text-[rgba(var(--glow-text-muted))] mb-2">
          Solid Variants
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="solid-lavender">Lavender</Badge>
          <Badge variant="solid-mint">Mint</Badge>
          <Badge variant="solid-peach">Peach</Badge>
        </div>
      </div>
      <div>
        <p className="text-xs text-[rgba(var(--glow-text-muted))] mb-2">
          Sizes
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm">Small</Badge>
          <Badge size="default">Default</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>
      <div>
        <p className="text-xs text-[rgba(var(--glow-text-muted))] mb-2">
          With Dots
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge dot>Default</Badge>
          <Badge variant="mint" dot>
            Mint
          </Badge>
          <Badge variant="peach" dot>
            Peach
          </Badge>
          <Badge variant="destructive" dot>
            Alert
          </Badge>
        </div>
      </div>
    </div>
  ),
}
