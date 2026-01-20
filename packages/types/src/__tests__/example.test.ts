import { describe, expect, it } from 'vitest'

describe('@guild/types', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should support type assertions', () => {
    const value: string = 'test'
    expect(typeof value).toBe('string')
  })
})
