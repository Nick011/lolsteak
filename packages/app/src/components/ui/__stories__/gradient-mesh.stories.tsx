import type { Meta, StoryObj } from '@storybook/react'
import { GradientMesh, GradientMeshStatic } from '../gradient-mesh'
import { Card, CardHeader, CardTitle, CardContent } from '../card'
import { Button } from '../button'

/**
 * GradientMesh - Soft Glow Design System
 *
 * Animated gradient mesh background with floating blob shapes.
 * Uses GSAP for smooth, performant animations. Perfect for
 * creating dreamy, flowing background atmospheres.
 */
const meta: Meta<typeof GradientMesh> = {
  title: 'UI/GradientMesh',
  component: GradientMesh,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    blobCount: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Number of animated blob shapes',
    },
    animated: {
      control: 'boolean',
      description: 'Enable/disable animations',
    },
    speed: {
      control: { type: 'range', min: 0.1, max: 2, step: 0.1 },
      description: 'Animation speed multiplier',
    },
    noise: {
      control: 'boolean',
      description: 'Add noise texture overlay',
    },
    fixed: {
      control: 'boolean',
      description: 'Fixed position fullscreen background',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// === Basic ===

export const Default: Story = {
  render: () => (
    <div className="relative w-full h-[500px]">
      <GradientMesh />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Soft Glow</h1>
      </div>
    </div>
  ),
}

export const Static: Story = {
  render: () => (
    <div className="relative w-full h-[500px]">
      <GradientMeshStatic />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Static Version</h1>
      </div>
    </div>
  ),
}

// === Configurations ===

export const FewBlobs: Story = {
  render: () => (
    <div className="relative w-full h-[500px]">
      <GradientMesh blobCount={3} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/80">3 blobs - subtle effect</p>
      </div>
    </div>
  ),
}

export const ManyBlobs: Story = {
  render: () => (
    <div className="relative w-full h-[500px]">
      <GradientMesh blobCount={8} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/80">8 blobs - rich atmosphere</p>
      </div>
    </div>
  ),
}

export const SlowAnimation: Story = {
  render: () => (
    <div className="relative w-full h-[500px]">
      <GradientMesh speed={0.3} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/80">Slow & dreamy</p>
      </div>
    </div>
  ),
}

export const FastAnimation: Story = {
  render: () => (
    <div className="relative w-full h-[500px]">
      <GradientMesh speed={1.5} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/80">Energetic motion</p>
      </div>
    </div>
  ),
}

export const NoNoise: Story = {
  render: () => (
    <div className="relative w-full h-[500px]">
      <GradientMesh noise={false} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/80">Clean, no noise texture</p>
      </div>
    </div>
  ),
}

// === Use Cases ===

export const HeroSection: Story = {
  render: () => (
    <div className="relative w-full h-[600px] overflow-hidden">
      <GradientMesh blobCount={6} speed={0.5} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Shadow Covenant
        </h1>
        <p className="text-xl text-[rgba(var(--glow-text-secondary))] mb-8 max-w-md">
          Unite your guild. Conquer together.
        </p>
        <div className="flex gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="glass" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  ),
}

export const LoginPage: Story = {
  render: () => (
    <div className="relative w-full h-[600px] overflow-hidden">
      <GradientMesh blobCount={4} speed={0.4} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[rgba(var(--glow-text-secondary))]">
                Email
              </label>
              <div className="h-11 rounded-xl bg-[rgba(var(--glow-abyss),0.6)] border border-[rgba(var(--glow-border),0.3)]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[rgba(var(--glow-text-secondary))]">
                Password
              </label>
              <div className="h-11 rounded-xl bg-[rgba(var(--glow-abyss),0.6)] border border-[rgba(var(--glow-border),0.3)]" />
            </div>
            <Button className="w-full">Sign In</Button>
            <p className="text-center text-sm text-[rgba(var(--glow-text-muted))]">
              Don&apos;t have an account?{' '}
              <span className="text-[rgb(var(--glow-lavender))]">Sign up</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
}

export const DashboardBackground: Story = {
  render: () => (
    <div className="relative w-full h-[600px] overflow-hidden">
      <GradientMesh blobCount={5} speed={0.3} />
      <div className="absolute inset-0 p-6">
        <div className="grid grid-cols-3 gap-4 h-full">
          <Card variant="glass" className="col-span-2">
            <CardHeader>
              <CardTitle>Guild Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 rounded-lg bg-[rgba(var(--glow-abyss),0.4)] border border-[rgba(var(--glow-border),0.2)]" />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base">Members</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">42</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base">Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),
}

// === Showcase ===

export const Comparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 w-full h-[400px]">
      <div className="relative">
        <GradientMesh animated />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white font-medium">Animated</p>
        </div>
      </div>
      <div className="relative">
        <GradientMeshStatic />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white font-medium">Static</p>
        </div>
      </div>
    </div>
  ),
}
