import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button'

/**
 * Button - Soft Glow Design System
 *
 * Glassmorphism buttons with animated glow effects, gradient backgrounds,
 * and spring physics animations. Features multiple accent colors and
 * a pure glass variant.
 */
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
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
        'outline',
        'ghost',
        'link',
        'destructive',
        'mint',
        'peach',
        'glass',
      ],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
      description: 'Size variant',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// === Primary Variants ===

export const Default: Story = {
  args: {
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
}

// === Accent Variants ===

export const Mint: Story = {
  args: {
    variant: 'mint',
    children: 'Mint Accent',
  },
}

export const Peach: Story = {
  args: {
    variant: 'peach',
    children: 'Peach Accent',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
}

// === Special Variants ===

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: 'Glass Effect',
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

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large',
  },
}

// === Icon Buttons ===

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

export const IconButton: Story = {
  args: {
    size: 'icon',
    variant: 'secondary',
    children: <HeartIcon />,
  },
}

export const IconButtonSmall: Story = {
  args: {
    size: 'icon-sm',
    variant: 'outline',
    children: <HeartIcon />,
  },
}

export const IconButtonLarge: Story = {
  args: {
    size: 'icon-lg',
    variant: 'glass',
    children: <HeartIcon />,
  },
}

// === States ===

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <ArrowIcon />
        Continue
      </>
    ),
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

// === Showcase ===

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="mint">Mint</Button>
        <Button variant="peach">Peach</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="glass">Glass</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>
    </div>
  ),
}
