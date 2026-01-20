import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Guild <span className="text-purple-400">Platform</span>
        </h1>
        <p className="text-xl text-slate-300">
          Multi-tenant guild management for WoW and beyond
        </p>
        <div className="flex gap-4">
          <Link
            href="/api/auth/signin"
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
          >
            Sign in with Discord
          </Link>
        </div>
      </div>
    </main>
  )
}
