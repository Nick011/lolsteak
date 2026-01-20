import { describe, expect, it } from 'vitest'

describe('@guild/web', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should support async tests', async () => {
    const result = await Promise.resolve('web')
    expect(result).toBe('web')
  })
})

// Note: React component rendering tests work when running `bun test` from apps/web directly.
// The workspace configuration needs additional setup for jsdom environments.
// For component tests, run: cd apps/web && bun test
