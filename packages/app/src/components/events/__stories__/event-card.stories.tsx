import type { Meta, StoryObj } from '@storybook/react'
import { EventCard } from '../event-card'

const meta: Meta<typeof EventCard> = {
  title: 'Events/EventCard',
  component: EventCard,
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
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
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

export const RaidEvent: Story = {
  args: {
    event: {
      id: 'event-1',
      name: 'Blackrock Foundry - Heroic',
      description:
        'Weekly heroic raid. Be ready 15 minutes early for invites. Flasks and food mandatory. EPGP loot.',
      eventType: 'raid',
      startsAt: addDays(2),
      endsAt: addHours(2 + 48),
      location: 'Blackrock Foundry',
      maxSize: 40,
      signups: createSignups(28, 5),
    },
  },
}

export const DungeonEvent: Story = {
  args: {
    event: {
      id: 'event-2',
      name: 'Mythic+ Weekly Keys',
      description:
        'Group up for weekly mythic+ runs. Looking for +15 and higher. Bring your own keys!',
      eventType: 'dungeon',
      startsAt: addDays(1),
      endsAt: addHours(1 + 24 + 4),
      location: 'Various Dungeons',
      maxSize: 5,
      signups: createSignups(3),
    },
  },
}

export const PvPEvent: Story = {
  args: {
    event: {
      id: 'event-3',
      name: 'Arena Practice',
      description:
        '3v3 arena practice sessions. All skill levels welcome. Voice chat required.',
      eventType: 'pvp',
      startsAt: addDays(3),
      endsAt: addHours(3 + 72 + 2),
      location: "Nagrand Arena (Shattrath's Ring of Blood)",
      maxSize: null,
      signups: createSignups(12),
    },
  },
}

export const SocialEvent: Story = {
  args: {
    event: {
      id: 'event-4',
      name: 'Guild Anniversary Party',
      description:
        'Celebrating 5 years together! Transmog contest, trivia, races, and more. Prizes for winners!',
      eventType: 'social',
      startsAt: addDays(7),
      endsAt: addHours(7 + 168 + 3),
      location: 'Stormwind City - Cathedral Square',
      maxSize: null,
      signups: createSignups(45, 8),
    },
  },
}

export const OtherEvent: Story = {
  args: {
    event: {
      id: 'event-5',
      name: 'Officer Meeting',
      description:
        'Monthly officer meeting to discuss guild direction, recruitment, and events.',
      eventType: 'other',
      startsAt: addDays(5),
      endsAt: addHours(5 + 120 + 1),
      location: 'Discord Voice',
      maxSize: 10,
      signups: createSignups(7),
    },
  },
}

export const HappeningSoon: Story = {
  args: {
    event: {
      id: 'event-6',
      name: 'Emergency Raid - Server First Attempt',
      description:
        'Last minute raid! We need all hands on deck for server first mythic boss kill!',
      eventType: 'raid',
      startsAt: addHours(2), // Happening in 2 hours
      endsAt: addHours(6),
      location: 'Sanctum of Domination',
      maxSize: 20,
      signups: createSignups(18, 2),
    },
  },
}

export const PastEvent: Story = {
  args: {
    event: {
      id: 'event-7',
      name: 'Karazhan Run',
      description:
        'Finished run through Karazhan. Great success, got several upgrades!',
      eventType: 'raid',
      startsAt: addDays(-3), // 3 days ago
      endsAt: addHours(-3 * 24 + 4),
      location: 'Karazhan',
      maxSize: 10,
      signups: createSignups(10),
    },
  },
}

export const FullEvent: Story = {
  args: {
    event: {
      id: 'event-8',
      name: 'Blackwing Lair Speed Run',
      description:
        'Speed run attempt for guild record. Roster is locked. Standby list available on Discord.',
      eventType: 'raid',
      startsAt: addDays(4),
      endsAt: addHours(4 + 96 + 2),
      location: 'Blackwing Lair',
      maxSize: 40,
      signups: createSignups(40), // Exactly at max capacity
    },
  },
}

export const ManySignups: Story = {
  args: {
    event: {
      id: 'event-9',
      name: 'World Boss Farm - Doom Lord Kazzak',
      description:
        'Open world boss farming. Anyone can join! First come first serve on loot.',
      eventType: 'raid',
      startsAt: addDays(1),
      endsAt: addHours(1 + 24 + 1),
      location: "Throne of Kil'jaeden - Hellfire Peninsula",
      maxSize: null,
      signups: createSignups(67, 12),
    },
  },
}

export const NoSignups: Story = {
  args: {
    event: {
      id: 'event-10',
      name: 'Achievement Run - Old Content',
      description:
        'Running through old raids for achievements. Casual run, all welcome!',
      eventType: 'social',
      startsAt: addDays(10),
      endsAt: addHours(10 + 240 + 3),
      location: 'Various Old Raids',
      maxSize: 30,
      signups: [],
    },
  },
}

export const NoDescription: Story = {
  args: {
    event: {
      id: 'event-11',
      name: "Gruul's Lair",
      description: null,
      eventType: 'raid',
      startsAt: addDays(6),
      endsAt: addHours(6 + 144 + 2),
      location: "Gruul's Lair",
      maxSize: 25,
      signups: createSignups(15, 3),
    },
  },
}

export const NoLocation: Story = {
  args: {
    event: {
      id: 'event-12',
      name: 'Guild Meeting',
      description:
        'General guild meeting to discuss upcoming events and address member concerns.',
      eventType: 'other',
      startsAt: addDays(8),
      endsAt: addHours(8 + 192 + 1),
      location: null,
      maxSize: null,
      signups: createSignups(23),
    },
  },
}

export const LongEventName: Story = {
  args: {
    event: {
      id: 'event-13',
      name: 'Super Ultra Mega Long Event Name That Goes On And On For Testing',
      description:
        'Testing how long event names are handled in the card layout.',
      eventType: 'social',
      startsAt: addDays(15),
      endsAt: addHours(15 + 360 + 2),
      location: 'Test Location',
      maxSize: 20,
      signups: createSignups(8),
    },
  },
}

export const VeryLongDescription: Story = {
  args: {
    event: {
      id: 'event-14',
      name: 'Naxxramas Progression',
      description:
        'This is a very long description that should test the line clamping behavior of the event card. We want to make sure that extremely long descriptions are properly truncated and that the UI remains clean and readable. This description keeps going and going to test the limits. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      eventType: 'raid',
      startsAt: addDays(12),
      endsAt: addHours(12 + 288 + 4),
      location: 'Naxxramas',
      maxSize: 40,
      signups: createSignups(32, 6),
    },
  },
}

export const TentativeSignupsOnly: Story = {
  args: {
    event: {
      id: 'event-15',
      name: 'Spontaneous PvP Night',
      description:
        'Battlegrounds and world PvP. Sign up if you might be available!',
      eventType: 'pvp',
      startsAt: addDays(2),
      endsAt: addHours(2 + 48 + 3),
      location: 'Various Battlegrounds',
      maxSize: null,
      signups: createSignups(0, 15), // Only tentative signups
    },
  },
}

export const SmallMaxSize: Story = {
  args: {
    event: {
      id: 'event-16',
      name: 'Dungeon Trio',
      description: 'Looking for exactly 3 people for a specific dungeon run.',
      eventType: 'dungeon',
      startsAt: addDays(1),
      endsAt: addHours(1 + 24 + 2),
      location: 'Shadow Labyrinth',
      maxSize: 3,
      signups: createSignups(2),
    },
  },
}

export const HappeningSoonAndFull: Story = {
  args: {
    event: {
      id: 'event-17',
      name: 'Arena Tournament Finals',
      description:
        'Guild arena tournament finals! Spectators welcome in Discord.',
      eventType: 'pvp',
      startsAt: addHours(6), // Happening in 6 hours
      endsAt: addHours(8),
      location: 'Dalaran Arena',
      maxSize: 6,
      signups: createSignups(6), // Full
    },
  },
}
