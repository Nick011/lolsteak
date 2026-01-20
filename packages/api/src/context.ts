import type { Database } from '@guild/db'
import type { tenants, members } from '@guild/db/schema'

export interface Session {
  user: {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
  expires: string
}

export interface Context {
  db: Database
  session: Session | null
  tenant: typeof tenants.$inferSelect | null
  member: typeof members.$inferSelect | null
}

export type CreateContextOptions = {
  db: Database
  session: Session | null
  tenantSlug?: string
}

export async function createContext(
  opts: CreateContextOptions
): Promise<Context> {
  const { db, session, tenantSlug } = opts

  let tenant = null
  let member = null

  if (tenantSlug) {
    // Load tenant
    const tenantResult = await db.query.tenants.findFirst({
      where: (t, { eq }) => eq(t.slug, tenantSlug),
    })
    tenant = tenantResult ?? null

    // Load member if user is authenticated and tenant exists
    if (session?.user && tenant) {
      const memberResult = await db.query.members.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.tenantId, tenant!.id), eq(m.userId, session.user.id)),
      })
      member = memberResult ?? null
    }
  }

  return {
    db,
    session,
    tenant,
    member,
  }
}
