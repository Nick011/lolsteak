import { redirect } from 'next/navigation'
import { auth, signOut } from '~/lib/auth'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Out - Guild Platform',
  description: 'Sign out of GuildPlatform.',
}

export default async function SignOutPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-white">
              Guild<span className="text-purple-400">Platform</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Sign out</h1>
          <p className="text-slate-400">Are you sure you want to sign out?</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </form>

          <div className="mt-4">
            <Link
              href="/dashboard"
              className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
