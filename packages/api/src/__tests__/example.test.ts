import { describe, expect, it } from 'vitest'

describe('@guild/api', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should support async tests', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })
})
