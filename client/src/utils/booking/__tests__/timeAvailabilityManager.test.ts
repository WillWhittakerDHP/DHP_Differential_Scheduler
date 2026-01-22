/**
 * TIME AVAILABILITY MANAGER TESTS
 * 
 * Unit tests for busy period validation, sorting, merging, and preprocessing.
 * Tests the Category 5 improvements for busy period handling.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { 
  preprocessBusyPeriods,
  generateSlotsWithAvailability,
  type BusyTimeRange
} from '../timeAvailabilityManager'
import { DEFAULT_INCLUDE_FLAGS, type BusinessHoursMap } from '../timeSlotFitter'
import {
  setTestBaseDate,
  nextMonday9AM,
  nextMonday7PM,
  nextDayAtTime,
  createBusyTimeRange
} from './testDateHelpers'

// ===================================================================
// TEST DATA SETUP
// ===================================================================

// LEARNING: Set base date for consistent test runs
// WHY: Ensures all dynamic dates are relative to a known point
// PATTERN: Set once at test suite start, use helpers throughout
beforeAll(() => {
  // Use a fixed date in the future to ensure tests don't use past dates
  const futureDate = new Date()
  futureDate.setUTCDate(futureDate.getUTCDate() + 7) // 7 days in the future
  setTestBaseDate(futureDate)
})

/**
 * Standard business hours (9 AM - 7 PM, Monday-Friday)
 * LEARNING: Uses RFC3339 reference date format (2000-01-01) for time-of-day storage
 * WHY: Business hours are stored as RFC3339 with reference date
 * PATTERN: Reference date is fixed, only time-of-day matters
 */
const standardBusinessHours: BusinessHoursMap = {
  1: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T19:00:00Z' }, // Monday
  2: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T19:00:00Z' }, // Tuesday
  3: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T19:00:00Z' }, // Wednesday
  4: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T19:00:00Z' }, // Thursday
  5: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T19:00:00Z' }  // Friday
}

// ===================================================================
// BUSY PERIOD VALIDATION TESTS
// ===================================================================

