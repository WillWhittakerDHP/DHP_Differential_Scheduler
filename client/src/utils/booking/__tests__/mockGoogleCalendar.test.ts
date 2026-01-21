/**
 * MOCK GOOGLE CALENDAR TESTS
 * 
 * Unit tests for mock Google Calendar free/busy data generator.
 * Tests mock response generation, busy period extraction, and format compliance.
 * Session 1.4.15: Google Calendar Free/Busy Mock Setup
 */

import { describe, it, expect } from 'vitest'
import {
  generateMockFreeBusyResponse,
  extractBusyTimesFromFreeBusyResponse,
  type MockBusyPeriodConfig
} from '../mockGoogleCalendar'

// ===================================================================
// TEST DATA SETUP
// ===================================================================

/**
 * Standard date range for testing (single day)
 */
const standardDateRange = {
  start: '2026-01-15T00:00:00Z',
  end: '2026-01-16T00:00:00Z'
}

/**
 * Multi-day date range for testing
 */
const multiDayDateRange = {
  start: '2026-01-15T00:00:00Z',
  end: '2026-01-17T00:00:00Z'
}

// ===================================================================
// GENERATE MOCK FREE/BUSY RESPONSE TESTS
// ===================================================================

describe('generateMockFreeBusyResponse', () => {
  describe('basic functionality', () => {
    it('should generate a valid Google Calendar free/busy response', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)

      expect(response).toHaveProperty('kind', 'calendar#freeBusy')
      expect(response).toHaveProperty('timeMin', standardDateRange.start)
      expect(response).toHaveProperty('timeMax', standardDateRange.end)
      expect(response).toHaveProperty('calendars')
      expect(typeof response.calendars).toBe('object')
    })

    it('should include multiple calendars by default', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)

      expect(response.calendars).toBeDefined()
      const calendarIds = Object.keys(response.calendars || {})
      expect(calendarIds.length).toBeGreaterThan(0)
      expect(calendarIds).toContain('primary')
    })

    it('should generate busy periods for each calendar', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)

      if (!response.calendars) {
        throw new Error('calendars should be defined')
      }

      for (const calendar of Object.values(response.calendars)) {
        expect(calendar).toHaveProperty('busy')
        expect(Array.isArray(calendar.busy)).toBe(true)
        expect(calendar.busy.length).toBeGreaterThan(0)
      }
    })

    it('should generate busy periods with valid RFC3339 timestamps', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)

      if (!response.calendars) {
        throw new Error('calendars should be defined')
      }

      for (const calendar of Object.values(response.calendars)) {
        for (const period of calendar.busy) {
          // LEARNING: RFC3339 format should be parseable by Date constructor
          // WHY: Google Calendar API returns RFC3339 format timestamps
          // PATTERN: Validate format by parsing and checking it's valid
          expect(() => new Date(period.start)).not.toThrow()
          expect(() => new Date(period.end)).not.toThrow()
          
          const startDate = new Date(period.start)
          const endDate = new Date(period.end)
          
          expect(isNaN(startDate.getTime())).toBe(false)
          expect(isNaN(endDate.getTime())).toBe(false)
          
          // LEARNING: End should be after start
          // WHY: Busy periods must have valid time ranges
          expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
        }
      }
    })

    it('should generate busy periods within the date range', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)

      const rangeStart = new Date(standardDateRange.start)
      const rangeEnd = new Date(standardDateRange.end)

      if (!response.calendars) {
        throw new Error('calendars should be defined')
      }

      for (const calendar of Object.values(response.calendars)) {
        for (const period of calendar.busy) {
          const periodStart = new Date(period.start)
          const periodEnd = new Date(period.end)

          // LEARNING: Busy periods should be within the queried date range
          // WHY: Google Calendar API only returns busy periods within timeMin/timeMax
          // PATTERN: Validate that periods don't extend outside the range
          expect(periodStart.getTime()).toBeGreaterThanOrEqual(rangeStart.getTime())
          expect(periodEnd.getTime()).toBeLessThanOrEqual(rangeEnd.getTime())
        }
      }
    })
  })

  describe('configuration options', () => {
    it('should respect custom calendar IDs', () => {
      const customConfig: MockBusyPeriodConfig = {
        calendarIds: ['custom-calendar-1', 'custom-calendar-2']
      }

      const response = generateMockFreeBusyResponse(standardDateRange, customConfig)

      expect(response.calendars).toBeDefined()
      const calendarIds = Object.keys(response.calendars || {})
      expect(calendarIds).toEqual(['custom-calendar-1', 'custom-calendar-2'])
    })

    it('should respect custom periods per calendar', () => {
      const customConfig: MockBusyPeriodConfig = {
        periodsPerCalendar: 5
      }

      const response = generateMockFreeBusyResponse(standardDateRange, customConfig)

      if (!response.calendars) {
        throw new Error('calendars should be defined')
      }

      for (const calendar of Object.values(response.calendars)) {
        // LEARNING: Should generate approximately the requested number of periods
        // WHY: Config allows customization for different test scenarios
        // PATTERN: Check that periods are generated (may be fewer if range is too small)
        expect(calendar.busy.length).toBeGreaterThan(0)
        expect(calendar.busy.length).toBeLessThanOrEqual(5)
      }
    })

    it('should respect custom duration ranges', () => {
      const customConfig: MockBusyPeriodConfig = {
        minDurationMinutes: 60,
        maxDurationMinutes: 90
      }

      const response = generateMockFreeBusyResponse(standardDateRange, customConfig)

      if (!response.calendars) {
        throw new Error('calendars should be defined')
      }

      for (const calendar of Object.values(response.calendars)) {
        for (const period of calendar.busy) {
          const start = new Date(period.start)
          const end = new Date(period.end)
          const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)

          // LEARNING: Duration should be within configured range
          // WHY: Allows testing with specific duration scenarios
          // PATTERN: Validate duration is within min/max bounds
          expect(durationMinutes).toBeGreaterThanOrEqual(60)
          expect(durationMinutes).toBeLessThanOrEqual(90)
        }
      }
    })
  })

  describe('edge cases', () => {
    it('should handle multi-day date ranges', () => {
      const response = generateMockFreeBusyResponse(multiDayDateRange)

      expect(response.timeMin).toBe(multiDayDateRange.start)
      expect(response.timeMax).toBe(multiDayDateRange.end)

      if (!response.calendars) {
        throw new Error('calendars should be defined')
      }

      // Should generate busy periods across multiple days
      const allPeriods: Array<{ start: string; end: string }> = []
      for (const calendar of Object.values(response.calendars)) {
        allPeriods.push(...calendar.busy)
      }

      expect(allPeriods.length).toBeGreaterThan(0)

      // Verify periods span multiple days
      const dates = new Set(
        allPeriods.map(p => new Date(p.start).toISOString().split('T')[0])
      )
      expect(dates.size).toBeGreaterThan(1)
    })

    it('should throw error for invalid date range (start >= end)', () => {
      const invalidRange = {
        start: '2026-01-16T00:00:00Z',
        end: '2026-01-15T00:00:00Z'
      }

      expect(() => generateMockFreeBusyResponse(invalidRange)).toThrow()
    })

    it('should handle very short date ranges', () => {
      const shortRange = {
        start: '2026-01-15T10:00:00Z',
        end: '2026-01-15T11:00:00Z' // 1 hour range
      }

      const response = generateMockFreeBusyResponse(shortRange, {
        periodsPerCalendar: 1,
        minDurationMinutes: 15,
        maxDurationMinutes: 30
      })

      expect(response).toBeDefined()
      expect(response.calendars).toBeDefined()
    })
  })
})

