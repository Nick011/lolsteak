import type { Meta, StoryObj } from '@storybook/react'
import { SoftReserveForm } from '../soft-reserve-form'

const meta = {
  title: 'Events/SoftReserveForm',
  component: SoftReserveForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SoftReserveForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    eventId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    characterId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  },
}

export const WithCallback: Story = {
  args: {
    eventId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    characterId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    onSuccess: () => {
      console.log('Soft reserve added successfully!')
    },
  },
}
