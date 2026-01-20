import { Header } from '~/components/layout/header'
import { Footer } from '~/components/layout/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Guild Platform',
  description: 'Terms of service for GuildPlatform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <div className="prose prose-invert prose-slate max-w-none">
            <p className="text-slate-400 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-slate-300">
              These terms of service will be updated with full details before
              the platform launches. By using GuildPlatform during the beta
              period, you agree to these preliminary terms.
            </p>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
              Acceptable Use
            </h2>
            <ul className="text-slate-300 list-disc list-inside space-y-2">
              <li>Use the platform for legitimate guild management purposes</li>
              <li>Do not abuse the service or attempt to exploit it</li>
              <li>Respect other users and their data</li>
              <li>Do not use the platform for illegal activities</li>
            </ul>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
              Beta Disclaimer
            </h2>
            <p className="text-slate-300">
              This platform is in beta. Features may change, and data loss may
              occur. Use at your own risk during the beta period.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
