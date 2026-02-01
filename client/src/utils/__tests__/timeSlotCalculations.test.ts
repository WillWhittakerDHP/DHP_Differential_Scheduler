
import { describe, it, expect, vi } from 'vitest'

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
  generateTimeSlots,
  getCalendarAvailabilitySync
} from '../timeSlotCalculations'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'


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

  describe('calculateDurationFromBlockInstances (single instance)', () => {
    it('should calculate duration from single block instance', () => {
      const partInstance = createPartInstance('part-1', 60)
      const blockInstance = createBlockInstance('block-1', [partInstance])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(60)
    })

    it('should return default for empty array', () => {
      const result = calculateDurationFromBlockInstances([])
      expect(result).toBe(90)
    })
  })

  describe('getCalendarAvailabilitySync', () => {
    it('should return empty array (all times available)', () => {
      const dateRange = {
        start: '2026-01-03T00:00:00Z',
        end: '2026-01-04T00:00:00Z'
      }
      
      const result = getCalendarAvailabilitySync(dateRange)
      expect(result).toEqual([])
    })

    it('should accept dateRange parameter without errors', () => {
      const dateRange = {
        start: '2026-01-03T00:00:00Z',
        end: '2026-01-10T00:00:00Z'
      }
      
      expect(() => getCalendarAvailabilitySync(dateRange)).not.toThrow()
      const result = getCalendarAvailabilitySync(dateRange)
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
      expect(slots.length).toBe(37)
    })

    it('should generate slots for multiple days', async () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z', // Monday
        end: '2026-01-08T00:00:00Z'   // Wednesday
      }
      const duration = 60 // 1 hour
      
      const slots = await generateTimeSlots(dateRange, duration)
      
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
      const firstSlot = slots[0]
      const start = new Date(firstSlot.startTime)
      const end = new Date(firstSlot.endTime)
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
      
      const lastSlot = slots[slots.length - 1]
      const endTime = new Date(lastSlot.endTime)
      const endHour = endTime.getHours()
      expect(endHour).toBeLessThanOrEqual(19)
      
      const lateSlots = slots.filter(slot => {
        const start = new Date(slot.startTime)
        return start.getHours() >= 17
      })
      lateSlots.forEach(slot => {
        const end = new Date(slot.endTime)
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
      
      slots.forEach(slot => {
        const slotStart = new Date(slot.startTime)
        const slotEnd = new Date(slot.endTime)
        
        busyTimes.forEach(busy => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)
          
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
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      const duration = 60
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      expect(slots.length).toBeGreaterThan(0)
      const firstSlot = slots[0]
      const start = new Date(firstSlot.startTime)
      expect([0, 15, 30, 45]).toContain(start.getMinutes())
    })

    it('should handle edge case: midnight boundary', async () => {
      const dateRange = {
        start: '2026-01-06T23:00:00Z', // Near midnight
        end: '2026-01-07T01:00:00Z'   // Crosses midnight
      }
      const duration = 60
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      expect(Array.isArray(slots)).toBe(true)
      slots.forEach(slot => {
        expect(() => new Date(slot.startTime)).not.toThrow()
        expect(() => new Date(slot.endTime)).not.toThrow()
      })
    })

    it('should handle edge case: date range spanning week boundary', async () => {
      const dateRange = {
        start: '2026-01-05T00:00:00Z', // Sunday
        end: '2026-01-08T00:00:00Z'   // Wednesday
      }
      const duration = 60
      
      const slots = await generateTimeSlots(dateRange, duration)
      
      expect(slots.length).toBeGreaterThan(0)
      const uniqueDays = new Set(
        slots.map(slot => {
          const date = new Date(slot.startTime)
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
      const firstSlot = slots[0]
      const start = new Date(firstSlot.startTime)
      const end = new Date(firstSlot.endTime)
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
      
      expect(Array.isArray(slots)).toBe(true)
      slots.forEach(slot => {
        const end = new Date(slot.endTime)
        expect(end.getHours()).toBeLessThanOrEqual(19)
      })
    })
  })
})

