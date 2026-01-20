import { Header } from '~/components/layout/header'
import { Footer } from '~/components/layout/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Guild Platform',
  description: 'Privacy policy for GuildPlatform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <div className="prose prose-invert prose-slate max-w-none">
            <p className="text-slate-400 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-slate-300">
              This privacy policy will be updated with full details before the
              platform launches. During the beta period, we collect minimal data
              necessary to provide the service.
            </p>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
              Data We Collect
            </h2>
            <ul className="text-slate-300 list-disc list-inside space-y-2">
              <li>Discord account information (username, avatar, ID)</li>
              <li>Battle.net account information (if connected)</li>
              <li>Guild membership and character data you provide</li>
              <li>Event signups and loot records</li>
            </ul>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
              How We Use Your Data
            </h2>
            <p className="text-slate-300">
              We use your data solely to provide the guild management features
              of this platform. We do not sell your data to third parties.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
