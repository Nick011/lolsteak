import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('tenant router input validation', () => {
  // Test the input schema for tenant.create
  const createTenantSchema = z.object({
    name: z.string().min(2).max(255),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(
        /^[a-z0-9-]+$/,
        'Slug must be lowercase alphanumeric with hyphens'
      ),
    gameType: z.enum([
      'wow_classic',
      'wow_retail',
      'ff14',
      'lol',
      'dota2',
      'cs2',
      'rocket_league',
      'other',
    ]),
    description: z.string().optional(),
  })

  describe('tenant.create input validation', () => {
    it('should accept valid input', () => {
      const validInput = {
        name: 'Test Guild',
        slug: 'test-guild',
        gameType: 'wow_classic' as const,
        description: 'A test guild',
      }

      const result = createTenantSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should reject name that is too short', () => {
      const invalidInput = {
        name: 'T',
        slug: 'test-guild',
        gameType: 'wow_classic' as const,
      }

      const result = createTenantSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject slug with invalid characters', () => {
      const invalidInput = {
        name: 'Test Guild',
        slug: 'Test Guild!', // Uppercase and special chars not allowed
        gameType: 'wow_classic' as const,
      }

      const result = createTenantSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject slug with spaces', () => {
      const invalidInput = {
        name: 'Test Guild',
        slug: 'test guild',
        gameType: 'wow_classic' as const,
      }

      const result = createTenantSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject invalid game type', () => {
      const invalidInput = {
        name: 'Test Guild',
        slug: 'test-guild',
        gameType: 'invalid_game' as const,
      }

      const result = createTenantSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should accept all valid game types', () => {
      const gameTypes = [
        'wow_classic',
        'wow_retail',
        'ff14',
        'lol',
        'dota2',
        'cs2',
        'rocket_league',
        'other',
      ] as const

      for (const gameType of gameTypes) {
        const result = createTenantSchema.safeParse({
          name: 'Test Guild',
          slug: 'test-guild',
          gameType,
        })
        expect(result.success).toBe(true)
      }
    })

    it('should allow optional description to be omitted', () => {
      const validInput = {
        name: 'Test Guild',
        slug: 'test-guild',
        gameType: 'wow_classic' as const,
      }

      const result = createTenantSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should accept slug with hyphens and numbers', () => {
      const validInput = {
        name: 'Test Guild 123',
        slug: 'test-guild-123',
        gameType: 'wow_classic' as const,
      }

      const result = createTenantSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })

  describe('tenant.getBySlug input validation', () => {
    const getBySlugSchema = z.object({ slug: z.string() })

    it('should accept valid slug', () => {
      const result = getBySlugSchema.safeParse({ slug: 'test-guild' })
      expect(result.success).toBe(true)
    })

    it('should reject missing slug', () => {
      const result = getBySlugSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
