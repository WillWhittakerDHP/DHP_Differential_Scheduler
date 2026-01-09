/**
 * FREE TIMES TO VALID AVAILABILITIES TESTS
 * 
 * Unit tests for converting free times into valid appointment slots.
 * Tests time slot splitting, permissible starts, and availability finding.
 */

import { describe, it, expect } from '@jest/globals'
import { TimeSlot, mapPermissibleStarts, splitFreeTimesToFreeBits, findAvailabilities } from '../freeTimesToValidAvailabilities.js'

describe('freeTimesToValidAvailabilities', () => {
  describe('TimeSlot class', () => {
    it('should create a time slot with duration and times', () => {
      const start = new Date('2026-01-15T10:00:00Z')
      const end = new Date('2026-01-15T11:00:00Z')
      const duration = 60
      
      const slot = new TimeSlot(duration, start, end)
      
      expect(slot.duration).toBe(60)
      expect(slot.slotStart).toEqual(start)
      expect(slot.slotEnd).toEqual(end)
    })
  })
  
  describe('mapPermissibleStarts', () => {
    it('should map "every :00" to [0]', () => {
      const result = mapPermissibleStarts('every :00')
      expect(result).toEqual([0])
    })
    
    it('should map "every :15" to [0, 15, 30, 45]', () => {
      const result = mapPermissibleStarts('every :15')
      expect(result).toEqual([0, 15, 30, 45])
    })
    
    it('should map "every :30" to [0, 30]', () => {
      const result = mapPermissibleStarts('every :30')
      expect(result).toEqual([0, 30])
    })
    
    it('should return empty array for unknown rule', () => {
      const result = mapPermissibleStarts('unknown rule')
      expect(result).toEqual([])
    })
  })
  
  describe('splitFreeTimesToFreeBits', () => {
    it('should split free time into 15-minute increments', () => {
      const freeTimes = [
        { start: new Date('2026-01-15T10:00:00Z'), end: new Date('2026-01-15T11:00:00Z') },
      ]
      const minuteIncrement = 15
      const permissibleStarts = [0, 15, 30, 45]
      
      const result = splitFreeTimesToFreeBits(freeTimes, minuteIncrement, permissibleStarts)
      
      // Should create 4 slots: 10:00, 10:15, 10:30, 10:45
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].duration).toBe(15)
    })
    
    it('should align slots to permissible starts', () => {
      const freeTimes = [
        { start: new Date('2026-01-15T10:05:00Z'), end: new Date('2026-01-15T11:00:00Z') },
      ]
      const minuteIncrement = 15
      const permissibleStarts = [0, 15, 30, 45]
      
      const result = splitFreeTimesToFreeBits(freeTimes, minuteIncrement, permissibleStarts)
      
      // Should start at 10:15 (next permissible start after 10:05)
      expect(result[0].slotStart.getUTCMinutes()).toBe(15)
    })
    
    it('should handle 30-minute increments', () => {
      const freeTimes = [
        { start: new Date('2026-01-15T10:00:00Z'), end: new Date('2026-01-15T12:00:00Z') },
      ]
      const minuteIncrement = 30
      const permissibleStarts = [0, 30]
      
      const result = splitFreeTimesToFreeBits(freeTimes, minuteIncrement, permissibleStarts)
      
      // Should create 4 slots: 10:00, 10:30, 11:00, 11:30
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].duration).toBe(30)
    })
    
    it('should not create slots that extend past free time end', () => {
      const freeTimes = [
        { start: new Date('2026-01-15T10:00:00Z'), end: new Date('2026-01-15T10:10:00Z') },
      ]
      const minuteIncrement = 15
      const permissibleStarts = [0]
      
      const result = splitFreeTimesToFreeBits(freeTimes, minuteIncrement, permissibleStarts)
      
      // Only 10 minutes available, can't fit a 15-minute slot
      expect(result).toHaveLength(0)
    })
    
    it('should handle multiple free time periods', () => {
      const freeTimes = [
        { start: new Date('2026-01-15T10:00:00Z'), end: new Date('2026-01-15T11:00:00Z') },
        { start: new Date('2026-01-15T14:00:00Z'), end: new Date('2026-01-15T15:00:00Z') },
      ]
      const minuteIncrement = 15
      const permissibleStarts = [0]
      
      const result = splitFreeTimesToFreeBits(freeTimes, minuteIncrement, permissibleStarts)
      
      // Should have slots from both periods
      expect(result.length).toBeGreaterThanOrEqual(8) // 4 from each period
    })
  })
  
  describe('findAvailabilities', () => {
    it('should find availabilities that meet duration requirement', () => {
      // Create 15-minute free bits
      const freeBits = [
        new TimeSlot(15, new Date('2026-01-15T10:00:00Z'), new Date('2026-01-15T10:15:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:15:00Z'), new Date('2026-01-15T10:30:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:30:00Z'), new Date('2026-01-15T10:45:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:45:00Z'), new Date('2026-01-15T11:00:00Z')),
      ]
      const duration = 30 // Need 30 minutes
      
      const result = findAvailabilities(freeBits, duration)
      
      // Should find availabilities: 10:00-10:30, 10:15-10:45, 10:30-11:00
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].duration).toBeGreaterThanOrEqual(30)
    })
    
    it('should use sliding window approach', () => {
      const freeBits = [
        new TimeSlot(15, new Date('2026-01-15T10:00:00Z'), new Date('2026-01-15T10:15:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:15:00Z'), new Date('2026-01-15T10:30:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:30:00Z'), new Date('2026-01-15T10:45:00Z')),
      ]
      const duration = 30
      
      const result = findAvailabilities(freeBits, duration)
      
      // Should find: 10:00-10:30, 10:15-10:45
      expect(result).toHaveLength(2)
    })
    
    it('should handle exact duration match', () => {
      const freeBits = [
        new TimeSlot(30, new Date('2026-01-15T10:00:00Z'), new Date('2026-01-15T10:30:00Z')),
      ]
      const duration = 30
      
      const result = findAvailabilities(freeBits, duration)
      
      expect(result).toHaveLength(1)
      expect(result[0].duration).toBe(30)
    })
    
    it('should handle duration longer than any single bit', () => {
      const freeBits = [
        new TimeSlot(15, new Date('2026-01-15T10:00:00Z'), new Date('2026-01-15T10:15:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:15:00Z'), new Date('2026-01-15T10:30:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:30:00Z'), new Date('2026-01-15T10:45:00Z')),
        new TimeSlot(15, new Date('2026-01-15T10:45:00Z'), new Date('2026-01-15T11:00:00Z')),
      ]
      const duration = 60 // Need full hour
      
      const result = findAvailabilities(freeBits, duration)
      
      // Should combine 4 bits to make 60 minutes
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].duration).toBe(60)
    })
    
    it('should return empty array when no bits meet duration', () => {
      const freeBits = [
        new TimeSlot(15, new Date('2026-01-15T10:00:00Z'), new Date('2026-01-15T10:15:00Z')),
      ]
      const duration = 60
      
      const result = findAvailabilities(freeBits, duration)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle empty freeBits array', () => {
      const result = findAvailabilities([], 30)
      
      expect(result).toHaveLength(0)
    })
  })
})

