import { db } from './client'
import { tenants, users, members, characters } from './schema'

async function seed() {
  console.log('Seeding database...')

  // Create a test user
  const [user] = await db
    .insert(users)
    .values({
      email: 'admin@example.com',
      name: 'Admin User',
    })
    .onConflictDoNothing()
    .returning()

  if (!user) {
    console.log('User already exists, skipping...')
    const existingUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, 'admin@example.com'),
    })
    if (!existingUser) {
      throw new Error('Could not find or create user')
    }
    console.log('Found existing user:', existingUser.id)
    return
  }

  console.log('Created user:', user.id)

  // Create the Steak guild
  const [tenant] = await db
    .insert(tenants)
    .values({
      slug: 'steak',
      name: 'Steak',
      gameType: 'wow_classic',
      description: 'A WoW TBC guild on the journey to greatness',
      settings: {
        timezone: 'America/New_York',
        defaultRaidSize: 25,
        lootSystem: 'soft_reserve',
        features: {
          events: true,
          lootTracking: true,
          attendance: true,
        },
      },
    })
    .onConflictDoNothing()
    .returning()

  if (!tenant) {
    console.log("Tenant 'steak' already exists, skipping...")
    return
  }

  console.log('Created tenant:', tenant.slug)

  // Make admin the owner
  const [member] = await db
    .insert(members)
    .values({
      tenantId: tenant.id,
      userId: user.id,
      role: 'owner',
      nickname: 'Guild Master',
    })
    .returning()

  console.log('Created member:', member.id)

  // Create some sample characters
  const sampleCharacters = [
    {
      name: 'Tankyboi',
      class: 'warrior',
      spec: 'Protection',
      role: 'tank',
      level: 70,
    },
    {
      name: 'Healzplz',
      class: 'priest',
      spec: 'Holy',
      role: 'healer',
      level: 70,
    },
    {
      name: 'Pewnpew',
      class: 'hunter',
      spec: 'Beast Mastery',
      role: 'dps',
      level: 70,
    },
    {
      name: 'Shadowstab',
      class: 'rogue',
      spec: 'Combat',
      role: 'dps',
      level: 70,
    },
    {
      name: 'Frostboltz',
      class: 'mage',
      spec: 'Frost',
      role: 'dps',
      level: 70,
    },
  ] as const

  for (const char of sampleCharacters) {
    await db.insert(characters).values({
      tenantId: tenant.id,
      memberId: member.id,
      name: char.name,
      realm: 'Grobbulus',
      class: char.class,
      spec: char.spec,
      role: char.role,
      level: char.level,
      isMain: char.name === 'Tankyboi' ? 'true' : 'false',
    })
  }

  console.log('Created sample characters')
  console.log('Seed complete!')
}

seed()
  .catch(e => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
