/**
 * TIME SLOT FITTER TESTS
 * 
 * Unit tests for fitTimeSlots() core utility.
 * Tests boundaries, business hours, busy times, and edge cases.
 * Session 1.4.14: Core Time Slot Fitter Utility
 */

import { describe, it, expect } from 'vitest'
import { fitTimeSlots, fitTimeSlotsWithAvailability, timeRangesOverlap, parseLocalDate, parseTimeToMinutes, type BusinessHoursMap } from '../timeSlotFitter'
import { generateMockFreeBusyResponse, extractBusyTimesFromFreeBusyResponse } from '../mockGoogleCalendar'

// ===================================================================
// TEST DATA SETUP
// ===================================================================

/**
 * Standard business hours (9 AM - 7 PM, Monday-Friday)
 */
const standardBusinessHours: BusinessHoursMap = {
  0: { start: '09:00', end: '17:00' }, // Sunday - shorter hours
  1: { start: '09:00', end: '19:00' }, // Monday
  2: { start: '09:00', end: '19:00' }, // Tuesday
  3: { start: '09:00', end: '19:00' }, // Wednesday
  4: { start: '09:00', end: '19:00' }, // Thursday
  5: { start: '09:00', end: '19:00' }, // Friday
  6: { start: '09:00', end: '17:00' }  // Saturday - shorter hours
}

// ===================================================================
// HELPER FUNCTION TESTS
// ===================================================================

describe('timeSlotFitter helpers', () => {
  describe('parseLocalDate', () => {
    it('should parse YYYY-MM-DD format', () => {
      const date = parseLocalDate('2026-01-15')
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(0) // January is 0-indexed
      expect(date.getDate()).toBe(15)
    })

    it('should parse ISO timestamp format', () => {
      const date = parseLocalDate('2026-01-15T14:30:00Z')
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(15)
    })
  })

  describe('parseTimeToMinutes', () => {
    it('should parse HH:mm format correctly', () => {
      expect(parseTimeToMinutes('09:00')).toBe(540) // 9 * 60
      expect(parseTimeToMinutes('14:30')).toBe(870) // 14 * 60 + 30
      expect(parseTimeToMinutes('23:59')).toBe(1439) // 23 * 60 + 59
    })
  })

  describe('timeRangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      const range1 = {
        start: new Date('2026-01-15T10:00:00Z'),
        end: new Date('2026-01-15T12:00:00Z')
      }
      const range2 = {
        start: new Date('2026-01-15T11:00:00Z'),
        end: new Date('2026-01-15T13:00:00Z')
      }
      expect(timeRangesOverlap(range1, range2)).toBe(true)
    })

    it('should detect non-overlapping ranges', () => {
      const range1 = {
        start: new Date('2026-01-15T10:00:00Z'),
        end: new Date('2026-01-15T12:00:00Z')
      }
      const range2 = {
        start: new Date('2026-01-15T13:00:00Z'),
        end: new Date('2026-01-15T15:00:00Z')
      }
      expect(timeRangesOverlap(range1, range2)).toBe(false)
    })

    it('should detect adjacent ranges as non-overlapping', () => {
      const range1 = {
        start: new Date('2026-01-15T10:00:00Z'),
        end: new Date('2026-01-15T12:00:00Z')
      }
      const range2 = {
        start: new Date('2026-01-15T12:00:00Z'),
        end: new Date('2026-01-15T14:00:00Z')
      }
      expect(timeRangesOverlap(range1, range2)).toBe(false)
    })

    it('should detect contained ranges as overlapping', () => {
      const range1 = {
        start: new Date('2026-01-15T10:00:00Z'),
        end: new Date('2026-01-15T14:00:00Z')
      }
      const range2 = {
        start: new Date('2026-01-15T11:00:00Z'),
        end: new Date('2026-01-15T13:00:00Z')
      }
      expect(timeRangesOverlap(range1, range2)).toBe(true)
    })
  })
})

// ===================================================================
// FIT TIME SLOTS TESTS
// ===================================================================

