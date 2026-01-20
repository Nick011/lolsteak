import type { Meta, StoryObj } from '@storybook/react'
import { Input, Textarea } from '../input'
import { Label } from '../label'

/**
 * Input & Textarea - Soft Glow Design System
 *
 * Glassmorphism inputs with animated focus states and soft glow effects.
 * Features scale animation on focus and error state styling.
 */
const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// === Basic ===

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
  decorators: [
    Story => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input type="email" id="email" placeholder="you@example.com" />
    </div>
  ),
}

export const WithValue: Story = {
  args: {
    defaultValue: 'shadow.covenant@guild.gg',
  },
  decorators: [
    Story => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
}

// === States ===

export const Error: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="error-input">Guild Name</Label>
      <Input
        id="error-input"
        error
        defaultValue="x"
        placeholder="Enter guild name"
      />
      <p className="text-xs text-red-400">
        Guild name must be at least 3 characters
      </p>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
  decorators: [
    Story => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
}

// === With Icons ===

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const MailIcon = () => (
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
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const EyeIcon = () => (
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
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const WithLeftIcon: Story = {
  render: () => (
    <div className="w-[300px]">
      <Input placeholder="Search members..." leftElement={<SearchIcon />} />
    </div>
  ),
}

export const WithRightIcon: Story = {
  render: () => (
    <div className="w-[300px]">
      <Input
        type="password"
        placeholder="Enter password"
        rightElement={<EyeIcon />}
      />
    </div>
  ),
}

export const WithBothIcons: Story = {
  render: () => (
    <div className="w-[300px]">
      <Input
        type="email"
        placeholder="Email address"
        leftElement={<MailIcon />}
        rightElement={
          <span className="text-[10px] text-[rgb(var(--glow-mint))]">
            verified
          </span>
        }
      />
    </div>
  ),
}

// === Input Types ===

export const Password: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="Enter password"
        rightElement={<EyeIcon />}
      />
    </div>
  ),
}

export const Number: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="level">Character Level</Label>
      <Input
        id="level"
        type="number"
        placeholder="60"
        min={1}
        max={70}
        defaultValue={60}
      />
    </div>
  ),
}

// === Textarea ===

export const TextareaDefault: Story = {
  render: () => (
    <div className="w-[400px]">
      <Textarea placeholder="Write a message to your guild..." />
    </div>
  ),
}

export const TextareaWithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="bio">Guild Description</Label>
      <Textarea
        id="bio"
        placeholder="Tell us about your guild..."
        defaultValue="Shadow Covenant is a hardcore raiding guild focused on server-first progression. We value dedication, teamwork, and having fun while pushing content."
      />
    </div>
  ),
}

export const TextareaError: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" error placeholder="Required field" />
      <p className="text-xs text-red-400">This field is required</p>
    </div>
  ),
}

// === Form Example ===

export const FormExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 glass-panel p-6 rounded-2xl">
      <h3 className="text-lg font-semibold text-white">Create Event</h3>
      <div className="space-y-2">
        <Label htmlFor="event-name">Event Name</Label>
        <Input id="event-name" placeholder="e.g., Molten Core Raid" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-date">Date & Time</Label>
        <Input id="event-date" type="datetime-local" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-desc">Description</Label>
        <Textarea
          id="event-desc"
          placeholder="Add event details, requirements, etc."
        />
      </div>
    </div>
  ),
}

// === Showcase ===

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input placeholder="Default" />
      <Input placeholder="With left icon" leftElement={<SearchIcon />} />
      <Input
        placeholder="With right icon"
        rightElement={<span className="text-xs">@guild.gg</span>}
      />
      <Input error placeholder="Error state" defaultValue="invalid" />
      <Input disabled placeholder="Disabled" />
    </div>
  ),
}
