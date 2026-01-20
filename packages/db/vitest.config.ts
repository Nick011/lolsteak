import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: '@guild/db',
    environment: 'node',
    globals: true,
    include: ['**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**'],
  },
})
