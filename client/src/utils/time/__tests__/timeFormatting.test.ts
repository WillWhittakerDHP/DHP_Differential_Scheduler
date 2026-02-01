/**
 * TIME FORMATTING TESTS
 * 
 * Unit tests for timeFormatting utility functions.
 * Tests time range formatting, slot comparison, duration formatting.
 * 
 * What it covers:
 * - formatTimeRange: Converting TimeSlot to readable time range
 * - areSlotsEqual: Comparing two TimeSlot objects
 * - formatDuration: Converting minutes to human-readable duration
 * - getTodayDate: Getting current date in YYYY-MM-DD format
 * - getFirstAvailabilityDate: Finding earliest date from slots
 * 
 * How it works:
 * - Pure function tests with various input combinations
 * - Tests edge cases like null, empty, midnight, noon
 * - Tests MaybeRef pattern (both plain arrays and refs)
 * 
 * What it validates:
 * - Correct AM/PM formatting
 * - Proper hour conversion (12-hour format)
 * - Null handling for slot comparison
 * - Duration edge cases (0, hours only, minutes only, both)
 * 
 * Dependencies:
 * - vitest for testing
 * - timeFormatting utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import {
  formatTimeRange,
  areSlotsEqual,
  formatDuration,
  getTodayDate,
  getFirstAvailabilityDate,
  type TimeSlot,
} from '../timeFormatting'

function createSlot(startHour: number, startMin: number, endHour: number, endMin: number): TimeSlot {
  const start = new Date(2026, 0, 9, startHour, startMin, 0)
  const end = new Date(2026, 0, 9, endHour, endMin, 0)
  const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  return {
    slotStart: start.toISOString(),
    slotEnd: end.toISOString(),
    duration,
  }
}

describe('timeFormatting', () => {
  describe('formatTimeRange', () => {
    it('should format morning time range', () => {
      const slot = createSlot(9, 0, 10, 0)
      
      expect(formatTimeRange(slot)).toBe('9:00 AM - 10:00 AM')
    })

    it('should format afternoon time range', () => {
      const slot = createSlot(14, 0, 15, 30)
      
      expect(formatTimeRange(slot)).toBe('2:00 PM - 3:30 PM')
    })

    it('should handle noon correctly (12 PM, not 0 PM)', () => {
      const slot = createSlot(12, 0, 13, 0)
      
      expect(formatTimeRange(slot)).toBe('12:00 PM - 1:00 PM')
    })

    it('should handle midnight correctly (12 AM, not 0 AM)', () => {
      const slot = createSlot(0, 0, 1, 0)
      
      expect(formatTimeRange(slot)).toBe('12:00 AM - 1:00 AM')
    })

    it('should format time crossing noon', () => {
      const slot = createSlot(11, 30, 13, 30)
      
      expect(formatTimeRange(slot)).toBe('11:30 AM - 1:30 PM')
    })

    it('should pad minutes with leading zero', () => {
      const slot = createSlot(9, 5, 10, 5)
      
      expect(formatTimeRange(slot)).toBe('9:05 AM - 10:05 AM')
    })

    it('should handle end of day times', () => {
      const slot = createSlot(23, 0, 23, 59)
      
      expect(formatTimeRange(slot)).toBe('11:00 PM - 11:59 PM')
    })
  })

  describe('areSlotsEqual', () => {
    it('should return true for equal slots', () => {
      const slot1 = createSlot(9, 0, 10, 0)
      const slot2 = createSlot(9, 0, 10, 0)
      
      expect(areSlotsEqual(slot1, slot2)).toBe(true)
    })

    it('should return false when start times differ', () => {
      const slot1 = createSlot(9, 0, 10, 0)
      const slot2 = createSlot(9, 30, 10, 0)
      
      expect(areSlotsEqual(slot1, slot2)).toBe(false)
    })

    it('should return false when end times differ', () => {
      const slot1 = createSlot(9, 0, 10, 0)
      const slot2 = createSlot(9, 0, 10, 30)
      
      expect(areSlotsEqual(slot1, slot2)).toBe(false)
    })

    it('should return false when first slot is null', () => {
      const slot2 = createSlot(9, 0, 10, 0)
      
      expect(areSlotsEqual(null, slot2)).toBe(false)
    })

    it('should return false when second slot is null', () => {
      const slot1 = createSlot(9, 0, 10, 0)
      
      expect(areSlotsEqual(slot1, null)).toBe(false)
    })

    it('should return false when both slots are null', () => {
      expect(areSlotsEqual(null, null)).toBe(false)
    })

    it('should compare same slot object reference', () => {
      const slot = createSlot(9, 0, 10, 0)
      
      expect(areSlotsEqual(slot, slot)).toBe(true)
    })
  })

  describe('formatDuration', () => {
    it('should format 0 minutes', () => {
      expect(formatDuration(0)).toBe('0m')
    })

    it('should format minutes only (< 60)', () => {
      expect(formatDuration(30)).toBe('30m')
      expect(formatDuration(45)).toBe('45m')
    })

    it('should format hours only (exact hours)', () => {
      expect(formatDuration(60)).toBe('1h')
      expect(formatDuration(120)).toBe('2h')
      expect(formatDuration(180)).toBe('3h')
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m')
      expect(formatDuration(135)).toBe('2h 15m')
    })

    it('should handle 1 minute', () => {
      expect(formatDuration(1)).toBe('1m')
    })

    it('should handle 59 minutes', () => {
      expect(formatDuration(59)).toBe('59m')
    })

    it('should handle 61 minutes', () => {
      expect(formatDuration(61)).toBe('1h 1m')
    })

    it('should handle large durations', () => {
      expect(formatDuration(480)).toBe('8h')
      expect(formatDuration(495)).toBe('8h 15m')
    })
  })

  describe('getTodayDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date(2026, 0, 9)) // Jan 9, 2026
      
      const result = getTodayDate()
      
      expect(result).toBe('2026-01-09')
    })

    it('should pad month with leading zero', () => {
      vi.setSystemTime(new Date(2026, 5, 15)) // Jun 15, 2026
      
      const result = getTodayDate()
      
      expect(result).toBe('2026-06-15')
    })

    it('should pad day with leading zero', () => {
      vi.setSystemTime(new Date(2026, 11, 5)) // Dec 5, 2026
      
      const result = getTodayDate()
      
      expect(result).toBe('2026-12-05')
    })
  })

  describe('getFirstAvailabilityDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 0, 9)) // Jan 9, 2026
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return earliest date from slots', () => {
      const slots: TimeSlot[] = [
        { slotStart: '2026-01-15T09:00:00Z', slotEnd: '2026-01-15T10:00:00Z', duration: 60 },
        { slotStart: '2026-01-10T09:00:00Z', slotEnd: '2026-01-10T10:00:00Z', duration: 60 },
        { slotStart: '2026-01-12T09:00:00Z', slotEnd: '2026-01-12T10:00:00Z', duration: 60 },
      ]
      
      const result = getFirstAvailabilityDate(slots)
      
      expect(result).toBe('2026-01-10')
    })

    it('should return today when slots array is empty', () => {
      const result = getFirstAvailabilityDate([])
      
      expect(result).toBe('2026-01-09')
    })

    it('should work with MaybeRef (ref wrapper)', () => {
      const slotsRef = ref<TimeSlot[]>([
        { slotStart: '2026-01-20T09:00:00Z', slotEnd: '2026-01-20T10:00:00Z', duration: 60 },
      ])
      
      const result = getFirstAvailabilityDate(slotsRef)
      
      expect(result).toBe('2026-01-20')
    })

    it('should work with MaybeRef (plain array)', () => {
      const slots: TimeSlot[] = [
        { slotStart: '2026-01-20T09:00:00Z', slotEnd: '2026-01-20T10:00:00Z', duration: 60 },
      ]
      
      const result = getFirstAvailabilityDate(slots)
      
      expect(result).toBe('2026-01-20')
    })

    it('should handle single slot', () => {
      const slots: TimeSlot[] = [
        { slotStart: '2026-02-01T14:00:00Z', slotEnd: '2026-02-01T15:00:00Z', duration: 60 },
      ]
      
      const result = getFirstAvailabilityDate(slots)
      
      expect(result).toBe('2026-02-01')
    })

    it('should handle slots on same day', () => {
      const slots: TimeSlot[] = [
        { slotStart: '2026-01-15T14:00:00Z', slotEnd: '2026-01-15T15:00:00Z', duration: 60 },
        { slotStart: '2026-01-15T09:00:00Z', slotEnd: '2026-01-15T10:00:00Z', duration: 60 },
      ]
      
      const result = getFirstAvailabilityDate(slots)
      
      expect(result).toBe('2026-01-15')
    })

    it('should return today when ref has empty array', () => {
      const slotsRef = ref<TimeSlot[]>([])
      
      const result = getFirstAvailabilityDate(slotsRef)
      
      expect(result).toBe('2026-01-09')
    })
  })
})
