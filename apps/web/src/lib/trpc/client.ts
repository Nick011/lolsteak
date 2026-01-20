import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@guild/api'

export const trpc = createTRPCReact<AppRouter>()
