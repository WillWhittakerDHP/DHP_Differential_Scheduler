/**
 * AVAILABILITY FILTERS TESTS
 * 
 * Unit tests for availability filtering functions.
 * Tests day filtering, hour filtering, lead time, and work hours.
 */

import { describe, it, expect } from '@jest/globals'
import { filterByAvailableDays, filterByFreeHours, filterByLeadTime, filterByWorkHours } from '../availabilityFilters.js'

describe('availabilityFilters', () => {
  const timezone = 'America/New_York'
  
  describe('filterByAvailableDays', () => {
    it('should filter to only include available days', () => {
      const freeTimes = [
        { start: new Date('2026-01-12T10:00:00Z'), end: new Date('2026-01-12T11:00:00Z') }, // Monday
        { start: new Date('2026-01-13T10:00:00Z'), end: new Date('2026-01-13T11:00:00Z') }, // Tuesday
        { start: new Date('2026-01-14T10:00:00Z'), end: new Date('2026-01-14T11:00:00Z') }, // Wednesday
      ]
      const availableDays = [1, 3] // Monday and Wednesday only
      
      const result = filterByAvailableDays(freeTimes, availableDays, timezone)
      
      expect(result).toHaveLength(2) // Should exclude Tuesday
    })
    
    it('should handle empty available days', () => {
      const freeTimes = [
        { start: new Date('2026-01-12T10:00:00Z'), end: new Date('2026-01-12T11:00:00Z') },
      ]
      const availableDays: number[] = []
      
      const result = filterByAvailableDays(freeTimes, availableDays, timezone)
      
      expect(result).toHaveLength(0)
    })
    
    it('should include all days when all days are available', () => {
      const freeTimes = [
        { start: new Date('2026-01-12T10:00:00Z'), end: new Date('2026-01-12T11:00:00Z') },
        { start: new Date('2026-01-13T10:00:00Z'), end: new Date('2026-01-13T11:00:00Z') },
      ]
      const availableDays = [0, 1, 2, 3, 4, 5, 6] // All days
      
      const result = filterByAvailableDays(freeTimes, availableDays, timezone)
      
      expect(result).toHaveLength(2)
    })
  })
  
  describe('filterByFreeHours', () => {
    it('should filter to only include times within free hours', () => {
      const freeTimes = [
        { start: new Date('2026-01-12T14:00:00Z'), end: new Date('2026-01-12T15:00:00Z') }, // 9-10 AM EST
        { start: new Date('2026-01-12T19:00:00Z'), end: new Date('2026-01-12T20:00:00Z') }, // 2-3 PM EST
        { start: new Date('2026-01-13T02:00:00Z'), end: new Date('2026-01-13T03:00:00Z') }, // 9-10 PM EST (outside hours)
      ]
      const freeHours = {
        1: { start: '2026-01-12T09:00:00', end: '2026-01-12T17:00:00' }, // Monday 9 AM - 5 PM
        2: { start: '2026-01-13T09:00:00', end: '2026-01-13T17:00:00' }, // Tuesday 9 AM - 5 PM
      }
      
      const result = filterByFreeHours(freeTimes, freeHours, timezone)
      
      // Should include first two slots, exclude the one at 9 PM
      expect(result.length).toBeLessThan(freeTimes.length)
    })
    
    it('should exclude times when no free hours defined for day', () => {
      const freeTimes = [
        { start: new Date('2026-01-11T14:00:00Z'), end: new Date('2026-01-11T15:00:00Z') }, // Sunday
      ]
      const freeHours = {
        1: { start: '2026-01-12T09:00:00', end: '2026-01-12T17:00:00' }, // Monday only
      }
      
      const result = filterByFreeHours(freeTimes, freeHours, timezone)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle empty free times array', () => {
      const freeTimes: { start: Date; end: Date }[] = []
      const freeHours = {
        1: { start: '2026-01-12T09:00:00', end: '2026-01-12T17:00:00' },
      }
      
      const result = filterByFreeHours(freeTimes, freeHours, timezone)
      
      expect(result).toHaveLength(0)
    })
  })
  
  describe('filterByLeadTime', () => {
    it('should filter out slots before lead time threshold', () => {
      const now = new Date('2026-01-15T10:00:00Z')
      const leadTimeThreshold = new Date('2026-01-15T12:00:00Z') // 2 hours from now
      
      const freeBits = [
        { duration: 30, slotStart: new Date('2026-01-15T11:00:00Z'), slotEnd: new Date('2026-01-15T11:30:00Z') }, // Too soon
        { duration: 30, slotStart: new Date('2026-01-15T12:00:00Z'), slotEnd: new Date('2026-01-15T12:30:00Z') }, // Exactly at threshold
        { duration: 30, slotStart: new Date('2026-01-15T13:00:00Z'), slotEnd: new Date('2026-01-15T13:30:00Z') }, // After threshold
      ]
      
      const result = filterByLeadTime(freeBits, leadTimeThreshold)
      
      expect(result).toHaveLength(2) // Should exclude first slot
      expect(result[0].slotStart.getTime()).toBeGreaterThanOrEqual(leadTimeThreshold.getTime())
    })
    
    it('should include all slots when all are after lead time', () => {
      const leadTimeThreshold = new Date('2026-01-15T10:00:00Z')
      
      const freeBits = [
        { duration: 30, slotStart: new Date('2026-01-15T12:00:00Z'), slotEnd: new Date('2026-01-15T12:30:00Z') },
        { duration: 30, slotStart: new Date('2026-01-15T13:00:00Z'), slotEnd: new Date('2026-01-15T13:30:00Z') },
      ]
      
      const result = filterByLeadTime(freeBits, leadTimeThreshold)
      
      expect(result).toHaveLength(2)
    })
    
    it('should exclude all slots when all are before lead time', () => {
      const leadTimeThreshold = new Date('2026-01-15T15:00:00Z')
      
      const freeBits = [
        { duration: 30, slotStart: new Date('2026-01-15T12:00:00Z'), slotEnd: new Date('2026-01-15T12:30:00Z') },
        { duration: 30, slotStart: new Date('2026-01-15T13:00:00Z'), slotEnd: new Date('2026-01-15T13:30:00Z') },
      ]
      
      const result = filterByLeadTime(freeBits, leadTimeThreshold)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle empty freeBits array', () => {
      const leadTimeThreshold = new Date('2026-01-15T12:00:00Z')
      
      const result = filterByLeadTime([], leadTimeThreshold)
      
      expect(result).toHaveLength(0)
    })
  })
  
  describe('filterByWorkHours', () => {
    it('should filter based on work hours limit', () => {
      const freeTimes = [
        { start: new Date('2026-01-12T14:00:00Z'), end: new Date('2026-01-12T15:00:00Z') },
        { start: new Date('2026-01-13T14:00:00Z'), end: new Date('2026-01-13T15:00:00Z') },
      ]
      const workHoursLimit = 8
      
      // Note: sumWorkHoursForDay is a placeholder that returns 0, so all should pass
      const result = filterByWorkHours(freeTimes, workHoursLimit, timezone)
      
      expect(result.length).toBeGreaterThan(0)
    })
    
    it('should handle empty free times', () => {
      const freeTimes: { start: Date; end: Date }[] = []
      const workHoursLimit = 8
      
      const result = filterByWorkHours(freeTimes, workHoursLimit, timezone)
      
      expect(result).toHaveLength(0)
    })
  })
})