// ===================================================================
// EXTRACT BUSY TIMES TESTS
// ===================================================================

describe('extractBusyTimesFromFreeBusyResponse', () => {
  describe('basic functionality', () => {
    it('should extract busy times from response', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)
      const busyTimes = extractBusyTimesFromFreeBusyResponse(response)

      expect(Array.isArray(busyTimes)).toBe(true)
      expect(busyTimes.length).toBeGreaterThan(0)

      // LEARNING: Each busy time should have start and end properties
      // WHY: fitTimeSlots() expects this format
      // PATTERN: Validate structure matches expected format
      for (const busyTime of busyTimes) {
        expect(busyTime).toHaveProperty('start')
        expect(busyTime).toHaveProperty('end')
        expect(typeof busyTime.start).toBe('string')
        expect(typeof busyTime.end).toBe('string')
      }
    })

    it('should return empty array if no calendars', () => {
      const emptyResponse = {
        kind: 'calendar#freeBusy' as const,
        timeMin: standardDateRange.start,
        timeMax: standardDateRange.end,
        calendars: undefined
      }

      const busyTimes = extractBusyTimesFromFreeBusyResponse(emptyResponse)
      expect(busyTimes).toEqual([])
    })

    it('should return empty array if calendars have no busy periods', () => {
      const emptyBusyResponse = {
        kind: 'calendar#freeBusy' as const,
        timeMin: standardDateRange.start,
        timeMax: standardDateRange.end,
        calendars: {
          'primary': { busy: [] }
        }
      }

      const busyTimes = extractBusyTimesFromFreeBusyResponse(emptyBusyResponse)
      expect(busyTimes).toEqual([])
    })
  })

  describe('merging overlapping periods', () => {
    it('should merge overlapping busy periods when mergeOverlapping is true', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)
      
      // Get busy times without merging
      const withoutMerging = extractBusyTimesFromFreeBusyResponse(response, false)
      
      // Get busy times with merging
      const withMerging = extractBusyTimesFromFreeBusyResponse(response, true)

      // LEARNING: Merged periods should be fewer or equal to unmerged
      // WHY: Overlapping periods from different calendars get combined
      // PATTERN: Merging reduces count when periods overlap
      expect(withMerging.length).toBeLessThanOrEqual(withoutMerging.length)
    })

    it('should merge adjacent busy periods', () => {
      const response = {
        kind: 'calendar#freeBusy' as const,
        timeMin: standardDateRange.start,
        timeMax: standardDateRange.end,
        calendars: {
          'calendar1': {
            busy: [
              { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' }
            ]
          },
          'calendar2': {
            busy: [
              { start: '2026-01-15T11:00:00Z', end: '2026-01-15T12:00:00Z' }
            ]
          }
        }
      }

      const merged = extractBusyTimesFromFreeBusyResponse(response, true)
      
      // LEARNING: Adjacent periods should be merged into one
      // WHY: Prevents gaps in busy time calculation
      // PATTERN: Check that merged result has fewer periods
      expect(merged.length).toBe(1)
      expect(merged[0].start).toBe('2026-01-15T10:00:00Z')
      expect(merged[0].end).toBe('2026-01-15T12:00:00Z')
    })

    it('should merge overlapping busy periods', () => {
      const response = {
        kind: 'calendar#freeBusy' as const,
        timeMin: standardDateRange.start,
        timeMax: standardDateRange.end,
        calendars: {
          'calendar1': {
            busy: [
              { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:30:00Z' }
            ]
          },
          'calendar2': {
            busy: [
              { start: '2026-01-15T11:00:00Z', end: '2026-01-15T12:00:00Z' }
            ]
          }
        }
      }

      const merged = extractBusyTimesFromFreeBusyResponse(response, true)
      
      // LEARNING: Overlapping periods should be merged
      // WHY: Avoids double-counting when calendars have overlapping events
      // PATTERN: Merged period should span from earliest start to latest end
      expect(merged.length).toBe(1)
      expect(merged[0].start).toBe('2026-01-15T10:00:00Z')
      expect(merged[0].end).toBe('2026-01-15T12:00:00Z')
    })

    it('should not merge non-overlapping periods', () => {
      const response = {
        kind: 'calendar#freeBusy' as const,
        timeMin: standardDateRange.start,
        timeMax: standardDateRange.end,
        calendars: {
          'calendar1': {
            busy: [
              { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' }
            ]
          },
          'calendar2': {
            busy: [
              { start: '2026-01-15T13:00:00Z', end: '2026-01-15T14:00:00Z' }
            ]
          }
        }
      }

      const merged = extractBusyTimesFromFreeBusyResponse(response, true)
      
      // LEARNING: Non-overlapping periods should remain separate
      // WHY: Only overlapping/adjacent periods should be merged
      // PATTERN: Check that both periods are present
      expect(merged.length).toBe(2)
    })
  })

  describe('format compatibility', () => {
    it('should return format compatible with fitTimeSlots busyTimes parameter', () => {
      const response = generateMockFreeBusyResponse(standardDateRange)
      const busyTimes = extractBusyTimesFromFreeBusyResponse(response)

      // LEARNING: Format should match what fitTimeSlots() expects
      // WHY: Direct compatibility enables seamless integration
      // PATTERN: Validate structure matches BusyTimeRange interface
      for (const busyTime of busyTimes) {
        expect(busyTime).toHaveProperty('start')
        expect(busyTime).toHaveProperty('end')
        
        // Should be valid ISO strings parseable as Date
        expect(() => new Date(busyTime.start)).not.toThrow()
        expect(() => new Date(busyTime.end)).not.toThrow()
        
        const start = new Date(busyTime.start)
        const end = new Date(busyTime.end)
        expect(end.getTime()).toBeGreaterThan(start.getTime())
      }
    })
  })
})
