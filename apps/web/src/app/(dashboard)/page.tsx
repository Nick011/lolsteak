import { redirect } from 'next/navigation'
import { auth } from '~/lib/auth'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <p className="text-slate-300">
          Welcome back, {session.user?.name ?? 'Guild Leader'}!
        </p>
        <p className="text-slate-400 mt-2">
          Your guild dashboard is coming soon. Stay tuned for roster
          management, event scheduling, and loot tracking.
        </p>
      </div>
    </div>
  )
}
