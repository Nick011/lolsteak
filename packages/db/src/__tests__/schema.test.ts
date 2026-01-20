import { describe, expect, it } from 'vitest'
import {
  // Tenant-related
  tenants,
  members,
  gameTypeEnum,
  memberRoleEnum,
  tenantsRelations,
  membersRelations,
  // User-related
  users,
  accounts,
  sessions,
  verificationTokens,
  // Character-related
  characters,
  wowClassEnum,
  wowRoleEnum,
  // Event-related
  events,
  eventSignups,
  eventTypeEnum,
  signupStatusEnum,
  // Loot-related
  lootHistory,
  // Integration-related
  integrations,
  integrationTypeEnum,
  integrationStatusEnum,
} from '../schema'

describe('@guild/db schema', () => {
  describe('tenants schema', () => {
    it('should have tenants table defined', () => {
      expect(tenants).toBeDefined()
      // Verify column definitions exist
      expect(tenants.id).toBeDefined()
      expect(tenants.slug).toBeDefined()
      expect(tenants.name).toBeDefined()
      expect(tenants.gameType).toBeDefined()
      expect(tenants.description).toBeDefined()
      expect(tenants.settings).toBeDefined()
      expect(tenants.customDomain).toBeDefined()
      expect(tenants.discordServerId).toBeDefined()
    })

    it('should have members table defined', () => {
      expect(members).toBeDefined()
      expect(members.id).toBeDefined()
      expect(members.tenantId).toBeDefined()
      expect(members.userId).toBeDefined()
      expect(members.role).toBeDefined()
      expect(members.nickname).toBeDefined()
    })

    it('should have relations defined', () => {
      expect(tenantsRelations).toBeDefined()
      expect(membersRelations).toBeDefined()
    })
  })

  describe('enums', () => {
    it('should have game type enum with correct values', () => {
      expect(gameTypeEnum).toBeDefined()
      expect(gameTypeEnum.enumValues).toContain('wow_classic')
      expect(gameTypeEnum.enumValues).toContain('wow_retail')
      expect(gameTypeEnum.enumValues).toContain('ff14')
      expect(gameTypeEnum.enumValues).toContain('lol')
      expect(gameTypeEnum.enumValues).toContain('dota2')
      expect(gameTypeEnum.enumValues).toContain('cs2')
      expect(gameTypeEnum.enumValues).toContain('rocket_league')
      expect(gameTypeEnum.enumValues).toContain('other')
    })

    it('should have member role enum with correct values', () => {
      expect(memberRoleEnum).toBeDefined()
      expect(memberRoleEnum.enumValues).toContain('owner')
      expect(memberRoleEnum.enumValues).toContain('officer')
      expect(memberRoleEnum.enumValues).toContain('member')
    })
  })

  describe('users schema', () => {
    it('should have users table defined', () => {
      expect(users).toBeDefined()
      expect(users.id).toBeDefined()
      expect(users.name).toBeDefined()
      expect(users.email).toBeDefined()
      expect(users.image).toBeDefined()
    })

    it('should have auth tables defined', () => {
      expect(accounts).toBeDefined()
      expect(sessions).toBeDefined()
      expect(verificationTokens).toBeDefined()
    })
  })

  describe('game tables', () => {
    it('should have characters table defined', () => {
      expect(characters).toBeDefined()
      expect(characters.id).toBeDefined()
      expect(characters.tenantId).toBeDefined()
      expect(characters.memberId).toBeDefined()
      expect(characters.name).toBeDefined()
    })

    it('should have events table defined', () => {
      expect(events).toBeDefined()
      expect(events.id).toBeDefined()
      expect(events.tenantId).toBeDefined()
      expect(events.name).toBeDefined()
      expect(events.startsAt).toBeDefined()
    })

    it('should have event signups table defined', () => {
      expect(eventSignups).toBeDefined()
      expect(eventSignups.id).toBeDefined()
      expect(eventSignups.eventId).toBeDefined()
      expect(eventSignups.characterId).toBeDefined()
    })

    it('should have loot tables defined', () => {
      expect(lootHistory).toBeDefined()
      expect(lootHistory.id).toBeDefined()
      expect(lootHistory.tenantId).toBeDefined()
    })

    it('should have game-specific enums defined', () => {
      expect(wowClassEnum).toBeDefined()
      expect(wowRoleEnum).toBeDefined()
      expect(eventTypeEnum).toBeDefined()
      expect(signupStatusEnum).toBeDefined()
    })
  })

  describe('integrations schema', () => {
    it('should have integrations table defined', () => {
      expect(integrations).toBeDefined()
      expect(integrations.id).toBeDefined()
      expect(integrations.tenantId).toBeDefined()
      expect(integrations.type).toBeDefined()
    })

    it('should have integration enums defined', () => {
      expect(integrationTypeEnum).toBeDefined()
      expect(integrationStatusEnum).toBeDefined()
    })
  })
})
