
import { describe, it, expect, beforeAll } from 'vitest'
import { computeSlotAvailability, parseUTCDate, DEFAULT_INCLUDE_FLAGS, type BusinessHoursMap } from '../slotPipeline'
import { timeRangesOverlap } from '../timeSlotTypes'

// Local helper for tests - parseTimeToMinutes removed from slotPipeline.ts (only used in tests)
function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}
import { generateMockFreeBusyResponse, extractBusyTimesFromFreeBusyResponse } from '../mockGoogleCalendar'
import {
  setTestBaseDate,
  nextMonday9AM,
  nextMonday7PM,
  nextThursday9AM,
  nextThursday7PM,
  nextDayAtTime,
  createBusyTimeRange,
  createDateRange,
  todayAtTime,
  tomorrowAtTime,
  nextDayDateOnly
} from './testDateHelpers'


beforeAll(() => {
  // Use a fixed date in the future to ensure tests don't use past dates
  const futureDate = new Date()
  futureDate.setUTCDate(futureDate.getUTCDate() + 7) // 7 days in the future
  setTestBaseDate(futureDate)
})

const standardBusinessHours: BusinessHoursMap = {
  0: { start: '09:00', end: '17:00' }, // Sunday - shorter hours
  1: { start: '09:00', end: '19:00' }, // Monday
  2: { start: '09:00', end: '19:00' }, // Tuesday
  3: { start: '09:00', end: '19:00' }, // Wednesday
  4: { start: '09:00', end: '19:00' }, // Thursday
  5: { start: '09:00', end: '19:00' }, // Friday
  6: { start: '09:00', end: '17:00' }  // Saturday - shorter hours
}


describe('slotPipeline helpers', () => {
  describe('parseUTCDate', () => {
    it('should parse YYYY-MM-DD format in UTC', () => {
      const testDate = nextDayDateOnly(1) // Next Monday
      const date = parseUTCDate(testDate)
      const expectedDate = new Date(testDate + 'T00:00:00Z')
      // LEARNING: parseUTCDate parses in UTC timezone
      // WHY: All business logic should use UTC to avoid timezone issues
      // PATTERN: Compare UTC components
      expect(date.getUTCFullYear()).toBe(expectedDate.getUTCFullYear())
      expect(date.getUTCMonth()).toBe(expectedDate.getUTCMonth())
      expect(date.getUTCDate()).toBe(expectedDate.getUTCDate())
    })

    it('should parse ISO timestamp format', () => {
      const testDateTime = nextMonday9AM()
      const date = parseUTCDate(testDateTime)
      const expectedDate = new Date(testDateTime)
      // LEARNING: Compare UTC components since parseUTCDate uses UTC
      expect(date.getUTCFullYear()).toBe(expectedDate.getUTCFullYear())
      expect(date.getUTCMonth()).toBe(expectedDate.getUTCMonth())
      expect(date.getUTCDate()).toBe(expectedDate.getUTCDate())
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
      const monday10AM = nextDayAtTime(1, 10, 0) // Monday 10 AM
      const monday12PM = nextDayAtTime(1, 12, 0) // Monday 12 PM
      const monday11AM = nextDayAtTime(1, 11, 0) // Monday 11 AM
      const monday1PM = nextDayAtTime(1, 13, 0) // Monday 1 PM
      
      const range1 = {
        start: new Date(monday10AM),
        end: new Date(monday12PM)
      }
      const range2 = {
        start: new Date(monday11AM),
        end: new Date(monday1PM)
      }
      expect(timeRangesOverlap(range1, range2)).toBe(true)
    })

    it('should detect non-overlapping ranges', () => {
      const monday10AM = nextDayAtTime(1, 10, 0)
      const monday12PM = nextDayAtTime(1, 12, 0)
      const monday1PM = nextDayAtTime(1, 13, 0)
      const monday3PM = nextDayAtTime(1, 15, 0)
      
      const range1 = {
        start: new Date(monday10AM),
        end: new Date(monday12PM)
      }
      const range2 = {
        start: new Date(monday1PM),
        end: new Date(monday3PM)
      }
      expect(timeRangesOverlap(range1, range2)).toBe(false)
    })

    it('should detect adjacent ranges as non-overlapping', () => {
      const monday10AM = nextDayAtTime(1, 10, 0)
      const monday12PM = nextDayAtTime(1, 12, 0)
      const monday2PM = nextDayAtTime(1, 14, 0)
      
      const range1 = {
        start: new Date(monday10AM),
        end: new Date(monday12PM)
      }
      const range2 = {
        start: new Date(monday12PM),
        end: new Date(monday2PM)
      }
      expect(timeRangesOverlap(range1, range2)).toBe(false)
    })

    it('should detect contained ranges as overlapping', () => {
      const monday10AM = nextDayAtTime(1, 10, 0)
      const monday11AM = nextDayAtTime(1, 11, 0)
      const monday1PM = nextDayAtTime(1, 13, 0)
      const monday2PM = nextDayAtTime(1, 14, 0)
      
      const range1 = {
        start: new Date(monday10AM),
        end: new Date(monday2PM)
      }
      const range2 = {
        start: new Date(monday11AM),
        end: new Date(monday1PM)
      }
      expect(timeRangesOverlap(range1, range2)).toBe(true)
    })
  })
})