describe('preprocessBusyPeriods', () => {
  describe('validation', () => {
    it('should filter out invalid busy periods with start >= end', () => {
      const valid1 = nextDayAtTime(1, 10, 0)
      const valid2 = nextDayAtTime(1, 18, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: valid1, end: nextDayAtTime(1, 12, 0) }, // Valid
        { start: nextDayAtTime(1, 14, 0), end: nextDayAtTime(1, 14, 0) }, // Invalid: start === end
        { start: nextDayAtTime(1, 16, 0), end: nextDayAtTime(1, 15, 0) }, // Invalid: start > end
        { start: valid2, end: nextDayAtTime(1, 19, 0) }  // Valid
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(2)
      expect(result[0].start).toBe(valid1)
      expect(result[1].start).toBe(valid2)
    })

    it('should filter out invalid busy periods with invalid datetime strings', () => {
      const validStart = nextDayAtTime(1, 10, 0)
      const validEnd = nextDayAtTime(1, 12, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: validStart, end: validEnd }, // Valid
        { start: 'invalid-datetime', end: nextDayAtTime(1, 15, 0) },     // Invalid start
        { start: nextDayAtTime(1, 16, 0), end: 'invalid-datetime' }       // Invalid end
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(1)
      expect(result[0].start).toBe(validStart)
    })

    it('should return empty array for all invalid busy periods', () => {
      const busyTimes: BusyTimeRange[] = [
        { start: nextDayAtTime(1, 14, 0), end: nextDayAtTime(1, 14, 0) }, // Invalid: start === end
        { start: 'invalid', end: 'invalid' }                              // Invalid
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result).toEqual([])
    })

    it('should return empty array for empty input', () => {
      const result = preprocessBusyPeriods([])
      expect(result).toEqual([])
    })
  })

  describe('sorting', () => {
    it('should sort busy periods by start time', () => {
      const time1 = nextDayAtTime(1, 10, 0)
      const time2 = nextDayAtTime(1, 14, 0)
      const time3 = nextDayAtTime(1, 16, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: time3, end: nextDayAtTime(1, 17, 0) },
        { start: time1, end: nextDayAtTime(1, 11, 0) },
        { start: time2, end: nextDayAtTime(1, 15, 0) }
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(3)
      expect(result[0].start).toBe(time1)
      expect(result[1].start).toBe(time2)
      expect(result[2].start).toBe(time3)
    })
  })

  describe('merging', () => {
    it('should merge overlapping busy periods', () => {
      const start1 = nextDayAtTime(1, 10, 0)
      const end1 = nextDayAtTime(1, 11, 0)
      const start2 = nextDayAtTime(1, 10, 30)
      const end2 = nextDayAtTime(1, 12, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: start1, end: end1 },
        { start: start2, end: end2 } // Overlaps
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(1)
      expect(result[0].start).toBe(start1)
      expect(result[0].end).toBe(end2)
    })

    it('should merge adjacent busy periods', () => {
      const start1 = nextDayAtTime(1, 10, 0)
      const end1 = nextDayAtTime(1, 11, 0)
      const start2 = nextDayAtTime(1, 11, 0)
      const end2 = nextDayAtTime(1, 12, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: start1, end: end1 },
        { start: start2, end: end2 } // Adjacent
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(1)
      expect(result[0].start).toBe(start1)
      expect(result[0].end).toBe(end2)
    })

    it('should keep non-overlapping periods separate', () => {
      const time1 = nextDayAtTime(1, 10, 0)
      const time2 = nextDayAtTime(1, 12, 0)
      const time3 = nextDayAtTime(1, 14, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: time1, end: nextDayAtTime(1, 11, 0) },
        { start: time2, end: nextDayAtTime(1, 13, 0) }, // Gap between
        { start: time3, end: nextDayAtTime(1, 15, 0) }   // Gap between
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(3)
      expect(result[0].start).toBe(time1)
      expect(result[1].start).toBe(time2)
      expect(result[2].start).toBe(time3)
    })

    it('should merge multiple overlapping periods into one', () => {
      const start1 = nextDayAtTime(1, 10, 0)
      const end3 = nextDayAtTime(1, 13, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: start1, end: nextDayAtTime(1, 11, 0) },
        { start: nextDayAtTime(1, 10, 30), end: nextDayAtTime(1, 12, 0) }, // Overlaps first
        { start: nextDayAtTime(1, 11, 30), end: end3 }  // Overlaps second
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(1)
      expect(result[0].start).toBe(start1)
      expect(result[0].end).toBe(end3)
    })

    it('should extend end time when merging periods', () => {
      const start1 = nextDayAtTime(1, 10, 0)
      const end2 = nextDayAtTime(1, 13, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: start1, end: nextDayAtTime(1, 12, 0) },
        { start: nextDayAtTime(1, 11, 0), end: end2 } // Extends end
      ]

      const result = preprocessBusyPeriods(busyTimes)

      expect(result.length).toBe(1)
      expect(result[0].start).toBe(start1)
      expect(result[0].end).toBe(end2)
    })
  })

  describe('integration', () => {
    it('should validate, sort, and merge busy periods in correct order', () => {
      const time1 = nextDayAtTime(1, 10, 0)
      const time2 = nextDayAtTime(1, 16, 0)
      const end1 = nextDayAtTime(1, 12, 0)
      const end2 = nextDayAtTime(1, 17, 0)
      
      const busyTimes: BusyTimeRange[] = [
        { start: time2, end: end2 }, // Valid, later
        { start: nextDayAtTime(1, 14, 0), end: nextDayAtTime(1, 14, 0) }, // Invalid: start === end
        { start: time1, end: nextDayAtTime(1, 11, 0) }, // Valid, earlier
        { start: nextDayAtTime(1, 10, 30), end: end1 }, // Valid, overlaps with third
        { start: 'invalid', end: 'invalid' }                               // Invalid
      ]

      const result = preprocessBusyPeriods(busyTimes)

      // Should have 2 merged periods (sorted)
      expect(result.length).toBe(2)
      expect(result[0].start).toBe(time1)
      expect(result[0].end).toBe(end1) // Merged
      expect(result[1].start).toBe(time2)
      expect(result[1].end).toBe(end2)
    })
  })
})

// ===================================================================
// INTEGRATION TESTS WITH SLOT GENERATION
// ===================================================================

