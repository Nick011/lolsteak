import type { Meta, StoryObj } from '@storybook/react'
import { EventList } from '../event-list'

const meta: Meta<typeof EventList> = {
  title: 'Events/EventList',
  component: EventList,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Helper to create dates relative to now
const addHours = (hours: number) => {
  const date = new Date()
  date.setHours(date.getHours() + hours)
  return date
}

const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// Mock signups helper
const createSignups = (confirmed: number, tentative: number = 0) => {
  const signups = []
  for (let i = 0; i < confirmed; i++) {
    signups.push({
      id: `signup-${i}`,
      status: 'confirmed',
      character: {
        id: `char-${i}`,
        name: `Character${i + 1}`,
      },
    })
  }
  for (let i = 0; i < tentative; i++) {
    signups.push({
      id: `signup-tentative-${i}`,
      status: 'tentative',
      character: {
        id: `char-tentative-${i}`,
        name: `CharacterTentative${i + 1}`,
      },
    })
  }
  return signups
}

// Mock events data
const mockEvents = [
  {
    id: 'event-1',
    name: 'Blackrock Foundry - Heroic',
    description:
      'Weekly heroic raid. Be ready 15 minutes early for invites. Flasks and food mandatory.',
    eventType: 'raid' as const,
    startsAt: addDays(2),
    endsAt: addHours(2 + 48 + 3),
    location: 'Blackrock Foundry',
    maxSize: 40,
    signups: createSignups(28, 5),
  },
  {
    id: 'event-2',
    name: 'Mythic+ Weekly Keys',
    description:
      'Group up for weekly mythic+ runs. Looking for +15 and higher.',
    eventType: 'dungeon' as const,
    startsAt: addDays(1),
    endsAt: addHours(1 + 24 + 4),
    location: 'Various Dungeons',
    maxSize: 5,
    signups: createSignups(3),
  },
  {
    id: 'event-3',
    name: 'Arena Practice',
    description: '3v3 arena practice sessions. All skill levels welcome.',
    eventType: 'pvp' as const,
    startsAt: addDays(3),
    endsAt: addHours(3 + 72 + 2),
    location: 'Nagrand Arena',
    maxSize: null,
    signups: createSignups(12),
  },
  {
    id: 'event-4',
    name: 'Guild Anniversary Party',
    description:
      'Celebrating 5 years together! Transmog contest, trivia, and races.',
    eventType: 'social' as const,
    startsAt: addDays(7),
    endsAt: addHours(7 + 168 + 3),
    location: 'Stormwind City - Cathedral Square',
    maxSize: null,
    signups: createSignups(45, 8),
  },
  {
    id: 'event-5',
    name: 'Officer Meeting',
    description: 'Monthly officer meeting to discuss guild direction.',
    eventType: 'other' as const,
    startsAt: addDays(5),
    endsAt: addHours(5 + 120 + 1),
    location: 'Discord Voice',
    maxSize: 10,
    signups: createSignups(7),
  },
  {
    id: 'event-6',
    name: 'Emergency Raid - Server First',
    description: 'Last minute raid! We need all hands on deck!',
    eventType: 'raid' as const,
    startsAt: addHours(2), // Happening soon
    endsAt: addHours(6),
    location: 'Sanctum of Domination',
    maxSize: 20,
    signups: createSignups(18, 2),
  },
  {
    id: 'event-7',
    name: 'Karazhan Run',
    description: 'Finished run through Karazhan. Great success!',
    eventType: 'raid' as const,
    startsAt: addDays(-3), // Past event
    endsAt: addHours(-3 * 24 + 4),
    location: 'Karazhan',
    maxSize: 10,
    signups: createSignups(10),
  },
  {
    id: 'event-8',
    name: "Gruul's Lair Clear",
    description: 'Weekly Gruul clear for loot and badges.',
    eventType: 'raid' as const,
    startsAt: addDays(-1), // Past event
    endsAt: addHours(-1 * 24 + 2),
    location: "Gruul's Lair",
    maxSize: 25,
    signups: createSignups(22),
  },
]

export const MultipleEvents: Story = {
  args: {
    events: mockEvents,
    isOfficer: false,
  },
}

export const EmptyList: Story = {
  args: {
    events: [],
    isOfficer: false,
  },
}

export const OfficerView: Story = {
  args: {
    events: mockEvents,
    isOfficer: true,
    onCreateEvent: () => console.log('Create event clicked'),
  },
}

export const MemberView: Story = {
  args: {
    events: mockEvents,
    isOfficer: false,
  },
}

export const OnlyUpcomingEvents: Story = {
  args: {
    events: mockEvents.filter(e => new Date(e.startsAt).getTime() > Date.now()),
    isOfficer: false,
  },
}

export const OnlyPastEvents: Story = {
  args: {
    events: mockEvents.filter(e => new Date(e.startsAt).getTime() < Date.now()),
    isOfficer: false,
  },
}

export const OnlyRaidEvents: Story = {
  args: {
    events: mockEvents.filter(e => e.eventType === 'raid'),
    isOfficer: false,
  },
}

export const SingleEvent: Story = {
  args: {
    events: [mockEvents[0]],
    isOfficer: false,
  },
}

export const ManyEvents: Story = {
  args: {
    events: [
      ...mockEvents,
      {
        id: 'event-9',
        name: 'Tempest Keep Raid',
        description: 'Going after Alar and Void Reaver.',
        eventType: 'raid' as const,
        startsAt: addDays(4),
        endsAt: addHours(4 + 96 + 3),
        location: 'Tempest Keep',
        maxSize: 25,
        signups: createSignups(20),
      },
      {
        id: 'event-10',
        name: 'Battleground Night',
        description: 'Mass BGs for honor and fun.',
        eventType: 'pvp' as const,
        startsAt: addDays(6),
        endsAt: addHours(6 + 144 + 2),
        location: 'Various Battlegrounds',
        maxSize: null,
        signups: createSignups(30),
      },
      {
        id: 'event-11',
        name: 'Alt Leveling Group',
        description: 'Leveling alts together through dungeons.',
        eventType: 'social' as const,
        startsAt: addDays(8),
        endsAt: addHours(8 + 192 + 4),
        location: 'Various Zones',
        maxSize: null,
        signups: createSignups(15),
      },
      {
        id: 'event-12',
        name: 'Heroic Dungeon Marathon',
        description: 'Running all heroic dungeons for badges.',
        eventType: 'dungeon' as const,
        startsAt: addDays(9),
        endsAt: addHours(9 + 216 + 6),
        location: 'All Heroic Dungeons',
        maxSize: 5,
        signups: createSignups(5),
      },
    ],
    isOfficer: false,
  },
}

export const EmptyListOfficer: Story = {
  args: {
    events: [],
    isOfficer: true,
    onCreateEvent: () => console.log('Create event clicked'),
  },
}

export const FullEvents: Story = {
  args: {
    events: mockEvents.map(event => ({
      ...event,
      maxSize: event.maxSize || 20,
      signups: createSignups(event.maxSize || 20),
    })),
    isOfficer: false,
  },
}

export const MixedEventTypes: Story = {
  args: {
    events: [
      {
        id: 'event-raid',
        name: 'Blackrock Foundry',
        description: 'Heroic raid progression',
        eventType: 'raid' as const,
        startsAt: addDays(1),
        endsAt: addHours(1 + 24 + 3),
        location: 'Blackrock Foundry',
        maxSize: 40,
        signups: createSignups(35),
      },
      {
        id: 'event-dungeon',
        name: 'Mythic+ Push',
        description: 'Pushing high keys',
        eventType: 'dungeon' as const,
        startsAt: addDays(2),
        endsAt: addHours(2 + 48 + 2),
        location: 'Various',
        maxSize: 5,
        signups: createSignups(4),
      },
      {
        id: 'event-pvp',
        name: 'Arena Rating Push',
        description: '2v2 and 3v3 rating push',
        eventType: 'pvp' as const,
        startsAt: addDays(3),
        endsAt: addHours(3 + 72 + 3),
        location: 'Arenas',
        maxSize: 6,
        signups: createSignups(5),
      },
      {
        id: 'event-social',
        name: 'Mount Farming Party',
        description: 'Farming rare mounts together',
        eventType: 'social' as const,
        startsAt: addDays(4),
        endsAt: addHours(4 + 96 + 4),
        location: 'Various Raids',
        maxSize: null,
        signups: createSignups(20),
      },
      {
        id: 'event-other',
        name: 'Guild Bank Cleanup',
        description: 'Organizing guild bank tabs',
        eventType: 'other' as const,
        startsAt: addDays(5),
        endsAt: addHours(5 + 120 + 1),
        location: 'Guild Bank',
        maxSize: 5,
        signups: createSignups(3),
      },
    ],
    isOfficer: true,
    onCreateEvent: () => console.log('Create event clicked'),
  },
}
