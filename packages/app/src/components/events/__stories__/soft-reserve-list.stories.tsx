import type { Meta, StoryObj } from '@storybook/react'
import { SoftReserveList } from '../soft-reserve-list'

const meta = {
  title: 'Events/SoftReserveList',
  component: SoftReserveList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SoftReserveList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    eventId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  },
}

export const WithCurrentMember: Story = {
  args: {
    eventId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    currentMemberId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  },
}
