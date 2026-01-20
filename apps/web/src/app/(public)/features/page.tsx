import { Header } from '~/components/layout/header'
import { Footer } from '~/components/layout/footer'
import { LinkButton } from '~/components/ui/link-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - Guild Platform',
  description:
    'Discover all the features that make GuildPlatform the best guild management tool for WoW.',
}

const featureCategories = [
  {
    title: 'Raid Scheduling & Signups',
    description:
      'Everything you need to organize your raids and manage attendance.',
    features: [
      {
        title: 'Event Creation',
        description:
          'Create raids, dungeons, and other events with date, time, and location.',
      },
      {
        title: 'Role Requirements',
        description:
          'Set how many tanks, healers, and DPS you need for each event.',
      },
      {
        title: 'Signup Management',
        description:
          'Members sign up with their characters, showing class, spec, and role.',
      },
      {
        title: 'Bench & Standby',
        description:
          'Manage overflow roster with standby lists and bench notifications.',
      },
      {
        title: 'Soft Reserve',
        description:
          'Built-in soft reserve system with configurable limits per event.',
      },
      {
        title: 'Calendar View',
        description:
          'See all upcoming events at a glance with our interactive calendar.',
      },
    ],
  },
  {
    title: 'Loot Tracking',
    description:
      'Track every piece of loot distributed with multiple loot system support.',
    features: [
      {
        title: 'Gargul Import',
        description:
          'Import loot data directly from the Gargul addon with one click.',
      },
      {
        title: 'Loot History',
        description:
          'Complete history of who got what, when, and from which boss.',
      },
      {
        title: 'Multiple Loot Systems',
        description:
          'Support for Loot Council, DKP, GDKP, Soft Reserve, and more.',
      },
      {
        title: 'Character Mapping',
        description:
          'Automatically map loot to characters in your roster.',
      },
      {
        title: 'Wishlist Integration',
        description:
          'Connect with ThatsMyBIS for wishlist tracking and planning.',
      },
      {
        title: 'Reports & Analytics',
        description:
          'See loot distribution stats to ensure fair distribution.',
      },
    ],
  },
  {
    title: 'Roster Management',
    description:
      'Keep track of your members, their characters, and guild roles.',
    features: [
      {
        title: 'Member Directory',
        description:
          'Full list of all members with their characters, roles, and activity.',
      },
      {
        title: 'Character Profiles',
        description:
          'Track class, spec, role, realm, and gear for each character.',
      },
      {
        title: 'Alt Management',
        description:
          'Members can have multiple characters with one designated as main.',
      },
      {
        title: 'Custom Roles',
        description:
          'Create your own roles with custom names, colors, and permissions.',
      },
      {
        title: 'Invite Links',
        description:
          'Generate shareable links to easily invite new members.',
      },
      {
        title: 'Battle.net Verification',
        description:
          'Verify character ownership through Battle.net OAuth.',
      },
    ],
  },
  {
    title: 'Discord Integration',
    description:
      'Deep Discord integration that keeps your community connected.',
    features: [
      {
        title: 'Slash Commands',
        description:
          'Use /signup, /roster, /loot and more right from Discord.',
      },
      {
        title: 'Event Notifications',
        description:
          'Automatic announcements when events are created or updated.',
      },
      {
        title: 'Role Sync',
        description:
          'Sync guild roles with Discord roles automatically.',
      },
      {
        title: 'Interactive Signups',
        description:
          'Sign up for events using Discord reactions or threads.',
      },
      {
        title: 'Member Sync',
        description:
          'Automatically sync Discord server members with your roster.',
      },
      {
        title: 'Channel Management',
        description:
          'Create and manage channels for events and announcements.',
      },
    ],
  },
  {
    title: 'Communication',
    description:
      'Keep your guild informed with built-in communication tools.',
    features: [
      {
        title: 'Announcements',
        description:
          'Post important updates that all members will see.',
      },
      {
        title: 'Forums',
        description:
          'Discussion boards for general chat, class guides, and more.',
      },
      {
        title: 'FAQ & Guides',
        description:
          'Create raid strategies, class guides, and FAQs for new members.',
      },
      {
        title: 'Rich Text Editor',
        description:
          'Format your posts with markdown, images, and embeds.',
      },
      {
        title: 'Search',
        description:
          'Find past discussions and guides quickly with full-text search.',
      },
      {
        title: 'Notifications',
        description:
          'Get notified about replies, mentions, and important updates.',
      },
    ],
  },
  {
    title: 'Integrations',
    description:
      'Connect with the tools your guild already uses.',
    features: [
      {
        title: 'Warcraft Logs',
        description:
          'Pull raid performance data and link logs to events.',
      },
      {
        title: 'Battle.net',
        description:
          'Verify characters and pull current character data.',
      },
      {
        title: 'Gargul Addon',
        description:
          'Import loot data from the popular WoW addon.',
      },
      {
        title: 'Softres.it',
        description:
          'Integrate with Softres.it for soft reserve management.',
      },
      {
        title: 'Discord',
        description:
          'Full Discord bot with commands, notifications, and sync.',
      },
      {
        title: 'Webhooks',
        description:
          'Send events to external services with customizable webhooks.',
      },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Features
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything your guild needs to organize, communicate, and succeed.
            </p>
          </div>
        </section>

        {/* Feature Categories */}
        {featureCategories.map((category, index) => (
          <section
            key={category.title}
            className={`py-16 px-4 ${index % 2 === 1 ? 'bg-slate-900/50' : ''}`}
          >
            <div className="container mx-auto">
              <div className="max-w-3xl mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {category.title}
                </h2>
                <p className="text-lg text-slate-400">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Create your guild in seconds. Free during beta.
            </p>
            <LinkButton href="/auth/signin" size="lg">
              Sign Up with Discord
            </LinkButton>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
