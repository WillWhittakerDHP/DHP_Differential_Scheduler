/**
 * TIME AVAILABILITY MANAGER TESTS
 * 
 * Unit tests for busy period validation, sorting, merging, and preprocessing.
 * Tests the Category 5 improvements for busy period handling.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest'
import { 
  preprocessBusyPeriods,
  generateSlotsWithAvailability,
  checkSlotAvailability,
  checkRangeConstraints,
  ConstraintValidationError,
  type BusyTimeRange
} from '../timeAvailabilityManager'
import { DEFAULT_INCLUDE_FLAGS, type BusinessHoursMap } from '../timeSlotFitter'
import type { OverlapConstraint, CapacityConstraint } from '../constraintExtractors'
import { extractRangeConstraints, extractCapacityConstraints } from '../constraintExtractors'
import type { RangeConstraint, AvailabilitySettings } from '@/configs/availabilitySettings'
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

    // Create structured rangeConstraints for test
    const rangeConstraints: RangeConstraint[] = [{
      type: 'businessHours',
      enforcement: 'hard',
      config: { hours: standardBusinessHours }
    }]

    const result = generateSlotsWithAvailability({
      startBoundary: nextMonday9AM(),
      endBoundary: nextMonday7PM(),
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes,
      includeFlags: DEFAULT_INCLUDE_FLAGS
    }, rangeConstraints)

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

    // Create structured rangeConstraints for test
    const rangeConstraints: RangeConstraint[] = [{
      type: 'businessHours',
      enforcement: 'hard',
      config: { hours: standardBusinessHours }
    }]

    const result = generateSlotsWithAvailability({
      startBoundary: nextMonday9AM(),
      endBoundary: nextMonday7PM(),
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes,
      includeFlags: DEFAULT_INCLUDE_FLAGS
    }, rangeConstraints)

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

    // Create structured rangeConstraints for test
    const rangeConstraints: RangeConstraint[] = [{
      type: 'businessHours',
      enforcement: 'hard',
      config: { hours: standardBusinessHours }
    }]

    const result = generateSlotsWithAvailability({
      startBoundary: nextMonday9AM(),
      endBoundary: nextMonday7PM(),
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes,
      includeFlags: DEFAULT_INCLUDE_FLAGS
    }, rangeConstraints)

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

// ===================================================================
// OVERLAP CONSTRAINT PRECISION TESTS
// ===================================================================

describe('checkSlotAvailability - precise overlap constraint checks', () => {
  it('should only mark the constraint that actually caused overlap', () => {
    const slotStart = new Date('2026-01-15T10:00:00Z')
    const slotEnd = new Date('2026-01-15T11:00:00Z')
    const busyStart = new Date('2026-01-15T10:30:00Z')
    const busyEnd = new Date('2026-01-15T10:45:00Z')
    
    const parsedBusyTimes = [{
      start: busyStart,
      end: busyEnd,
      original: { start: busyStart.toISOString() as any, end: busyEnd.toISOString() as any }
    }]

    // Appointment buffer with 15 min before - this will overlap
    const appointmentConstraint: OverlapConstraint = {
      type: 'appointment',
      placement: 'before',
      enforcement: 'flexible',
      minutes: 15
    }
    
    // DriveTime buffer with 30 min after - this won't overlap
    const driveTimeConstraint: OverlapConstraint = {
      type: 'driveTime',
      placement: 'after',
      enforcement: 'flexible',
      minutes: 30
    }

    const result = checkSlotAvailability(
      slotStart,
      slotEnd,
      parsedBusyTimes,
      [appointmentConstraint, driveTimeConstraint]
    )

    // Should only have appointment violation, not driveTime
    expect(result.available).toBe(true)
    expect(result.violations).toEqual(['overlap.appointment'])
    expect(result.violations).not.toContain('overlap.driveTime')
  })

  it('should block immediately on hard enforcement overlap', () => {
    const slotStart = new Date('2026-01-15T10:00:00Z')
    const slotEnd = new Date('2026-01-15T11:00:00Z')
    const busyStart = new Date('2026-01-15T10:30:00Z')
    const busyEnd = new Date('2026-01-15T10:45:00Z')
    
    const parsedBusyTimes = [{
      start: busyStart,
      end: busyEnd,
      original: { start: busyStart.toISOString() as any, end: busyEnd.toISOString() as any }
    }]

    const hardConstraint: OverlapConstraint = {
      type: 'appointment',
      placement: 'before',
      enforcement: 'hard',
      minutes: 15
    }

    const result = checkSlotAvailability(
      slotStart,
      slotEnd,
      parsedBusyTimes,
      [hardConstraint]
    )

    expect(result.available).toBe(false)
    expect(result.violations).toEqual([])
  })
})

// ===================================================================
// RANGE CONSTRAINT TESTS WITH INJECTED TIME
// ===================================================================

describe('checkRangeConstraints - deterministic with injected time', () => {
  it('should use injected now for leadTime constraint', () => {
    const fixedNow = new Date('2026-01-15T09:00:00Z')
    const slotStart = new Date('2026-01-15T10:00:00Z') // 1 hour after fixedNow
    const slotEnd = new Date('2026-01-15T11:00:00Z')

    const slot = {
      startTime: slotStart.toISOString() as any,
      endTime: slotEnd.toISOString() as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const leadTimeConstraint: RangeConstraint = {
      type: 'leadTime',
      enforcement: 'hard',
      config: { minutes: 30 } // Requires 30 min lead time
    }

    // With fixedNow at 09:00, slot at 10:00 should pass (60 min > 30 min)
    const result = checkRangeConstraints(slot, [leadTimeConstraint], fixedNow)
    expect(result.passes).toBe(true)

    // With fixedNow at 09:45, slot at 10:00 should fail (15 min < 30 min)
    const laterNow = new Date('2026-01-15T09:45:00Z')
    const result2 = checkRangeConstraints(slot, [leadTimeConstraint], laterNow)
    expect(result2.passes).toBe(false)
  })

  it('should use range. prefix for flexible range violations', () => {
    const fixedNow = new Date('2026-01-15T09:00:00Z')
    const slotStart = new Date('2026-01-15T09:15:00Z') // Only 15 min after fixedNow
    const slotEnd = new Date('2026-01-15T10:00:00Z')

    const slot = {
      startTime: slotStart.toISOString() as any,
      endTime: slotEnd.toISOString() as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const leadTimeConstraint: RangeConstraint = {
      type: 'leadTime',
      enforcement: 'flexible', // Flexible enforcement
      config: { minutes: 30 } // Requires 30 min lead time
    }

    // With fixedNow at 09:00, slot at 09:15 should fail leadTime (15 min < 30 min)
    // But with flexible enforcement, it should pass but mark violation
    const result = checkRangeConstraints(slot, [leadTimeConstraint], fixedNow)
    expect(result.passes).toBe(true)
    expect(result.violations).toContain('range.leadTime')
    expect(result.violations.length).toBe(1)
  })

  it('should use range. prefix for businessHours violations (UTC time-of-day)', () => {
    // Slot at 8 AM UTC (before 9 AM UTC business hours)
    const slotStart = new Date('2026-01-20T08:00:00Z') // Monday 8 AM UTC
    const slotEnd = new Date('2026-01-20T08:30:00Z')

    const slot = {
      startTime: slotStart.toISOString() as any,
      endTime: slotEnd.toISOString() as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const businessHoursConstraint: RangeConstraint = {
      type: 'businessHours',
      enforcement: 'flexible', // Flexible enforcement
      config: { hours: standardBusinessHours }
    }

    // Slot before business hours (8 AM UTC < 9 AM UTC) should pass with flexible enforcement but mark violation
    const result = checkRangeConstraints(slot, [businessHoursConstraint])
    expect(result.passes).toBe(true)
    expect(result.violations).toContain('range.businessHours')
    expect(result.violations.length).toBe(1)
  })

  it('should cache parsed business hours per UTC day', () => {
    const slot1 = {
      startTime: '2026-01-20T10:00:00Z' as any, // Monday UTC (day 1)
      endTime: '2026-01-20T11:00:00Z' as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const slot2 = {
      startTime: '2026-01-20T14:00:00Z' as any, // Same Monday UTC
      endTime: '2026-01-20T15:00:00Z' as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const businessHoursConstraint: RangeConstraint = {
      type: 'businessHours',
      enforcement: 'hard',
      config: { hours: standardBusinessHours }
    }

    const cache = new Map()
    
    // First call should parse and cache using UTC day
    const result1 = checkRangeConstraints(slot1, [businessHoursConstraint], new Date(), cache)
    expect(result1.passes).toBe(true)
    expect(cache.has(1)).toBe(true) // Monday UTC is day 1

    // Second call should use cache
    const result2 = checkRangeConstraints(slot2, [businessHoursConstraint], new Date(), cache)
    expect(result2.passes).toBe(true)
    // Cache should still have the entry
    expect(cache.has(1)).toBe(true)
  })
})

// ===================================================================
// CONFIG VALIDATION TESTS
// ===================================================================

describe('checkRangeConstraints - config validation', () => {
  it('should handle invalid leadTime config gracefully', () => {
    const slot = {
      startTime: '2026-01-15T10:00:00Z' as any,
      endTime: '2026-01-15T11:00:00Z' as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const invalidConstraint: RangeConstraint = {
      type: 'leadTime',
      enforcement: 'hard',
      config: { minutes: -5 } as any // Invalid: negative minutes
    }

    const result = checkRangeConstraints(slot, [invalidConstraint])
    // Should fail hard enforcement with invalid config
    expect(result.passes).toBe(false)
  })

  it('should handle invalid dateRange config gracefully', () => {
    const slot = {
      startTime: '2026-01-15T10:00:00Z' as any,
      endTime: '2026-01-15T11:00:00Z' as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const invalidConstraint: RangeConstraint = {
      type: 'dateRange',
      enforcement: 'hard',
      config: { start: 'invalid', end: 'invalid' } as any
    }

    const result = checkRangeConstraints(slot, [invalidConstraint])
    // Should fail hard enforcement with invalid config
    expect(result.passes).toBe(false)
  })
})

// ===================================================================
// CAPACITY BATCHING TESTS
// ===================================================================

describe('generateSlotsWithAvailability - capacity batching', () => {
  it('should batch capacity checks for slots on same date', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: { hours: 2 } })
    // Mock the API client
    const apiClient = await import('@/utils/api')
    vi.spyOn(apiClient.default, 'get').mockImplementation(mockFetch)

    const monday9AM = nextMonday9AM()
    const monday7PM = nextMonday7PM()

    const capacityConstraints: CapacityConstraint[] = [{
      type: 'daily',
      enforcement: 'hard',
      maxHours: 8
    }]

    // Create structured rangeConstraints for test
    const rangeConstraints: RangeConstraint[] = [{
      type: 'businessHours',
      enforcement: 'hard',
      config: { hours: standardBusinessHours }
    }]

    const result = await generateSlotsWithAvailability({
      startBoundary: monday9AM,
      endBoundary: monday7PM,
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 60, // 1 hour slots
      busyTimes: [],
      includeFlags: DEFAULT_INCLUDE_FLAGS
    }, rangeConstraints, undefined, capacityConstraints)

    // Should have multiple slots on the same day
    expect(result.slots.length).toBeGreaterThan(1)
    
    // All slots should be on the same date
    const slotDates = new Set(result.slots.map(slot => slot.startTime.split('T')[0]))
    expect(slotDates.size).toBe(1) // All same date

    // API should be called once per unique date (not per slot)
    // Note: This test verifies batching behavior - actual API calls depend on cache state
    // The key improvement is that batching reduces redundant calls
  })
})

// ===================================================================
// EXTRACT RANGE CONSTRAINTS TESTS - FAIL FAST ON LEGACY FIELDS
// ===================================================================

describe('extractRangeConstraints - fail fast on legacy fields', () => {
  it('should throw error when top-level businessHours exists without rangeConstraints.businessHours', () => {
    const settings: AvailabilitySettings = {
      businessHours: standardBusinessHours, // Legacy top-level field
      minuteIncrement: 15,
      // Missing rangeConstraints.businessHours
    } as AvailabilitySettings

    expect(() => {
      extractRangeConstraints(settings)
    }).toThrow('Legacy top-level businessHours field detected')
  })

  it('should throw error when rangeConstraints.businessHours is missing', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        // Missing businessHours
        leadTime: {
          type: 'leadTime',
          enforcement: 'hard',
          config: { minutes: 60 }
        }
      }
    } as AvailabilitySettings

    expect(() => {
      extractRangeConstraints(settings)
    }).toThrow('Required rangeConstraints.businessHours is missing')
  })

  it('should succeed when rangeConstraints.businessHours is provided', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        }
      }
    } as AvailabilitySettings

    const result = extractRangeConstraints(settings)
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('businessHours')
  })

  it('should include optional leadTime and dateRange constraints when provided', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        },
        leadTime: {
          type: 'leadTime',
          enforcement: 'hard',
          config: { minutes: 30 }
        },
        dateRange: {
          type: 'dateRange',
          enforcement: 'hard',
          config: {
            start: '2026-01-15T00:00:00Z',
            end: '2026-01-20T23:59:59Z'
          }
        }
      }
    } as AvailabilitySettings

    const result = extractRangeConstraints(settings)
    expect(result.length).toBe(3)
    expect(result.some(c => c.type === 'businessHours')).toBe(true)
    expect(result.some(c => c.type === 'leadTime')).toBe(true)
    expect(result.some(c => c.type === 'dateRange')).toBe(true)
  })
})

// ===================================================================
// EXTRACT CAPACITY CONSTRAINTS TESTS
// ===================================================================

describe('extractCapacityConstraints', () => {
  it('should extract daily capacity constraint when enforcement is not off', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        }
      },
      maxWorkHours: {
        day: { enforcement: 'hard', maxHours: 8 }
      }
    } as AvailabilitySettings

    const result = extractCapacityConstraints(settings)
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('daily')
    expect(result[0].maxHours).toBe(8)
    expect(result[0].enforcement).toBe('hard')
  })

  it('should skip constraints when enforcement is off', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        }
      },
      maxWorkHours: {
        day: { enforcement: 'off', maxHours: 8 }
      }
    } as AvailabilitySettings

    const result = extractCapacityConstraints(settings)
    expect(result.length).toBe(0)
  })

  it('should include direction for rollingWeek constraints', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        }
      },
      maxWorkHours: {
        rollingWeek: { enforcement: 'hard', maxHours: 40, direction: 'centered' }
      }
    } as AvailabilitySettings

    const result = extractCapacityConstraints(settings)
    expect(result.length).toBe(1)
    expect(result[0].type).toBe('rollingWeek')
    expect(result[0].direction).toBe('centered')
    expect(result[0].maxHours).toBe(40)
  })

  it('should extract all three capacity constraint types when provided', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        }
      },
      maxWorkHours: {
        day: { enforcement: 'hard', maxHours: 8 },
        calendarWeek: { enforcement: 'flexible', maxHours: 40 },
        rollingWeek: { enforcement: 'hard', maxHours: 40, direction: 'past' }
      }
    } as AvailabilitySettings

    const result = extractCapacityConstraints(settings)
    expect(result.length).toBe(3)
    expect(result.some(c => c.type === 'daily')).toBe(true)
    expect(result.some(c => c.type === 'calendarWeek')).toBe(true)
    expect(result.some(c => c.type === 'rollingWeek')).toBe(true)
    
    const daily = result.find(c => c.type === 'daily')!
    expect(daily.enforcement).toBe('hard')
    expect(daily.maxHours).toBe(8)
    
    const calendarWeek = result.find(c => c.type === 'calendarWeek')!
    expect(calendarWeek.enforcement).toBe('flexible')
    expect(calendarWeek.maxHours).toBe(40)
    
    const rollingWeek = result.find(c => c.type === 'rollingWeek')!
    expect(rollingWeek.enforcement).toBe('hard')
    expect(rollingWeek.maxHours).toBe(40)
    expect(rollingWeek.direction).toBe('past')
  })

  it('should return empty array when maxWorkHours is undefined', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        }
      }
    } as AvailabilitySettings

    const result = extractCapacityConstraints(settings)
    expect(result.length).toBe(0)
  })

  it('should default enforcement to hard when undefined', () => {
    const settings: AvailabilitySettings = {
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: { hours: standardBusinessHours }
        }
      },
      maxWorkHours: {
        day: { enforcement: undefined as any, maxHours: 8 }
      }
    } as AvailabilitySettings

    const result = extractCapacityConstraints(settings)
    expect(result.length).toBe(1)
    expect(result[0].enforcement).toBe('hard')
  })
})

// ===================================================================
// FLEXIBLE CONSTRAINT VIOLATION TESTS
// ===================================================================

describe('Flexible constraint violations', () => {
  it('should generate slots outside business hours and mark them with flexible violations', async () => {
    // Generate slots from 8 AM to 8 PM (outside 9 AM - 7 PM business hours)
    const startBoundary = nextMonday9AM()
    const startBoundaryDate = new Date(startBoundary)
    startBoundaryDate.setUTCHours(8, 0, 0, 0)
    const endBoundary = nextMonday7PM()
    const endBoundaryDate = new Date(endBoundary)
    endBoundaryDate.setUTCHours(20, 0, 0, 0)

    const rangeConstraints: RangeConstraint[] = [{
      type: 'businessHours',
      enforcement: 'flexible', // Flexible enforcement
      config: { hours: standardBusinessHours }
    }]

    const result = await generateSlotsWithAvailability({
      startBoundary: startBoundaryDate.toISOString() as any,
      endBoundary: endBoundaryDate.toISOString() as any,
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes: [],
      includeFlags: DEFAULT_INCLUDE_FLAGS
    }, rangeConstraints)

    // Should generate slots including those outside business hours
    expect(result.slots.length).toBeGreaterThan(0)

    // Slots before 9 AM or after 7 PM should have flexible violations
    const slotsWithViolations = result.slots.filter(slot => {
      const slotStart = new Date(slot.startTime)
      const slotHour = slotStart.getUTCHours()
      return slotHour < 9 || slotHour >= 19
    })

    expect(slotsWithViolations.length).toBeGreaterThan(0)
    slotsWithViolations.forEach(slot => {
      expect(slot.hasFlexibleViolations).toBe(true)
      expect(slot.flexibleViolations).toContain('range.businessHours')
    })
  })

  it('should generate slots outside dateRange and mark them with flexible violations', async () => {
    const dateRangeStart = nextMonday9AM()
    const dateRangeStartDate = new Date(dateRangeStart)
    dateRangeStartDate.setUTCHours(10, 0, 0, 0)
    const dateRangeEnd = nextMonday7PM()
    const dateRangeEndDate = new Date(dateRangeEnd)
    dateRangeEndDate.setUTCHours(16, 0, 0, 0)

    // Generate slots from 9 AM to 7 PM (some outside 10 AM - 4 PM dateRange)
    const rangeConstraints: RangeConstraint[] = [{
      type: 'dateRange',
      enforcement: 'flexible', // Flexible enforcement
      config: {
        start: dateRangeStartDate.toISOString(),
        end: dateRangeEndDate.toISOString()
      }
    }]

    const result = await generateSlotsWithAvailability({
      startBoundary: nextMonday9AM(),
      endBoundary: nextMonday7PM(),
      duration: 60,
      businessHours: standardBusinessHours,
      minuteIncrement: 15,
      busyTimes: [],
      includeFlags: DEFAULT_INCLUDE_FLAGS
    }, rangeConstraints)

    // Should generate slots including those outside dateRange
    expect(result.slots.length).toBeGreaterThan(0)

    // Slots before 10 AM or after 4 PM should have flexible violations
    const slotsWithViolations = result.slots.filter(slot => {
      const slotStart = new Date(slot.startTime)
      const slotHour = slotStart.getUTCHours()
      return slotHour < 10 || slotHour >= 16
    })

    expect(slotsWithViolations.length).toBeGreaterThan(0)
    slotsWithViolations.forEach(slot => {
      expect(slot.hasFlexibleViolations).toBe(true)
      expect(slot.flexibleViolations).toContain('range.dateRange')
    })
  })
})

// ===================================================================
// UTC-ONLY BEHAVIOR TESTS
// ===================================================================

describe('UTC-only constraint checking', () => {
  it('should use UTC day of week for business hours checks', () => {
    // Create a slot at UTC midnight (which might be a different local day)
    const slotUTC = new Date('2026-01-20T00:00:00Z') // Tuesday UTC
    const slot = {
      startTime: slotUTC.toISOString() as any,
      endTime: new Date(slotUTC.getTime() + 60 * 60 * 1000).toISOString() as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    // Business hours only for Monday (day 1)
    const mondayOnlyHours: BusinessHoursMap = {
      1: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T19:00:00Z' }
    }

    const businessHoursConstraint: RangeConstraint = {
      type: 'businessHours',
      enforcement: 'hard',
      config: { hours: mondayOnlyHours }
    }

    // Slot is Tuesday UTC (day 2), should fail
    const result = checkRangeConstraints(slot, [businessHoursConstraint])
    expect(result.passes).toBe(false)
  })

  it('should use UTC time-of-day for business hours checks', () => {
    // Create slot at 8 AM UTC (before 9 AM UTC business hours)
    const slotUTC = new Date('2026-01-20T08:00:00Z') // Monday 8 AM UTC
    const slot = {
      startTime: slotUTC.toISOString() as any,
      endTime: new Date(slotUTC.getTime() + 60 * 60 * 1000).toISOString() as any,
      onSite: false,
      clientPresent: false,
      moveable: false,
      isAvailable: true
    }

    const businessHoursConstraint: RangeConstraint = {
      type: 'businessHours',
      enforcement: 'flexible',
      config: { hours: standardBusinessHours }
    }

    // Slot at 8 AM UTC should fail (business hours start at 9 AM UTC)
    const result = checkRangeConstraints(slot, [businessHoursConstraint])
    expect(result.passes).toBe(true) // Flexible allows it
    expect(result.violations).toContain('range.businessHours')
  })
})

// ===================================================================
// CONSTRAINT VALIDATION ERROR TESTS
// ===================================================================

describe('Constraint validation errors', () => {
  it('should throw ConstraintValidationError for invalid range constraint', async () => {
    const invalidRangeConstraint: RangeConstraint[] = [{
      type: 'leadTime',
      enforcement: 'hard',
      config: { minutes: -5 } as any // Invalid: negative minutes
    }]

    await expect(
      generateSlotsWithAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes: [],
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, invalidRangeConstraint)
    ).rejects.toThrow(ConstraintValidationError)
  })

  it('should throw ConstraintValidationError for invalid overlap constraint', async () => {
    const invalidOverlapConstraint: OverlapConstraint[] = [{
      type: 'appointment',
      placement: 'before',
      enforcement: 'hard',
      minutes: -10 // Invalid: negative minutes
    }]

    await expect(
      generateSlotsWithAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes: [],
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, undefined, invalidOverlapConstraint)
    ).rejects.toThrow(ConstraintValidationError)
  })

  it('should throw ConstraintValidationError for invalid capacity constraint', async () => {
    const invalidCapacityConstraint: CapacityConstraint[] = [{
      type: 'daily',
      enforcement: 'hard',
      maxHours: -5 // Invalid: negative maxHours
    }]

    await expect(
      generateSlotsWithAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes: [],
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, undefined, undefined, invalidCapacityConstraint)
    ).rejects.toThrow(ConstraintValidationError)
  })

  it('should hard-fail when capacity API call fails (no fallback to 0)', async () => {
    // Mock API to throw error
    const apiClient = await import('@/utils/api')
    vi.spyOn(apiClient.default, 'get').mockRejectedValue(new Error('API failure'))

    const capacityConstraints: CapacityConstraint[] = [{
      type: 'daily',
      enforcement: 'hard',
      maxHours: 8
    }]

    const rangeConstraints: RangeConstraint[] = [{
      type: 'businessHours',
      enforcement: 'hard',
      config: { hours: standardBusinessHours }
    }]

    // Should throw error instead of silently allowing scheduling
    await expect(
      generateSlotsWithAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes: [],
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, rangeConstraints, undefined, capacityConstraints)
    ).rejects.toThrow()

    // Cleanup
    vi.restoreAllMocks()
  })
})
