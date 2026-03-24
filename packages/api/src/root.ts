import { router } from './trpc'
import { tenantRouter } from './routers/tenant'
import { characterRouter } from './routers/character'
import { eventRouter } from './routers/event'
import { lootRouter } from './routers/loot'
import { memberRouter } from './routers/member'
import { roleRouter } from './routers/role'
import { dkpRouter } from './routers/dkp'
import { contentRouter } from './routers/content'
import { announcementsRouter } from './routers/announcements'
import { forumsRouter } from './routers/forums'

export const appRouter = router({
  tenant: tenantRouter,
  character: characterRouter,
  event: eventRouter,
  loot: lootRouter,
  member: memberRouter,
  role: roleRouter,
  dkp: dkpRouter,
  content: contentRouter,
  announcements: announcementsRouter,
  forums: forumsRouter,
})

export type AppRouter = typeof appRouter
