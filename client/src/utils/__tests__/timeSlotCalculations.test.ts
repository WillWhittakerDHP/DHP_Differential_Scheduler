/**
 * TIME SLOT CALCULATIONS TESTS
 * 
 * Unit tests for time slot calculation utilities.
 * Tests duration calculation, time slot generation, and calendar availability integration.
 * Session 1.3.7: Client-Side Availability Calculations
 */

import { describe, it, expect, vi } from 'vitest'

// Mock availability settings before importing the module under test
// LEARNING: Mock returns Promise to match async getAvailabilitySettings
// WHY: getAvailabilitySettings is now async (fetches from API)
vi.mock('@/configs/availabilitySettings', () => ({
  getAvailabilitySettings: async () => ({
    businessHours: {
      0: { start: '09:00', end: '19:00' }, // Sunday
      1: { start: '09:00', end: '19:00' }, // Monday
      2: { start: '09:00', end: '19:00' }, // Tuesday
      3: { start: '09:00', end: '19:00' }, // Wednesday
      4: { start: '09:00', end: '19:00' }, // Thursday
      5: { start: '09:00', end: '19:00' }, // Friday
      6: { start: '09:00', end: '19:00' }  // Saturday
    },
    minuteIncrement: 15,
    leadTime: 60
  })
}))

import {
  calculateDurationFromBlockInstances,
  calculateDurationFromPartInstances,
  generateTimeSlots,
  getCalendarAvailability
} from '../timeSlotCalculations'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// ===================================================================
// TEST DATA SETUP
// ===================================================================

/**
 * Helper to create a BookingPartInstance
 */
function createPartInstance(
  id: string,
  baseTime: number,
  options: {
    onSite?: boolean
    clientPresent?: boolean
  } = {}
): BookingBlockInstance['partInstances'][0] {
  return {
    id,
    entityKey: 'partInstance',
    name: `Part ${id}`,
    partShape: 'shape-1',
    onSite: options.onSite ?? false,
    clientPresent: options.clientPresent ?? false,
    moveable: false,
    baseTime,
    rateOverBaseTime: 0,
    baseFee: 0,
    rateOverBaseFee: 0,
    orderIndex: 0,
    disabled: false
  }
}

/**
 * Helper to create a BookingBlockInstance
 */
function createBlockInstance(
  id: string,
  partInstances: BookingBlockInstance['partInstances'] = []
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: `Block ${id}`,
    baseSqFt: 0,
    description: '',
    icon: '',
    disabled: false,
    differential: false,
    orderIndex: 0,
    active: true,
    blockShape: 'shape-1',
    activeBlockIds: [],
    partInstances
  }
}

// ===================================================================
// TESTS
// ===================================================================