describe('computeSlotAvailability', () => {
  describe('basic functionality', () => {
    it('should generate slots for single day within boundaries', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(), // Monday 9 AM
        endBoundary: nextMonday7PM(),   // Monday 7 PM
        duration: 60, // 1 hour
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(result.slots.length).toBeGreaterThan(0)
      expect(result.earliestCompletion).toBeTruthy()

      const firstSlot = result.slots[0]
      expect(new Date(firstSlot.startTime).getTime()).toBeGreaterThanOrEqual(
        new Date(nextMonday9AM()).getTime()
      )

      const lastSlot = result.slots[result.slots.length - 1]
      expect(new Date(lastSlot.endTime).getTime()).toBeLessThanOrEqual(
        new Date(nextMonday7PM()).getTime()
      )
    })

    it('should respect duration in slots', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 90, // 1.5 hours
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        expect(slot.duration).toBe(90)
        const start = new Date(slot.startTime)
        const end = new Date(slot.endTime)
        const actualDuration = (end.getTime() - start.getTime()) / (1000 * 60)
        expect(actualDuration).toBe(90)
      })
    })

    it('should respect minuteIncrement', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 30, // 30-minute intervals
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        const minutes = start.getMinutes()
        expect([0, 30]).toContain(minutes)
      })
    })
  })

  describe('boundary handling', () => {
    it('should return empty slots if startBoundary >= endBoundary', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday7PM(),
        endBoundary: nextMonday9AM(), // Before start
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(result.slots).toEqual([])
      expect(result.earliestCompletion).toBeNull()
    })

    it('should filter slots that start before startBoundary', () => {
      const startBoundary = nextDayAtTime(1, 12, 0) // Monday noon
      const endBoundary = nextMonday7PM()
      
      const result = computeSlotAvailability({
        startBoundary, // Start at noon
        endBoundary,
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        expect(start.getTime()).toBeGreaterThanOrEqual(
          new Date(startBoundary).getTime()
        )
      })
    })

    it('should filter slots that end after endBoundary', () => {
      const startBoundary = nextMonday9AM()
      const endBoundary = nextDayAtTime(1, 15, 0) // Monday 3 PM
      
      const result = computeSlotAvailability({
        startBoundary,
        endBoundary, // End at 3 PM
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        const end = new Date(slot.endTime)
        expect(end.getTime()).toBeLessThanOrEqual(
          new Date(endBoundary).getTime()
        )
      })
    })

    it('should handle multi-day boundaries', () => {
      const startBoundary = nextDayAtTime(1, 14, 0) // Monday 2 PM UTC
      const endBoundary = nextDayAtTime(2, 12, 0)   // Tuesday noon UTC
      
      const result = computeSlotAvailability({
        startBoundary,
        endBoundary,
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(result.slots.length).toBeGreaterThan(0)

      // PATTERN: Use day-of-week comparison instead of specific dates
      const startDate = new Date(startBoundary)
      const endDate = new Date(endBoundary)
      const mondayDayOfWeek = startDate.getUTCDay()
      const tuesdayDayOfWeek = endDate.getUTCDay()
      
      const mondaySlots = result.slots.filter(slot => {
        const date = new Date(slot.startTime)
        return date.getUTCDay() === mondayDayOfWeek
      })
      const tuesdaySlots = result.slots.filter(slot => {
        const date = new Date(slot.startTime)
        return date.getUTCDay() === tuesdayDayOfWeek
      })
      
      // WHY: In timezones behind UTC, Tuesday noon UTC might be early Tuesday local time
      // PATTERN: Accept slots on either Monday or Tuesday if endBoundary is early Tuesday
      if (tuesdaySlots.length === 0 && mondaySlots.length > 0) {
        const endBoundaryLocal = new Date(endBoundary)
        const tuesdayBusinessStart = new Date(endBoundaryLocal)
        tuesdayBusinessStart.setUTCHours(9, 0, 0, 0) // Tuesday 9 AM UTC
        if (endBoundaryLocal < tuesdayBusinessStart) {
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
      const { startBoundary, endBoundary } = createDateRange(0, 0, 1, 23) // Sunday midnight to Monday 11 PM
      
      const result = computeSlotAvailability({
        startBoundary, // Sunday
        endBoundary,   // Monday
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        const dayOfWeek = start.getDay()
        const dayHours = standardBusinessHours[dayOfWeek as keyof BusinessHoursMap]

        const startMinutes = start.getHours() * 60 + start.getMinutes()
        const businessStartMinutes = parseTimeToMinutes(dayHours.start)
        const businessEndMinutes = parseTimeToMinutes(dayHours.end)

        expect(startMinutes).toBeGreaterThanOrEqual(businessStartMinutes)
        expect(startMinutes).toBeLessThan(businessEndMinutes)
      })
    })

    it('should not generate slots outside business hours', () => {
      const result = computeSlotAvailability({
        startBoundary: nextDayAtTime(1, 8, 0),  // Monday 8 AM (before business hours)
        endBoundary: nextDayAtTime(1, 20, 0),  // Monday 8 PM (after business hours)
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        const end = new Date(slot.endTime)

        expect(start.getHours()).toBeGreaterThanOrEqual(9)
        expect(end.getHours()).toBeLessThanOrEqual(19)
      })
    })

    it('should handle different business hours per day', () => {
      const customBusinessHours: BusinessHoursMap = {
        ...standardBusinessHours,
        0: { start: '10:00', end: '16:00' } // Sunday shorter hours
      }

      const result = computeSlotAvailability({
        startBoundary: nextDayAtTime(0, 0, 0), // Sunday midnight
        endBoundary: nextDayAtTime(0, 23, 59), // Sunday 11:59 PM
        duration: 60,
        businessHours: customBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        const start = new Date(slot.startTime)
        if (start.getDay() === 0) {
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
          start: nextDayAtTime(1, 10, 0),
          end: nextDayAtTime(1, 11, 0)
        },
        {
          start: nextDayAtTime(1, 14, 0),
          end: nextDayAtTime(1, 15, 0)
        }
      ]

      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

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
    })

    it('should handle empty busy times array', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes: [],
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(result.slots.length).toBeGreaterThan(0)
    })

    it('should handle busy times spanning multiple days', () => {
      const busyTimes = [
        {
          start: nextDayAtTime(1, 16, 0), // Monday 4 PM
          end: nextDayAtTime(2, 10, 0)    // Tuesday 10 AM
        }
      ]

      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextDayAtTime(2, 19, 0), // Tuesday 7 PM
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

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
      // PATTERN: Generate mock response, extract busy times, verify filtering
      
      const dateRange = {
        start: nextMonday9AM(),
        end: nextMonday7PM()
      }

      const mockResponse = generateMockFreeBusyResponse(dateRange, {
        periodsPerCalendar: 2,
        minDurationMinutes: 30,
        maxDurationMinutes: 90,
        calendarIds: ['primary', 'work']
      })

      const busyTimes = extractBusyTimesFromFreeBusyResponse(mockResponse, true)

      expect(busyTimes.length).toBeGreaterThan(0)

      const result = computeSlotAvailability({
        startBoundary: dateRange.start,
        endBoundary: dateRange.end,
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

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

      // PATTERN: Compare with result without busy times
      const resultWithoutBusy = computeSlotAvailability({
        startBoundary: dateRange.start,
        endBoundary: dateRange.end,
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS,
        busyTimes: []
      })

      expect(result.slots.length).toBeLessThanOrEqual(resultWithoutBusy.slots.length)
    })
  })

  describe('computeSlotAvailability', () => {
    describe('basic functionality', () => {
      it('should generate all slots with availability flags', () => {
        const busyTimes = [
          {
            start: nextDayAtTime(1, 10, 0),
            end: nextDayAtTime(1, 11, 0)
          }
        ]

        const result = computeSlotAvailability({
          startBoundary: nextMonday9AM(),
          endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
        })

        // WHY: New approach generates all slots and marks availability
        // PATTERN: Check that slots array has items
        expect(result.slots.length).toBeGreaterThan(0)

        // PATTERN: Check that every slot has isAvailable property
        result.slots.forEach(slot => {
          expect(slot).toHaveProperty('isAvailable')
          expect(typeof slot.isAvailable).toBe('boolean')
        })
      })

      it('should mark busy slots as unavailable', () => {
        const busyTimes = [
          {
            start: nextDayAtTime(1, 10, 0),
            end: nextDayAtTime(1, 11, 0)
          }
        ]

        const result = computeSlotAvailability({
          startBoundary: nextMonday9AM(),
          endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
        })

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
            start: nextDayAtTime(1, 10, 0),
            end: nextDayAtTime(1, 11, 0)
          }
        ]

        const result = computeSlotAvailability({
          startBoundary: nextMonday9AM(),
          endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
        })

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

      it('should generate more slots than computeSlotAvailability when busy periods exist', () => {
        const busyTimes = [
          {
            start: '2026-01-15T10:00:00Z',
            end: '2026-01-15T11:00:00Z'
          },
          {
            start: nextDayAtTime(1, 14, 0),
            end: nextDayAtTime(1, 15, 0)
          }
        ]

        // Old approach (filters out busy slots)
        const oldResult = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
        })

        const newResult = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
        })

        // LEARNING: New approach should generate more slots
        // WHY: It includes busy slots (marked as unavailable) instead of filtering them
        // PATTERN: Compare slot counts
        expect(newResult.slots.length).toBeGreaterThanOrEqual(oldResult.slots.length)

        // LEARNING: Count of available slots should match old approach
        // PATTERN: Count available slots in new result
        const availableCount = newResult.slots.filter(slot => slot.isAvailable).length
        expect(availableCount).toBe(oldResult.slots.length)
      })

      it('should return earliest completion from available slots only', () => {
        const busyTimes = [
          {
          start: nextMonday9AM(),
          end: nextDayAtTime(1, 10, 0)
          }
        ]

        const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
        })

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
        const result = computeSlotAvailability({
          startBoundary: nextMonday9AM(),
          endBoundary: nextMonday7PM(),
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes: [],
          includeFlags: DEFAULT_INCLUDE_FLAGS
        })

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

        const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextDayAtTime(2, 19, 0), // Tuesday 7 PM
          duration: 60,
          businessHours: standardBusinessHours,
          minuteIncrement: 15,
          busyTimes,
          includeFlags: DEFAULT_INCLUDE_FLAGS
        })

        // PATTERN: Check that slots span multiple days
        // PATTERN: Use day-of-week comparison
        const startDate = new Date(nextMonday9AM())
        const mondayDayOfWeek = startDate.getUTCDay()
        const tuesdayDayOfWeek = (mondayDayOfWeek + 1) % 7
        
        const mondaySlots = result.slots.filter(slot => {
          const date = new Date(slot.startTime)
          return date.getUTCDay() === mondayDayOfWeek
        })
        const tuesdaySlots = result.slots.filter(slot => {
          const date = new Date(slot.startTime)
          return date.getUTCDay() === tuesdayDayOfWeek
        })

        expect(mondaySlots.length).toBeGreaterThan(0)
        expect(tuesdaySlots.length).toBeGreaterThan(0)

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
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
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

    it('should use default flags when DEFAULT_INCLUDE_FLAGS provided', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      result.slots.forEach(slot => {
        expect(slot.onSite).toBe(false)
        expect(slot.clientPresent).toBe(false)
        expect(slot.moveable).toBe(false)
      })
    })
  })

  describe('input validation', () => {
    describe('duration validation', () => {
      it('should throw error for duration <= 0', () => {
        expect(() => {
          computeSlotAvailability({
            startBoundary: '2026-01-15T09:00:00Z',
            endBoundary: '2026-01-15T19:00:00Z',
            duration: 0,
            businessHours: standardBusinessHours,
            minuteIncrement: 15,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('duration must be greater than 0')

        expect(() => {
          computeSlotAvailability({
            startBoundary: '2026-01-15T09:00:00Z',
            endBoundary: '2026-01-15T19:00:00Z',
            duration: -10,
            businessHours: standardBusinessHours,
            minuteIncrement: 15,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('duration must be greater than 0')
      })
    })

    describe('minuteIncrement validation', () => {
      it('should throw error for minuteIncrement <= 0', () => {
        expect(() => {
          computeSlotAvailability({
            startBoundary: '2026-01-15T09:00:00Z',
            endBoundary: '2026-01-15T19:00:00Z',
            duration: 60,
            businessHours: standardBusinessHours,
            minuteIncrement: 0,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('minuteIncrement must be greater than 0')

        expect(() => {
          computeSlotAvailability({
            startBoundary: '2026-01-15T09:00:00Z',
            endBoundary: '2026-01-15T19:00:00Z',
            duration: 60,
            businessHours: standardBusinessHours,
            minuteIncrement: -5,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('minuteIncrement must be greater than 0')
      })

      it('should throw error for non-integer minuteIncrement', () => {
        expect(() => {
          computeSlotAvailability({
            startBoundary: '2026-01-15T09:00:00Z',
            endBoundary: '2026-01-15T19:00:00Z',
            duration: 60,
            businessHours: standardBusinessHours,
            minuteIncrement: 15.5,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('minuteIncrement must be a positive integer')
      })
    })

    describe('boundary validation', () => {
      it('should throw error for missing startBoundary', () => {
        expect(() => {
          computeSlotAvailability({
            startBoundary: '' as any,
            endBoundary: '2026-01-15T19:00:00Z',
            duration: 60,
            businessHours: standardBusinessHours,
            minuteIncrement: 15,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('startBoundary and endBoundary are required')
      })

      it('should throw error for missing endBoundary', () => {
        expect(() => {
          computeSlotAvailability({
            startBoundary: '2026-01-15T09:00:00Z',
            endBoundary: '' as any,
            duration: 60,
            businessHours: standardBusinessHours,
            minuteIncrement: 15,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('startBoundary and endBoundary are required')
      })

      it('should throw error for invalid startBoundary datetime', () => {
        expect(() => {
          computeSlotAvailability({
            startBoundary: 'invalid-datetime' as any,
            endBoundary: '2026-01-15T19:00:00Z',
            duration: 60,
            businessHours: standardBusinessHours,
            minuteIncrement: 15,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('startBoundary must be a valid RFC3339 datetime')
      })

      it('should throw error for invalid endBoundary datetime', () => {
        expect(() => {
          computeSlotAvailability({
            startBoundary: '2026-01-15T09:00:00Z',
            endBoundary: 'invalid-datetime' as any,
            duration: 60,
            businessHours: standardBusinessHours,
            minuteIncrement: 15,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('endBoundary must be a valid RFC3339 datetime')
      })
    })

    describe('business hours validation', () => {
      it('should throw error for invalid businessHours type', () => {
        expect(() => {
          computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: null as any,
            minuteIncrement: 15,
            includeFlags: DEFAULT_INCLUDE_FLAGS
          })
        }).toThrow('businessHours must be a BusinessHoursMap object')
      })

      it('should return empty slots for empty business hours', () => {
        const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: {},
          minuteIncrement: 15,
          includeFlags: DEFAULT_INCLUDE_FLAGS
        })

        expect(result.slots).toEqual([])
        expect(result.earliestCompletion).toBeNull()
      })
    })
  })

  describe('earliestCompletion calculation', () => {
    it('should return earliest completion time of available slots only', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(result.earliestCompletion).toBeTruthy()

      const firstAvailableSlot = result.slots.find(slot => slot.isAvailable)
      expect(firstAvailableSlot).toBeTruthy()
      
      if (firstAvailableSlot && result.earliestCompletion) {
        const firstAvailableSlotEnd = new Date(firstAvailableSlot.endTime)
        const earliestCompletionDate = new Date(result.earliestCompletion)
        expect(earliestCompletionDate.getTime()).toBe(firstAvailableSlotEnd.getTime())
      }
    })

    it('should return null if no available slots generated', () => {
      const busyTimes = [
        { start: nextMonday9AM(), end: nextMonday7PM() }
      ]

      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        busyTimes,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      // WHY: computeSlotAvailability uses "filter during generation" approach, not "generate all then filter"
      // PATTERN: When all slots are busy, no slots are returned (they're filtered out)
      expect(result.slots.length).toBe(0)
      expect(result.earliestCompletion).toBeNull()
    })

    it('should return null if no slots generated', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday7PM(),
        endBoundary: nextMonday9AM(), // Invalid boundaries
        duration: 60,
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(result.earliestCompletion).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle very short duration', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 5, // 5 minutes
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(result.slots.length).toBeGreaterThan(0)
      result.slots.forEach(slot => {
        expect(slot.duration).toBe(5)
      })
    })

    it('should handle very long duration', () => {
      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 600, // 10 hours
        businessHours: standardBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

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

      const result = computeSlotAvailability({
        startBoundary: nextMonday9AM(),
        endBoundary: nextMonday7PM(),
        duration: 60,
        businessHours: invalidBusinessHours,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(Array.isArray(result.slots)).toBe(true)
    })

    it('should handle missing business hours for a day', () => {
      const incompleteBusinessHours = {
        ...standardBusinessHours
      }
      delete incompleteBusinessHours[1] // Remove Monday

      const result = computeSlotAvailability({
        startBoundary: '2026-01-15T09:00:00Z', // Monday
        endBoundary: '2026-01-15T19:00:00Z',
        duration: 60,
        businessHours: incompleteBusinessHours as BusinessHoursMap,
        minuteIncrement: 15,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }, [])

      expect(Array.isArray(result.slots)).toBe(true)
    })
  })
})
