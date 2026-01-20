import { redirect } from 'next/navigation'
import { auth } from '~/lib/auth'
import { Sidebar, MobileNav } from '~/components/dashboard'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile navigation */}
      <MobileNav session={session} />

      {/* Desktop sidebar */}
      <aside className="hidden lg:block flex-shrink-0">
        <div className="sticky top-0 h-screen">
          <Sidebar session={session} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-950 pt-16 lg:pt-0">{children}</main>
    </div>
  )
}