describe('fitTimeSlots', () => {
  describe('basic functionality', () => {
    it('should generate slots for single day within boundaries', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z', // Monday 9 AM
        endBoundary: '2026-01-15T19:00:00Z',   // Monday 7 PM
        duration: 60, // 1 hour
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      expect(result.slots.length).toBeGreaterThan(0)
      expect(result.earliestCompletion).toBeTruthy()

      // First slot should start at or after startBoundary
      const firstSlot = result.slots[0]
      expect(new Date(firstSlot.startTime).getTime()).toBeGreaterThanOrEqual(
        new Date('2026-01-15T09:00:00Z').getTime()
      )

      // Last slot should end at or before endBoundary
      const lastSlot = result.slots[result.slots.length - 1]
      expect(new Date(lastSlot.endTime).getTime()).toBeLessThanOrEqual(
        new Date('2026-01-15T19:00:00Z').getTime()
      )
    })

    it('should respect duration in slots', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 90, // 1.5 hours
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      result.slots.forEach(slot => {
        expect(slot.duration).toBe(90)
        const start = new Date(slot.startTime)
        const end = new Date(slot.endTime)
        const actualDuration = (end.getTime() - start.getTime()) / (1000 * 60)
        expect(actualDuration).toBe(90)
      })
    })

    it('should respect minuteIncrement', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 30 // 30-minute intervals
      })

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        const minutes = start.getMinutes()
        expect([0, 30]).toContain(minutes)
      })
    })
  })

  describe('boundary handling', () => {
    it('should return empty slots if startBoundary >= endBoundary', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T19:00:00Z',
        endBoundary: '2026-01-15T09:00:00Z', // Before start
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      expect(result.slots).toEqual([])
      expect(result.earliestCompletion).toBeNull()
    })

    it('should filter slots that start before startBoundary', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T12:00:00Z', // Start at noon
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        expect(start.getTime()).toBeGreaterThanOrEqual(
          new Date('2026-01-15T12:00:00Z').getTime()
        )
      })
    })

    it('should filter slots that end after endBoundary', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T15:00:00Z', // End at 3 PM
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      result.slots.forEach(slot => {
        const end = new Date(slot.endTime)
        expect(end.getTime()).toBeLessThanOrEqual(
          new Date('2026-01-15T15:00:00Z').getTime()
        )
      })
    })

    it('should handle multi-day boundaries', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T14:00:00Z', // Monday 2 PM UTC
        endBoundary: '2026-01-16T12:00:00Z',   // Tuesday noon UTC
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      expect(result.slots.length).toBeGreaterThan(0)

      // Should have slots on both days
      // LEARNING: Check dates in local timezone since slots are generated in local time
      // WHY: fitTimeSlots generates slots in local time, so we should check local dates
      // PATTERN: Use getDate() and getMonth() for local date checking
      const mondaySlots = result.slots.filter(slot => {
        const date = new Date(slot.startTime)
        // Check if slot is on Monday (January 15, 2026)
        // Note: getDate() returns local date, which may differ from UTC date due to timezone
        return date.getFullYear() === 2026 && date.getMonth() === 0 && date.getDate() === 15
      })
      const tuesdaySlots = result.slots.filter(slot => {
        const date = new Date(slot.startTime)
        // Check if slot is on Tuesday (January 16, 2026) in local time
        // Note: Due to timezone conversion, Tuesday slots might appear as Monday in UTC
        // but we check local date since that's how slots are generated
        return date.getFullYear() === 2026 && date.getMonth() === 0 && date.getDate() === 16
      })
      
      // LEARNING: If no Tuesday slots found, check if endBoundary conversion prevents them
      // WHY: In timezones behind UTC, Tuesday noon UTC might be early Tuesday local time
      // PATTERN: Accept slots on either Monday or Tuesday if endBoundary is early Tuesday
      if (tuesdaySlots.length === 0 && mondaySlots.length > 0) {
        // Check if endBoundary in local time is early Tuesday (before business hours)
        const endBoundaryLocal = new Date('2026-01-16T12:00:00Z')
        const tuesdayBusinessStart = new Date(2026, 0, 16, 9, 0, 0) // Tuesday 9 AM local
        // If endBoundary is before business hours start, no Tuesday slots expected
        if (endBoundaryLocal < tuesdayBusinessStart) {
          // This is expected - endBoundary is too early for Tuesday slots
          expect(mondaySlots.length).toBeGreaterThan(0)
          return
        }
      }

      expect(mondaySlots.length).toBeGreaterThan(0)
      expect(tuesdaySlots.length).toBeGreaterThan(0)
    })
  })

  describe('business hours handling', () => {
    it('should respect business hours for each day', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-12T00:00:00Z', // Sunday
        endBoundary: '2026-01-13T23:59:59Z',   // Monday
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        const dayOfWeek = start.getDay()
        const dayHours = standardBusinessHours[dayOfWeek as keyof BusinessHoursMap]

        // Slot should start within business hours
        const startMinutes = start.getHours() * 60 + start.getMinutes()
        const businessStartMinutes = parseTimeToMinutes(dayHours.start)
        const businessEndMinutes = parseTimeToMinutes(dayHours.end)

        expect(startMinutes).toBeGreaterThanOrEqual(businessStartMinutes)
        expect(startMinutes).toBeLessThan(businessEndMinutes)
      })
    })

    it('should not generate slots outside business hours', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T08:00:00Z', // Before business hours
        endBoundary: '2026-01-15T20:00:00Z',  // After business hours
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        const end = new Date(slot.endTime)

        // Start should be at or after 9 AM
        expect(start.getHours()).toBeGreaterThanOrEqual(9)
        // End should be at or before 7 PM
        expect(end.getHours()).toBeLessThanOrEqual(19)
      })
    })

    it('should handle different business hours per day', () => {
      const customBusinessHours: BusinessHoursMap = {
        ...standardBusinessHours,
        0: { start: '10:00', end: '16:00' } // Sunday shorter hours
      }

      const result = fitTimeSlots({
        startBoundary: '2026-01-12T00:00:00Z', // Sunday
        endBoundary: '2026-01-12T23:59:59Z',
        duration: 60,
        businessHours: customBusinessHours,
        minuteIncrement: 15
      })

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        if (start.getDay() === 0) {
          // Sunday slots should be within 10 AM - 4 PM
          expect(start.getHours()).toBeGreaterThanOrEqual(10)
          expect(start.getHours()).toBeLessThan(16)
        }
      })
    })
  })

  describe('busy times handling', () => {
    it('should filter out slots that overlap busy times', () => {
      const busyTimes = [
        {
          start: '2026-01-15T10:00:00Z',
          end: '2026-01-15T11:00:00Z'
        },
        {
          start: '2026-01-15T14:00:00Z',
          end: '2026-01-15T15:00:00Z'
        }
      ]

      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes
      })

      result.slots.forEach(slot => {
        const slotStart = new Date(slot.startTime)
        const slotEnd = new Date(slot.endTime)

        busyTimes.forEach(busy => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)

          // Slot should not overlap busy time
          const overlaps = timeRangesOverlap(
            { start: slotStart, end: slotEnd },
            { start: busyStart, end: busyEnd }
          )
          expect(overlaps).toBe(false)
        })
      })
    })

    it('should handle empty busy times array', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes: []
      })

      expect(result.slots.length).toBeGreaterThan(0)
    })

    it('should handle busy times spanning multiple days', () => {
      const busyTimes = [
        {
          start: '2026-01-15T16:00:00Z', // Monday 4 PM
          end: '2026-01-16T10:00:00Z'    // Tuesday 10 AM
        }
      ]

      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-16T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes
      })

      result.slots.forEach(slot => {
        const slotStart = new Date(slot.startTime)
        const slotEnd = new Date(slot.endTime)
        const busyStart = new Date(busyTimes[0].start)
        const busyEnd = new Date(busyTimes[0].end)

        const overlaps = timeRangesOverlap(
          { start: slotStart, end: slotEnd },
          { start: busyStart, end: busyEnd }
        )
        expect(overlaps).toBe(false)
      })
    })

    it('should filter out slots using mock Google Calendar busy times', () => {
      // LEARNING: Test integration with mock Google Calendar free/busy data
      // WHY: Verifies that mock calendar data works correctly with fitTimeSlots()
      // PATTERN: Generate mock response, extract busy times, verify filtering
      
      const dateRange = {
        start: '2026-01-15T09:00:00Z',
        end: '2026-01-15T19:00:00Z'
      }

      // Generate mock Google Calendar free/busy response
      const mockResponse = generateMockFreeBusyResponse(dateRange, {
        periodsPerCalendar: 2,
        minDurationMinutes: 30,
        maxDurationMinutes: 90,
        calendarIds: ['primary', 'work']
      })

      // Extract busy times from mock response
      const busyTimes = extractBusyTimesFromFreeBusyResponse(mockResponse, true)

      // Verify busy times were generated
      expect(busyTimes.length).toBeGreaterThan(0)

      // Generate slots with busy times
      const result = fitTimeSlots({
        startBoundary: dateRange.start,
        endBoundary: dateRange.end,
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes
      })

      // LEARNING: Verify that no slots overlap with busy times
      // WHY: Mock calendar data should correctly filter out unavailable slots
      // PATTERN: Check each slot against all busy periods
      result.slots.forEach(slot => {
        const slotStart = new Date(slot.startTime)
        const slotEnd = new Date(slot.endTime)

        busyTimes.forEach(busy => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)

          const overlaps = timeRangesOverlap(
            { start: slotStart, end: slotEnd },
            { start: busyStart, end: busyEnd }
          )
          expect(overlaps).toBe(false)
        })
      })

      // LEARNING: Should have fewer slots than without busy times
      // WHY: Busy periods should reduce available slots
      // PATTERN: Compare with result without busy times
      const resultWithoutBusy = fitTimeSlots({
        startBoundary: dateRange.start,
        endBoundary: dateRange.end,
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes: []
      })

      expect(result.slots.length).toBeLessThanOrEqual(resultWithoutBusy.slots.length)
    })
  })

  describe('fitTimeSlotsWithAvailability', () => {
    describe('basic functionality', () => {
      it('should generate all slots with availability flags', () => {
        const busyTimes = [
          {
            start: '2026-01-15T10:00:00Z',
            end: '2026-01-15T11:00:00Z'
          }
        ]

        const result = fitTimeSlotsWithAvailability({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-15T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes
        })

        // LEARNING: Should generate slots (not filter them out)
        // WHY: New approach generates all slots and marks availability
        // PATTERN: Check that slots array has items
        expect(result.slots.length).toBeGreaterThan(0)

        // LEARNING: All slots should have isAvailable flag
        // WHY: Availability status is marked on each slot
        // PATTERN: Check that every slot has isAvailable property
        result.slots.forEach(slot => {
          expect(slot).toHaveProperty('isAvailable')
          expect(typeof slot.isAvailable).toBe('boolean')
        })
      })

      it('should mark busy slots as unavailable', () => {
        const busyTimes = [
          {
            start: '2026-01-15T10:00:00Z',
            end: '2026-01-15T11:00:00Z'
          }
        ]

        const result = fitTimeSlotsWithAvailability({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-15T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes
        })

        // LEARNING: Find slots that overlap busy period
        // WHY: Verify they are marked as unavailable
        // PATTERN: Check slots that should overlap busy time
        const busyStart = new Date(busyTimes[0].start)
        const busyEnd = new Date(busyTimes[0].end)

        result.slots.forEach(slot => {
          const slotStart = new Date(slot.startTime)
          const slotEnd = new Date(slot.endTime)
          const overlaps = timeRangesOverlap(
            { start: slotStart, end: slotEnd },
            { start: busyStart, end: busyEnd }
          )

          if (overlaps) {
            expect(slot.isAvailable).toBe(false)
          }
        })
      })

      it('should mark available slots as available', () => {
        const busyTimes = [
          {
            start: '2026-01-15T10:00:00Z',
            end: '2026-01-15T11:00:00Z'
          }
        ]

        const result = fitTimeSlotsWithAvailability({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-15T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes
        })

        // LEARNING: Find slots that don't overlap busy period
        // WHY: Verify they are marked as available
        // PATTERN: Check slots that shouldn't overlap busy time
        const busyStart = new Date(busyTimes[0].start)
        const busyEnd = new Date(busyTimes[0].end)

        result.slots.forEach(slot => {
          const slotStart = new Date(slot.startTime)
          const slotEnd = new Date(slot.endTime)
          const overlaps = timeRangesOverlap(
            { start: slotStart, end: slotEnd },
            { start: busyStart, end: busyEnd }
          )

          if (!overlaps) {
            expect(slot.isAvailable).toBe(true)
          }
        })
      })

      it('should generate more slots than fitTimeSlots when busy periods exist', () => {
        const busyTimes = [
          {
            start: '2026-01-15T10:00:00Z',
            end: '2026-01-15T11:00:00Z'
          },
          {
            start: '2026-01-15T14:00:00Z',
            end: '2026-01-15T15:00:00Z'
          }
        ]

        // Old approach (filters out busy slots)
        const oldResult = fitTimeSlots({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-15T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes
        })

        // New approach (generates all slots, marks availability)
        const newResult = fitTimeSlotsWithAvailability({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-15T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes
        })

        // LEARNING: New approach should generate more slots
        // WHY: It includes busy slots (marked as unavailable) instead of filtering them
        // PATTERN: Compare slot counts
        expect(newResult.slots.length).toBeGreaterThanOrEqual(oldResult.slots.length)

        // LEARNING: Count of available slots should match old approach
        // WHY: Available slots should be the same, just with additional busy slots
        // PATTERN: Count available slots in new result
        const availableCount = newResult.slots.filter(slot => slot.isAvailable).length
        expect(availableCount).toBe(oldResult.slots.length)
      })

      it('should return earliest completion from available slots only', () => {
        const busyTimes = [
          {
            start: '2026-01-15T09:00:00Z',
            end: '2026-01-15T10:00:00Z'
          }
        ]

        const result = fitTimeSlotsWithAvailability({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-15T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes
        })

        // LEARNING: Earliest completion should be from an available slot
        // WHY: Only available slots count for earliest completion
        // PATTERN: Find earliest available slot and compare
        if (result.earliestCompletion) {
          const earliestAvailableSlot = result.slots
            .filter(slot => slot.isAvailable)
            .reduce((earliest, slot) => {
              const slotEnd = new Date(slot.endTime)
              const earliestEnd = new Date(earliest.endTime)
              return slotEnd < earliestEnd ? slot : earliest
            })

          expect(result.earliestCompletion).toBe(earliestAvailableSlot.endTime)
        }
      })
    })

    describe('edge cases', () => {
      it('should mark all slots as available when no busy times', () => {
        const result = fitTimeSlotsWithAvailability({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-15T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes: []
        })

        // LEARNING: All slots should be available when no busy times
        // WHY: No conflicts means all slots are available
        // PATTERN: Check that all slots have isAvailable: true
        result.slots.forEach(slot => {
          expect(slot.isAvailable).toBe(true)
        })
      })

      it('should handle busy times spanning multiple days', () => {
        const busyTimes = [
          {
            start: '2026-01-15T16:00:00Z',
            end: '2026-01-16T10:00:00Z'
          }
        ]

        const result = fitTimeSlotsWithAvailability({
          startBoundary: '2026-01-15T09:00:00Z',
          endBoundary: '2026-01-16T19:00:00Z',
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes
        })

        // LEARNING: Should generate slots on both days
        // WHY: Generates all slots regardless of busy periods
        // PATTERN: Check that slots span multiple days
        const mondaySlots = result.slots.filter(slot => {
          const date = new Date(slot.startTime)
          return date.getFullYear() === 2026 && date.getMonth() === 0 && date.getDate() === 15
        })
        const tuesdaySlots = result.slots.filter(slot => {
          const date = new Date(slot.startTime)
          return date.getFullYear() === 2026 && date.getMonth() === 0 && date.getDate() === 16
        })

        expect(mondaySlots.length).toBeGreaterThan(0)
        expect(tuesdaySlots.length).toBeGreaterThan(0)

        // LEARNING: Slots overlapping busy period should be marked unavailable
        // WHY: Multi-day busy periods should mark overlapping slots correctly
        // PATTERN: Check slots that overlap busy period
        const busyStart = new Date(busyTimes[0].start)
        const busyEnd = new Date(busyTimes[0].end)

        result.slots.forEach(slot => {
          const slotStart = new Date(slot.startTime)
          const slotEnd = new Date(slot.endTime)
          const overlaps = timeRangesOverlap(
            { start: slotStart, end: slotEnd },
            { start: busyStart, end: busyEnd }
          )

          if (overlaps) {
            expect(slot.isAvailable).toBe(false)
          }
        })
      })
    })
  })

  describe('includeFlags handling', () => {
    it('should set TimeSlot flags correctly', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: {
          onSite: true,
          clientPresent: true,
          moveable: false
        }
      })

      result.slots.forEach(slot => {
        expect(slot.onSite).toBe(true)
        expect(slot.clientPresent).toBe(true)
        expect(slot.moveable).toBe(false)
      })
    })

    it('should default flags to false if not provided', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      result.slots.forEach(slot => {
        expect(slot.onSite).toBe(false)
        expect(slot.clientPresent).toBe(false)
        expect(slot.moveable).toBe(false)
      })
    })
  })

  describe('earliestCompletion calculation', () => {
    it('should return earliest completion time', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      expect(result.earliestCompletion).toBeTruthy()

      // Earliest completion should be the end time of the first slot
      const firstSlotEnd = new Date(result.slots[0].endTime)
      const earliestCompletionDate = new Date(result.earliestCompletion!)
      expect(earliestCompletionDate.getTime()).toBe(firstSlotEnd.getTime())
    })

    it('should return null if no slots generated', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T19:00:00Z',
        endBoundary: '2026-01-15T09:00:00Z', // Invalid boundaries
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      expect(result.earliestCompletion).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle very short duration', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 5, // 5 minutes
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      expect(result.slots.length).toBeGreaterThan(0)
      result.slots.forEach(slot => {
        expect(slot.duration).toBe(5)
      })
    })

    it('should handle very long duration', () => {
      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 600, // 10 hours
        businessHours: standardBusinessHours,
        minuteIncrement: 15
      })

      // Should only have slots that fit within business hours (10 hours)
      // 9 AM - 7 PM = 10 hours, so should have very few slots
      result.slots.forEach(slot => {
        const end = new Date(slot.endTime)
        expect(end.getHours()).toBeLessThanOrEqual(19)
      })
    })

    it('should handle invalid business hours gracefully', () => {
      const invalidBusinessHours: BusinessHoursMap = {
        ...standardBusinessHours,
        1: { start: 'invalid', end: '19:00' } // Invalid start time
      }

      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z',
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: invalidBusinessHours,
        minuteIncrement: 15
      })

      // Should skip invalid day and continue with other days
      expect(Array.isArray(result.slots)).toBe(true)
    })

    it('should handle missing business hours for a day', () => {
      const incompleteBusinessHours = {
        ...standardBusinessHours
      }
      delete incompleteBusinessHours[1] // Remove Monday

      const result = fitTimeSlots({
        startBoundary: '2026-01-15T09:00:00Z', // Monday
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: incompleteBusinessHours as BusinessHoursMap,
        minuteIncrement: 15
      })

      // Should handle gracefully (may return empty or skip that day)
      expect(Array.isArray(result.slots)).toBe(true)
    })
  })
})
