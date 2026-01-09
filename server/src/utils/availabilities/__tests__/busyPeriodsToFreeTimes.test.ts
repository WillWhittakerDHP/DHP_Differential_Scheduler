/**
 * BUSY PERIODS TO FREE TIMES TESTS
 * 
 * Unit tests for busy period merging and free time calculation.
 * Tests overlap detection, gap finding, and edge cases.
 */

import { describe, it, expect } from '@jest/globals'
import { mergeBusyPeriods, calculateFreeTimes } from '../busyPeriodsToFreeTimes.js'

describe('busyPeriodsToFreeTimes', () => {
  const timezone = 'America/New_York'
  
  describe('mergeBusyPeriods', () => {
    it('should merge overlapping busy periods', () => {
      const busy = [
        { start: '2026-01-15T10:00:00', end: '2026-01-15T11:00:00' },
        { start: '2026-01-15T10:30:00', end: '2026-01-15T12:00:00' }, // Overlaps with first
      ]
      
      const result = mergeBusyPeriods(busy, timezone)
      
      expect(result).toHaveLength(1)
      expect(result[0].start).toEqual(expect.any(Date))
      expect(result[0].end).toEqual(expect.any(Date))
      // Should merge into single period from 10:00 to 12:00
      expect(result[0].end.getTime() - result[0].start.getTime()).toBe(2 * 60 * 60 * 1000) // 2 hours
    })
    
    it('should not merge non-overlapping periods', () => {
      const busy = [
        { start: '2026-01-15T10:00:00', end: '2026-01-15T11:00:00' },
        { start: '2026-01-15T14:00:00', end: '2026-01-15T15:00:00' }, // No overlap
      ]
      
      const result = mergeBusyPeriods(busy, timezone)
      
      expect(result).toHaveLength(2)
    })
    
    it('should handle adjacent periods (touching but not overlapping)', () => {
      const busy = [
        { start: '2026-01-15T10:00:00', end: '2026-01-15T11:00:00' },
        { start: '2026-01-15T11:00:00', end: '2026-01-15T12:00:00' }, // Adjacent
      ]
      
      const result = mergeBusyPeriods(busy, timezone)
      
      // Adjacent periods should be merged
      expect(result).toHaveLength(1)
      expect(result[0].end.getTime() - result[0].start.getTime()).toBe(2 * 60 * 60 * 1000) // 2 hours
    })
    
    it('should sort periods before merging', () => {
      const busy = [
        { start: '2026-01-15T14:00:00', end: '2026-01-15T15:00:00' },
        { start: '2026-01-15T10:00:00', end: '2026-01-15T11:00:00' }, // Out of order
        { start: '2026-01-15T10:30:00', end: '2026-01-15T12:00:00' }, // Overlaps with second
      ]
      
      const result = mergeBusyPeriods(busy, timezone)
      
      expect(result).toHaveLength(2)
      // First merged period should be earlier
      expect(result[0].start.getTime()).toBeLessThan(result[1].start.getTime())
    })
    
    it('should handle multiple overlapping periods', () => {
      const busy = [
        { start: '2026-01-15T10:00:00', end: '2026-01-15T11:00:00' },
        { start: '2026-01-15T10:30:00', end: '2026-01-15T11:30:00' },
        { start: '2026-01-15T11:00:00', end: '2026-01-15T12:00:00' },
      ]
      
      const result = mergeBusyPeriods(busy, timezone)
      
      expect(result).toHaveLength(1)
      expect(result[0].end.getTime() - result[0].start.getTime()).toBe(2 * 60 * 60 * 1000) // 2 hours
    })
    
    it('should handle contained periods (one period fully inside another)', () => {
      const busy = [
        { start: '2026-01-15T10:00:00', end: '2026-01-15T14:00:00' },
        { start: '2026-01-15T11:00:00', end: '2026-01-15T12:00:00' }, // Contained
      ]
      
      const result = mergeBusyPeriods(busy, timezone)
      
      expect(result).toHaveLength(1)
      expect(result[0].end.getTime() - result[0].start.getTime()).toBe(4 * 60 * 60 * 1000) // 4 hours
    })
    
    it('should handle empty busy periods array', () => {
      const result = mergeBusyPeriods([], timezone)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle single busy period', () => {
      const busy = [
        { start: '2026-01-15T10:00:00', end: '2026-01-15T11:00:00' },
      ]
      
      const result = mergeBusyPeriods(busy, timezone)
      
      expect(result).toHaveLength(1)
    })
  })
  
  describe('calculateFreeTimes', () => {
    it('should calculate free time between busy periods', () => {
      const mergedBusy = [
        { start: new Date('2026-01-15T10:00:00Z'), end: new Date('2026-01-15T11:00:00Z') },
        { start: new Date('2026-01-15T14:00:00Z'), end: new Date('2026-01-15T15:00:00Z') },
      ]
      const timeMin = new Date('2026-01-15T09:00:00Z')
      const timeMax = new Date('2026-01-15T17:00:00Z')
      
      const result = calculateFreeTimes(mergedBusy, timeMin, timeMax)
      
      expect(result).toHaveLength(3)
      // Free time before first busy period
      expect(result[0].start).toEqual(timeMin)
      expect(result[0].end).toEqual(mergedBusy[0].start)
      // Free time between busy periods
      expect(result[1].start).toEqual(mergedBusy[0].end)
      expect(result[1].end).toEqual(mergedBusy[1].start)
      // Free time after last busy period
      expect(result[2].start).toEqual(mergedBusy[1].end)
      expect(result[2].end).toEqual(timeMax)
    })
    
    it('should handle no busy periods (entire range is free)', () => {
      const mergedBusy: { start: Date; end: Date }[] = []
      const timeMin = new Date('2026-01-15T09:00:00Z')
      const timeMax = new Date('2026-01-15T17:00:00Z')
      
      const result = calculateFreeTimes(mergedBusy, timeMin, timeMax)
      
      expect(result).toHaveLength(1)
      expect(result[0].start).toEqual(timeMin)
      expect(result[0].end).toEqual(timeMax)
    })
    
    it('should handle busy period at start of range', () => {
      const mergedBusy = [
        { start: new Date('2026-01-15T09:00:00Z'), end: new Date('2026-01-15T10:00:00Z') },
      ]
      const timeMin = new Date('2026-01-15T09:00:00Z')
      const timeMax = new Date('2026-01-15T17:00:00Z')
      
      const result = calculateFreeTimes(mergedBusy, timeMin, timeMax)
      
      expect(result).toHaveLength(1)
      expect(result[0].start).toEqual(mergedBusy[0].end)
      expect(result[0].end).toEqual(timeMax)
    })
    
    it('should handle busy period at end of range', () => {
      const mergedBusy = [
        { start: new Date('2026-01-15T16:00:00Z'), end: new Date('2026-01-15T17:00:00Z') },
      ]
      const timeMin = new Date('2026-01-15T09:00:00Z')
      const timeMax = new Date('2026-01-15T17:00:00Z')
      
      const result = calculateFreeTimes(mergedBusy, timeMin, timeMax)
      
      expect(result).toHaveLength(1)
      expect(result[0].start).toEqual(timeMin)
      expect(result[0].end).toEqual(mergedBusy[0].start)
    })
    
    it('should handle entire range being busy', () => {
      const mergedBusy = [
        { start: new Date('2026-01-15T09:00:00Z'), end: new Date('2026-01-15T17:00:00Z') },
      ]
      const timeMin = new Date('2026-01-15T09:00:00Z')
      const timeMax = new Date('2026-01-15T17:00:00Z')
      
      const result = calculateFreeTimes(mergedBusy, timeMin, timeMax)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle busy period extending beyond range', () => {
      const mergedBusy = [
        { start: new Date('2026-01-15T08:00:00Z'), end: new Date('2026-01-15T18:00:00Z') },
      ]
      const timeMin = new Date('2026-01-15T09:00:00Z')
      const timeMax = new Date('2026-01-15T17:00:00Z')
      
      const result = calculateFreeTimes(mergedBusy, timeMin, timeMax)
      
      expect(result).toHaveLength(0)
    })
    
    it('should handle multiple busy periods with small gaps', () => {
      const mergedBusy = [
        { start: new Date('2026-01-15T10:00:00Z'), end: new Date('2026-01-15T10:30:00Z') },
        { start: new Date('2026-01-15T10:45:00Z'), end: new Date('2026-01-15T11:15:00Z') },
        { start: new Date('2026-01-15T11:30:00Z'), end: new Date('2026-01-15T12:00:00Z') },
      ]
      const timeMin = new Date('2026-01-15T09:00:00Z')
      const timeMax = new Date('2026-01-15T13:00:00Z')
      
      const result = calculateFreeTimes(mergedBusy, timeMin, timeMax)
      
      expect(result).toHaveLength(4)
      // Verify gaps are correct
      expect(result[1].end.getTime() - result[1].start.getTime()).toBe(15 * 60 * 1000) // 15 minutes
      expect(result[2].end.getTime() - result[2].start.getTime()).toBe(15 * 60 * 1000) // 15 minutes
    })
  })
})