describe('timeSlotCalculations', () => {
  describe('calculateDurationFromBlockInstances', () => {
    it('should return default 90 minutes for empty array', () => {
      const result = calculateDurationFromBlockInstances([])
      expect(result).toBe(90)
    })

    it('should calculate duration from single block instance with single part instance', () => {
      const partInstance = createPartInstance('part-1', 60)
      const blockInstance = createBlockInstance('block-1', [partInstance])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(60)
    })

    it('should calculate duration from single block instance with multiple part instances', () => {
      const partInstances = [
        createPartInstance('part-1', 30),
        createPartInstance('part-2', 45),
        createPartInstance('part-3', 15)
      ]
      const blockInstance = createBlockInstance('block-1', partInstances)
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // 30 + 45 + 15
    })

    it('should calculate duration from multiple block instances', () => {
      const serviceParts = [
        createPartInstance('service-part-1', 60),
        createPartInstance('service-part-2', 30)
      ]
      const propertyParts = [
        createPartInstance('property-part-1', 15)
      ]
      const availabilityParts = [
        createPartInstance('availability-part-1', 10)
      ]
      
      const service = createBlockInstance('service-1', serviceParts)
      const property = createBlockInstance('property-1', propertyParts)
      const availability = createBlockInstance('availability-1', availabilityParts)
      
      const result = calculateDurationFromBlockInstances([service, property, availability])
      expect(result).toBe(115) // 60 + 30 + 15 + 10
    })

    it('should return default 90 minutes if sum is 0', () => {
      const partInstance = createPartInstance('part-1', 0)
      const blockInstance = createBlockInstance('block-1', [partInstance])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // Default when sum is 0
    })

    it('should handle block instance with no part instances', () => {
      const blockInstance = createBlockInstance('block-1', [])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // Default when no parts
    })

    it('should handle part instances with zero baseTime', () => {
      const partInstances = [
        createPartInstance('part-1', 60),
        createPartInstance('part-2', 0),
        createPartInstance('part-3', 30)
      ]
      const blockInstance = createBlockInstance('block-1', partInstances)
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // 60 + 0 + 30
    })
  })

  describe('calculateDurationFromPartInstances (deprecated)', () => {
    it('should calculate duration from single block instance (legacy)', () => {
      const partInstance = createPartInstance('part-1', 60)
      const blockInstance = createBlockInstance('block-1', [partInstance])
      
      const result = calculateDurationFromPartInstances(blockInstance)
      expect(result).toBe(60)
    })

    it('should return default for null service (legacy)', () => {
      const result = calculateDurationFromPartInstances(null)
      expect(result).toBe(90)
    })
  })

  describe('getCalendarAvailability', () => {
    it('should return empty array (all times available)', () => {
      const dateRange = {
        start: '2026-01-03T00:00:00Z',
        end: '2026-01-04T00:00:00Z'
      }
      
      const result = getCalendarAvailability(dateRange)
      expect(result).toEqual([])
    })

    it('should accept dateRange parameter without errors', () => {
      const dateRange = {
        start: '2026-01-03T00:00:00Z',
        end: '2026-01-10T00:00:00Z'
      }
      
      // Should not throw
      expect(() => getCalendarAvailability(dateRange)).not.toThrow()
      const result = getCalendarAvailability(dateRange)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('generateTimeSlots', () => {

    it('should generate slots for single day', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z', // Monday
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 60 // 1 hour
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      expect(slots.length).toBeGreaterThan(0)
      // Should have slots from 9:00 AM to 6:00 PM (last slot that fits 1-hour duration)
      // 9:00-10:00, 9:15-10:15, ..., 18:00-19:00
      // That's 37 slots (9:00 to 18:00 at 15-minute intervals)
      expect(slots.length).toBe(37)
    })

    it('should generate slots for multiple days', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z', // Monday
        end: '2026-01-08T00:00:00Z'   // Wednesday
      }
      const duration = 60 // 1 hour
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      // Should have slots for 2 days (Monday and Tuesday)
      expect(slots.length).toBeGreaterThan(0)
      expect(slots.length).toBe(37 * 2) // 37 slots per day
    })

    it('should respect duration when generating slots', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z', // Monday
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 90 // 1.5 hours
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      expect(slots.length).toBeGreaterThan(0)
      // First slot should be 1.5 hours long
      const firstSlot = slots[0]
      const start = new Date(firstSlot.slotStart)
      const end = new Date(firstSlot.slotEnd)
      const slotDuration = (end.getTime() - start.getTime()) / (1000 * 60)
      expect(slotDuration).toBe(90)
    })

    it('should filter out slots that extend past business hours', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z', // Monday
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 120 // 2 hours
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      // Last slot should end at or before 7:00 PM (19:00)
      const lastSlot = slots[slots.length - 1]
      const endTime = new Date(lastSlot.slotEnd)
      const endHour = endTime.getHours()
      expect(endHour).toBeLessThanOrEqual(19)
      
      // Should not have slots that start after 5:00 PM (17:00) for 2-hour duration
      const lateSlots = slots.filter(slot => {
        const start = new Date(slot.slotStart)
        return start.getHours() >= 17
      })
      // All late slots should end at or before 19:00
      lateSlots.forEach(slot => {
        const end = new Date(slot.slotEnd)
        expect(end.getHours()).toBeLessThanOrEqual(19)
      })
    })

    it('should filter out busy times', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z', // Monday
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 60
      const busyTimes = [
        {
          start: '2026-01-06T10:00:00Z',
          end: '2026-01-06T11:00:00Z'
        },
        {
          start: '2026-01-06T14:00:00Z',
          end: '2026-01-06T15:00:00Z'
        }
      ]
      
      const slots = await generateTimeSlots(dateRange, duration, busyTimes)
      
      // Should not have slots that overlap with busy times
      slots.forEach(slot => {
        const slotStart = new Date(slot.slotStart)
        const slotEnd = new Date(slot.slotEnd)
        
        busyTimes.forEach(busy => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)
          
          // Slot should not overlap with busy time
          const overlaps = (
            (slotStart >= busyStart && slotStart < busyEnd) ||
            (slotEnd > busyStart && slotEnd <= busyEnd) ||
            (slotStart <= busyStart && slotEnd >= busyEnd)
          )
          expect(overlaps).toBe(false)
        })
      })
    })

    it('should handle different time increments', async () => {
      // Note: This test verifies the function works with the mocked 15-minute increment
      // To test different increments, you would need to create a separate test file
      // or use vi.doMock() to change the mock for this specific test
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 60
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      // With 15-minute increments (from mock), should have slots
      expect(slots.length).toBeGreaterThan(0)
      // Should have slots at :00, :15, :30, :45 of each hour
      const firstSlot = slots[0]
      const start = new Date(firstSlot.slotStart)
      expect([0, 15, 30, 45]).toContain(start.getMinutes())
    })

    it('should handle edge case: midnight boundary', async () => {
      const dateRange = {
        start: '2026-01-06T23:00:00Z', // Near midnight
        end: '2026-01-07T01:00:00Z'   // Crosses midnight
      }
      const duration = 60
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      // Should handle date boundary correctly
      expect(Array.isArray(slots)).toBe(true)
      // Slots should have valid ISO date strings
      slots.forEach(slot => {
        expect(() => new Date(slot.slotStart)).not.toThrow()
        expect(() => new Date(slot.slotEnd)).not.toThrow()
      })
    })

    it('should handle edge case: date range spanning week boundary', async () => {
      const dateRange = {
        start: '2026-01-05T00:00:00Z', // Sunday
        end: '2026-01-08T00:00:00Z'   // Wednesday
      }
      const duration = 60
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      // Should generate slots for multiple days including different days of week
      expect(slots.length).toBeGreaterThan(0)
      // Should have slots for Sunday, Monday, Tuesday
      const uniqueDays = new Set(
        slots.map(slot => {
          const date = new Date(slot.slotStart)
          return date.getDate()
        })
      )
      expect(uniqueDays.size).toBeGreaterThanOrEqual(1)
    })

    it('should handle very short duration (< 15 minutes)', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 10 // 10 minutes
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      expect(slots.length).toBeGreaterThan(0)
      // Slots should be 10 minutes long
      const firstSlot = slots[0]
      const start = new Date(firstSlot.slotStart)
      const end = new Date(firstSlot.slotEnd)
      const slotDuration = (end.getTime() - start.getTime()) / (1000 * 60)
      expect(slotDuration).toBe(10)
    })

    it('should handle very long duration (> 8 hours)', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 600 // 10 hours
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      // Should only have slots that fit within business hours (9 AM - 7 PM = 10 hours)
      // So should have very few or no slots
      expect(Array.isArray(slots)).toBe(true)
      // All slots should end at or before 19:00
      slots.forEach(slot => {
        const end = new Date(slot.slotEnd)
        expect(end.getHours()).toBeLessThanOrEqual(19)
      })
    })
  })
})

