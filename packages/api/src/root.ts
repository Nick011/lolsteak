import { router } from './trpc'
import { tenantRouter } from './routers/tenant'
import { characterRouter } from './routers/character'
import { eventRouter } from './routers/event'
import { lootRouter } from './routers/loot'

export const appRouter = router({
  tenant: tenantRouter,
  character: characterRouter,
  event: eventRouter,
  loot: lootRouter,
})

export type AppRouter = typeof appRouter
