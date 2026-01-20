import { describe, expect, it } from 'vitest'

describe('@guild/db', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should support async tests', async () => {
    const result = await Promise.resolve('database')
    expect(result).toBe('database')
  })
})
