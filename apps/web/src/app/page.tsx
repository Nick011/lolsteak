import { Header } from '~/components/layout/header'
import { Footer } from '~/components/layout/footer'
import { LinkButton } from '~/components/ui/link-button'
import Link from 'next/link'

const features = [
  {
    icon: '📅',
    title: 'Raid Scheduling',
    description:
      'Create events with role requirements, manage signups, and handle bench/standby players.',
  },
  {
    icon: '🗡️',
    title: 'Loot Tracking',
    description:
      'Import from Gargul, track loot history, and support multiple loot systems.',
  },
  {
    icon: '👥',
    title: 'Roster Management',
    description:
      'Manage members, characters, and alts with full class and spec tracking.',
  },
  {
    icon: '💬',
    title: 'Communication',
    description:
      'Built-in forums, announcements, and guides to keep your guild informed.',
  },
  {
    icon: '🤖',
    title: 'Discord Integration',
    description:
      'Full Discord sync with slash commands, role management, and notifications.',
  },
  {
    icon: '📊',
    title: 'Warcraft Logs',
    description:
      'Pull raid performance data and track your members progression.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Create Your Guild',
    description: 'Sign in with Discord and create your guild in seconds.',
  },
  {
    number: '2',
    title: 'Invite Members',
    description: 'Share an invite link and your roster fills up automatically.',
  },
  {
    number: '3',
    title: 'Start Raiding',
    description: 'Schedule events, track loot, and dominate the content.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
              Guild Management
              <br />
              <span className="text-purple-400">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10">
              The all-in-one platform for World of Warcraft guilds. Organize
              raids, track loot, manage your roster, and keep your guild
              connected.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LinkButton href="/auth/signin" size="lg">
                Get Started Free
              </LinkButton>
              <LinkButton href="/features" variant="outline" size="lg">
                See Features
              </LinkButton>
            </div>
            <p className="text-slate-500 mt-4 text-sm">
              Free during beta. No credit card required.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-slate-900/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything Your Guild Needs
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                From raid planning to loot distribution, we&apos;ve got you
                covered.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-colors"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/features"
                className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-2"
              >
                View all features
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-slate-400 text-lg">
                No complicated setup. Just sign in and start managing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-20 px-4 bg-slate-900/50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Level Up Your Guild?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of guilds already using GuildPlatform to manage
              their raids, loot, and roster. Free during our beta period.
            </p>
            <LinkButton href="/auth/signin" size="lg">
              Start Free Today
            </LinkButton>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
