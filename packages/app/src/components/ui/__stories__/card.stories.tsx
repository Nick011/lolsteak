import type { Meta, StoryObj } from '@storybook/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card'
import { Button } from '../button'
import { Badge } from '../badge'

/**
 * Card - Soft Glow Design System
 *
 * Glassmorphism cards with subtle animations and glow effects.
 * Features floating appearance with soft shadows and gradient borders.
 */
const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'glass', 'outlined'],
      description: 'Visual style variant',
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover lift animation',
    },
    glowBorder: {
      control: 'boolean',
      description: 'Add animated gradient border',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// === Variants ===

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Default Card</CardTitle>
        <CardDescription>Standard glassmorphism style</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
          This is the default card variant with subtle glass effect and soft
          shadows.
        </p>
      </CardContent>
    </Card>
  ),
}

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-[350px]">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>More prominent glass effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
          Enhanced backdrop blur and deeper shadows for emphasis.
        </p>
      </CardContent>
    </Card>
  ),
}

export const Glass: Story = {
  render: () => (
    <Card variant="glass" className="w-[350px]">
      <CardHeader>
        <CardTitle>Glass Card</CardTitle>
        <CardDescription>Pure glassmorphism</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
          Maximum blur and transparency for dreamy effect.
        </p>
      </CardContent>
    </Card>
  ),
}

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" className="w-[350px]">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>Minimal border style</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
          Transparent background with subtle border accent.
        </p>
      </CardContent>
    </Card>
  ),
}

// === Interactive ===

export const Hoverable: Story = {
  render: () => (
    <Card hoverable className="w-[350px]">
      <CardHeader>
        <CardTitle>Hover Me</CardTitle>
        <CardDescription>Interactive card with lift effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
          This card lifts and glows on hover. Perfect for clickable items.
        </p>
      </CardContent>
    </Card>
  ),
}

export const WithGlowBorder: Story = {
  render: () => (
    <Card glowBorder className="w-[350px]">
      <CardHeader>
        <CardTitle>Glow Border</CardTitle>
        <CardDescription>Animated gradient border</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
          Features an animated gradient border for extra visual interest.
        </p>
      </CardContent>
    </Card>
  ),
}

export const HoverableWithGlow: Story = {
  render: () => (
    <Card hoverable glowBorder className="w-[350px]">
      <CardHeader>
        <CardTitle>Premium Card</CardTitle>
        <CardDescription>All effects combined</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
          Combines hover lift animation with animated gradient border.
        </p>
      </CardContent>
    </Card>
  ),
}

// === Use Cases ===

export const GuildCard: Story = {
  render: () => (
    <Card hoverable className="w-[350px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Shadow Covenant</CardTitle>
            <CardDescription>World of Warcraft Classic</CardDescription>
          </div>
          <Badge variant="mint">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[rgba(var(--glow-text-muted))]">Members</span>
            <span className="text-white">42 / 50</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[rgba(var(--glow-text-muted))]">
              Next Raid
            </span>
            <span className="text-white">Tonight @ 8PM</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" size="sm">
              PvE
            </Badge>
            <Badge variant="secondary" size="sm">
              Hardcore
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="secondary">
          View Guild
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const CreateGuild: Story = {
  render: () => (
    <Card variant="elevated" className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-xl">Create Your Guild</CardTitle>
        <CardDescription>
          Start a new guild to organize your team, track events, and manage loot
          distribution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--glow-lavender))] to-[rgb(var(--glow-blush))] flex items-center justify-center">
                <span className="text-[rgb(var(--glow-void))] font-bold">
                  +
                </span>
              </div>
              <div>
                <p className="text-white font-medium">Multi-game support</p>
                <p className="text-xs text-[rgba(var(--glow-text-muted))]">
                  WoW, FF14, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button className="flex-1">Create Guild</Button>
      </CardFooter>
    </Card>
  ),
}

export const NotificationCard: Story = {
  render: () => (
    <Card variant="glass" className="w-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Notifications</CardTitle>
          <Badge variant="blush" size="sm">
            3 new
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3 items-start">
          <div className="w-2 h-2 rounded-full bg-[rgb(var(--glow-mint))] mt-2 animate-pulse" />
          <div>
            <p className="text-sm text-white">Raid scheduled for tonight</p>
            <p className="text-xs text-[rgba(var(--glow-text-muted))]">
              2 mins ago
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-2 h-2 rounded-full bg-[rgb(var(--glow-lavender))] mt-2 animate-pulse" />
          <div>
            <p className="text-sm text-white">New member joined</p>
            <p className="text-xs text-[rgba(var(--glow-text-muted))]">
              1 hour ago
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-2 h-2 rounded-full bg-[rgb(var(--glow-peach))] mt-2 animate-pulse" />
          <div>
            <p className="text-sm text-white">Loot distributed</p>
            <p className="text-xs text-[rgba(var(--glow-text-muted))]">
              3 hours ago
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
}

// === Showcase ===

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle className="text-base">Default</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
            Standard variant
          </p>
        </CardContent>
      </Card>
      <Card variant="elevated" className="w-[250px]">
        <CardHeader>
          <CardTitle className="text-base">Elevated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
            More prominent
          </p>
        </CardContent>
      </Card>
      <Card variant="glass" className="w-[250px]">
        <CardHeader>
          <CardTitle className="text-base">Glass</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
            Pure glass effect
          </p>
        </CardContent>
      </Card>
      <Card variant="outlined" className="w-[250px]">
        <CardHeader>
          <CardTitle className="text-base">Outlined</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgba(var(--glow-text-secondary))]">
            Border only
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}
