import { vi } from 'vitest'

// Set mock DATABASE_URL to prevent client initialization errors
process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock'

// Mock the database client module directly to prevent initialization
vi.mock('@guild/db/client', () => ({
  db: {},
  migrationClient: {},
}))

// Mock the entire @guild/db module to prevent database client initialization
vi.mock('@guild/db', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await vi.importActual('drizzle-orm')) as any
  return {
    db: {},
    migrationClient: {},
    eq: actual.eq,
    and: actual.and,
    or: actual.or,
    desc: actual.desc,
    asc: actual.asc,
    sql: actual.sql,
    like: actual.like,
    ilike: actual.ilike,
    inArray: actual.inArray,
    isNull: actual.isNull,
    isNotNull: actual.isNotNull,
    gte: actual.gte,
    lte: actual.lte,
    gt: actual.gt,
    lt: actual.lt,
  }
})
