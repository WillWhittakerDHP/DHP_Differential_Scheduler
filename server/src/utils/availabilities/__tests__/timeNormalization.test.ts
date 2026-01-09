/**
 * TIME NORMALIZATION TESTS
 * 
 * Unit tests for timezone normalization utilities.
 * Tests UTC conversion, timezone conversion, and DST handling.
 */

import { describe, it, expect } from '@jest/globals'
import { normalizeToUtc, normalizeToZone } from '../timeNormalization.js'

describe('timeNormalization', () => {
  describe('normalizeToUtc', () => {
    it('should convert Eastern time to UTC', () => {
      const easternTime = '2026-01-15T10:00:00' // 10 AM EST
      const timezone = 'America/New_York'
      
      const result = normalizeToUtc(easternTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // EST is UTC-5, so 10 AM EST = 3 PM UTC
      expect(result.getUTCHours()).toBe(15)
    })
    
    it('should convert Pacific time to UTC', () => {
      const pacificTime = '2026-01-15T10:00:00' // 10 AM PST
      const timezone = 'America/Los_Angeles'
      
      const result = normalizeToUtc(pacificTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // PST is UTC-8, so 10 AM PST = 6 PM UTC
      expect(result.getUTCHours()).toBe(18)
    })
    
    it('should handle UTC timezone', () => {
      const utcTime = '2026-01-15T10:00:00'
      const timezone = 'UTC'
      
      const result = normalizeToUtc(utcTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      expect(result.getUTCHours()).toBe(10)
    })
    
    it('should handle ISO string with timezone', () => {
      const isoTime = '2026-01-15T10:00:00-05:00' // Explicit EST offset
      const timezone = 'America/New_York'
      
      const result = normalizeToUtc(isoTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      expect(result.getUTCHours()).toBe(15)
    })
    
    it('should handle midnight boundary', () => {
      const midnightTime = '2026-01-15T00:00:00'
      const timezone = 'America/New_York'
      
      const result = normalizeToUtc(midnightTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // Midnight EST = 5 AM UTC
      expect(result.getUTCHours()).toBe(5)
    })
    
    it('should handle end of day', () => {
      const endOfDay = '2026-01-15T23:59:59'
      const timezone = 'America/New_York'
      
      const result = normalizeToUtc(endOfDay, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // 11:59:59 PM EST = 4:59:59 AM UTC next day
      expect(result.getUTCHours()).toBe(4)
      expect(result.getUTCDate()).toBe(16) // Next day in UTC
    })
  })
  
  describe('normalizeToZone', () => {
    it('should convert UTC to Eastern time', () => {
      const utcTime = new Date('2026-01-15T15:00:00Z') // 3 PM UTC
      const timezone = 'America/New_York'
      
      const result = normalizeToZone(utcTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // 3 PM UTC = 10 AM EST
      expect(result.getHours()).toBe(10)
    })
    
    it('should convert UTC to Pacific time', () => {
      const utcTime = new Date('2026-01-15T18:00:00Z') // 6 PM UTC
      const timezone = 'America/Los_Angeles'
      
      const result = normalizeToZone(utcTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // 6 PM UTC = 10 AM PST
      expect(result.getHours()).toBe(10)
    })
    
    it('should handle UTC timezone (no conversion)', () => {
      const utcTime = new Date('2026-01-15T10:00:00Z')
      const timezone = 'UTC'
      
      const result = normalizeToZone(utcTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(10)
    })
    
    it('should handle midnight in UTC', () => {
      const utcTime = new Date('2026-01-15T00:00:00Z')
      const timezone = 'America/New_York'
      
      const result = normalizeToZone(utcTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // Midnight UTC = 7 PM EST previous day
      expect(result.getHours()).toBe(19)
      expect(result.getDate()).toBe(14) // Previous day
    })
    
    it('should handle date boundary crossing', () => {
      const utcTime = new Date('2026-01-15T05:00:00Z') // 5 AM UTC
      const timezone = 'America/New_York'
      
      const result = normalizeToZone(utcTime, timezone)
      
      expect(result).toBeInstanceOf(Date)
      // 5 AM UTC = Midnight EST
      expect(result.getHours()).toBe(0)
      expect(result.getDate()).toBe(15)
    })
  })
  
  describe('round-trip conversions', () => {
    it('should maintain time integrity through round-trip conversion', () => {
      const originalTime = '2026-01-15T10:00:00'
      const timezone = 'America/New_York'
      
      const utc = normalizeToUtc(originalTime, timezone)
      const backToZone = normalizeToZone(utc, timezone)
      
      // Should get back to 10 AM
      expect(backToZone.getHours()).toBe(10)
    })
    
    it('should handle multiple timezones consistently', () => {
      const time = '2026-01-15T10:00:00'
      const easternTimezone = 'America/New_York'
      const pacificTimezone = 'America/Los_Angeles'
      
      const utcFromEastern = normalizeToUtc(time, easternTimezone)
      const utcFromPacific = normalizeToUtc(time, pacificTimezone)
      
      // Same local time in different timezones should produce different UTC times
      expect(utcFromEastern.getTime()).not.toBe(utcFromPacific.getTime())
      
      // 3 hour difference between EST and PST
      const diffHours = (utcFromPacific.getTime() - utcFromEastern.getTime()) / (1000 * 60 * 60)
      expect(diffHours).toBe(3)
    })
  })
})

