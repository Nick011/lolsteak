import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, createContext } from '@guild/api'
import { db } from '@guild/db/client'
import { auth } from '~/lib/auth'
import { headers } from 'next/headers'

const handler = async (req: Request) => {
  const session = await auth()

  // Extract tenant slug from subdomain or header
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  let tenantSlug: string | undefined

  // Check for subdomain (e.g., steak.guildplatform.com)
  const parts = host.split('.')
  if (parts.length > 2) {
    tenantSlug = parts[0]
  }

  // Allow override via header (useful for development)
  const headerTenant = headersList.get('x-tenant-slug')
  if (headerTenant) {
    tenantSlug = headerTenant
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        db,
        session: session
          ? {
              user: {
                id: session.user?.id ?? '',
                email: session.user?.email,
                name: session.user?.name,
                image: session.user?.image,
              },
              expires: session.expires ?? '',
            }
          : null,
        tenantSlug,
      }),
  })
}

export { handler as GET, handler as POST }
