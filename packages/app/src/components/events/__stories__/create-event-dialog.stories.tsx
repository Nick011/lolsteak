import type { Meta, StoryObj } from '@storybook/react'
import { CreateEventDialog } from '../create-event-dialog'
import { useState } from 'react'
import { Button } from '~/components/ui/button'

const meta: Meta<typeof CreateEventDialog> = {
  title: 'Events/CreateEventDialog',
  component: CreateEventDialog,
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
      <div className="min-h-screen w-screen flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Wrapper component to control dialog state
function DialogWrapper({ open: initialOpen = false }) {
  const [open, setOpen] = useState(initialOpen)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Create Event Dialog</Button>
      <CreateEventDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export const Closed: Story = {
  render: () => <DialogWrapper open={false} />,
}

export const Open: Story = {
  render: () => <DialogWrapper open={true} />,
}

export const OpenWithButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Create New Event
        </Button>
        <CreateEventDialog open={open} onOpenChange={setOpen} />
      </>
    )
  },
}

// Note: The following stories would ideally show validation errors and loading states,
// but since the form is controlled by react-hook-form and tRPC, we'd need to mock
// those dependencies. For now, these serve as placeholders for documentation.

export const WithValidationErrors: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'To see validation errors, try submitting the form without filling required fields (Event Name and Event Type). The form uses Zod validation with react-hook-form.',
      },
    },
  },
}

export const LoadingState: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'When the form is submitting, the "Create Event" button shows "Creating..." and is disabled. This happens automatically when the tRPC mutation is in progress.',
      },
    },
  },
}

export const WithRoleRequirements: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Click the "+ Role Requirements (Optional)" button to expand the section where you can specify how many tanks, healers, and DPS are needed for the event.',
      },
    },
  },
}

// Story showing the form in different states through interactions
export const InteractiveDemo: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div className="space-y-4">
        <div className="text-white text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">Interactive Demo</h3>
          <p className="text-sm text-slate-400">
            Try filling out the form to see validation in action
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {open ? 'Dialog is Open' : 'Open Dialog'}
        </Button>
        <CreateEventDialog open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

export const PrefilledExample: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Example showing what a completed form might look like. Fill in:\n\n' +
          '- Event Name: "Blackrock Foundry - Heroic"\n' +
          '- Event Type: "Raid"\n' +
          '- Description: "Weekly heroic raid..."\n' +
          '- Start Date/Time: (2 days from now)\n' +
          '- Location: "Blackrock Foundry"\n' +
          '- Max Participants: 40\n' +
          '- Tanks: 2, Healers: 5, DPS: 33',
      },
    },
  },
}

export const RaidEvent: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Create a raid event. Typical values:\n\n' +
          '- Event Type: Raid\n' +
          '- Max Participants: 10, 25, or 40\n' +
          '- Location: Instance name\n' +
          '- Role Requirements: Yes (tanks, healers, DPS)',
      },
    },
  },
}

export const DungeonEvent: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Create a dungeon event. Typical values:\n\n' +
          '- Event Type: Dungeon\n' +
          '- Max Participants: 5\n' +
          '- Location: Dungeon name\n' +
          '- Role Requirements: Optional (1 tank, 1 healer, 3 DPS)',
      },
    },
  },
}

export const PvPEvent: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Create a PvP event. Typical values:\n\n' +
          '- Event Type: PvP\n' +
          '- Max Participants: Usually no limit\n' +
          '- Location: Arena or battleground name\n' +
          '- Role Requirements: Usually not needed',
      },
    },
  },
}

export const SocialEvent: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Create a social event. Typical values:\n\n' +
          '- Event Type: Social\n' +
          '- Max Participants: Usually no limit\n' +
          '- Location: City, zone, or "Discord"\n' +
          '- Role Requirements: Not applicable',
      },
    },
  },
}

export const MobileView: Story = {
  render: () => <DialogWrapper open={true} />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'The dialog is responsive and works well on mobile devices. The form fields stack vertically on small screens.',
      },
    },
  },
}
