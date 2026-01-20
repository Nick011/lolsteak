import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './apps/web/vitest.config.ts',
    test: {
      root: './apps/web',
    },
  },
  {
    extends: './packages/api/vitest.config.ts',
    test: {
      root: './packages/api',
    },
  },
  {
    extends: './packages/db/vitest.config.ts',
    test: {
      root: './packages/db',
    },
  },
  {
    extends: './packages/types/vitest.config.ts',
    test: {
      root: './packages/types',
    },
  },
])
