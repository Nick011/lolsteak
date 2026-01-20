import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: '@guild/types',
    environment: 'node',
    globals: true,
    include: ['**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**'],
  },
})