describe('generateSlotsWithAvailability with preprocessed busy periods', () => {
  it('should correctly mark slots unavailable with merged busy periods', () => {
    const busyStart = nextDayAtTime(1, 10, 0)
    const busyEnd = nextDayAtTime(1, 12, 0)
    
    const busyTimes: BusyTimeRange[] = [
      { start: busyStart, end: nextDayAtTime(1, 11, 0) },
      { start: nextDayAtTime(1, 10, 30), end: busyEnd } // Overlaps, should merge
    ]

    const result = generateSlotsWithAvailability({
      startBoundary: nextMonday9AM(),
      endBoundary: nextMonday7PM(),
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes,
      includeFlags: DEFAULT_INCLUDE_FLAGS
    })

    // Should have slots
    expect(result.slots.length).toBeGreaterThan(0)

    // Slots from 10:00-12:00 should be unavailable (merged busy period covers this)
    const unavailableSlots = result.slots.filter(slot => {
      const slotStart = new Date(slot.startTime)
      const slotEnd = new Date(slot.endTime)
      const busyStartDate = new Date(busyStart)
      const busyEndDate = new Date(busyEnd)
      
      return slotStart < busyEndDate && slotEnd > busyStartDate
    })

    // All slots overlapping the merged busy period should be unavailable
    unavailableSlots.forEach(slot => {
      expect(slot.isAvailable).toBe(false)
    })
  })

  it('should filter invalid busy periods before slot generation', () => {
    const busyStart = nextDayAtTime(1, 10, 0)
    const busyEnd = nextDayAtTime(1, 12, 0)
    
    const busyTimes: BusyTimeRange[] = [
      { start: busyStart, end: busyEnd }, // Valid
      { start: nextDayAtTime(1, 14, 0), end: nextDayAtTime(1, 14, 0) }, // Invalid: start === end
      { start: 'invalid', end: 'invalid' }                              // Invalid
    ]

    const result = generateSlotsWithAvailability({
      startBoundary: nextMonday9AM(),
      endBoundary: nextMonday7PM(),
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes,
      includeFlags: DEFAULT_INCLUDE_FLAGS
    })

    // Should generate slots successfully (invalid busy periods filtered)
    expect(result.slots.length).toBeGreaterThan(0)

    // Slots from 10:00-12:00 should be unavailable (valid busy period)
    const unavailableSlots = result.slots.filter(slot => {
      const slotStart = new Date(slot.startTime)
      const slotEnd = new Date(slot.endTime)
      const busyStartDate = new Date(busyStart)
      const busyEndDate = new Date(busyEnd)
      
      return slotStart < busyEndDate && slotEnd > busyStartDate
    })

    unavailableSlots.forEach(slot => {
      expect(slot.isAvailable).toBe(false)
    })
  })

  it('should track earliest completion of available slots only', () => {
    const busyEnd = nextDayAtTime(1, 11, 0)
    
    const busyTimes: BusyTimeRange[] = [
      { start: nextMonday9AM(), end: busyEnd } // Makes first slots unavailable
    ]

    const result = generateSlotsWithAvailability({
      startBoundary: nextMonday9AM(),
      endBoundary: nextMonday7PM(),
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes,
      includeFlags: DEFAULT_INCLUDE_FLAGS
    })

    // Should have earliest completion
    expect(result.earliestCompletion).toBeTruthy()

    // Earliest completion should be from an available slot (after 11:00)
    if (result.earliestCompletion) {
      const earliestCompletionDate = new Date(result.earliestCompletion)
      const busyEndDate = new Date(busyEnd)
      
      // Earliest completion should be after busy period ends
      expect(earliestCompletionDate.getTime()).toBeGreaterThan(busyEndDate.getTime())

      // Verify it matches an available slot's end time
      const availableSlots = result.slots.filter(slot => slot.isAvailable)
      const earliestAvailableSlot = availableSlots.reduce((earliest, slot) => {
        const slotEnd = new Date(slot.endTime)
        const earliestEnd = new Date(earliest.endTime)
        return slotEnd < earliestEnd ? slot : earliest
      })

      expect(earliestAvailableSlot.endTime).toBe(result.earliestCompletion)
    }
  })
})
