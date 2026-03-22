/**
 * TIME SLOT MATCHING TESTS
 *
 * Unit tests for timeSlotMatching utility functions.
 * extractTimeString uses rfc3339ToLocalHHmm (local time); tests expect UTC.
 * Run with TZ=UTC so local === UTC (e.g. TZ=UTC npm run test -- timeSlotMatching).
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { ref } from 'vue'
import {
  extractTimeString,
  findMatchingTimeSlot,
  matchLoadedTimeSlotsImmutable,
} from '../timeSlotMatching'
import { matchLoadedTimeSlots } from '@/composables/booking/useTimeSlotMatching'
import type { TimeSlot } from '@/types/appointment'

function createTimeSlot(startTime: string, duration = 60): TimeSlot {
  const endTime =
    new Date(new Date(startTime).getTime() + duration * 60000).toISOString()
  return {
    startTime,
    endTime,
    duration,
    slotKind: 'major',
    isAvailable: true,
  }
}

describe('timeSlotMatching', () => {
  describe('extractTimeString', () => {
    describe('RFC3339 datetime format (UTC)', () => {
      it('should extract UTC time from RFC3339 datetime string', () => {
        const rfc3339 = '2026-01-09T09:30:00Z'
        expect(extractTimeString(rfc3339)).toBe('09:30')
      })

      it('should extract UTC time from RFC3339 with milliseconds', () => {
        const rfc3339 = '2026-01-09T14:30:00.000Z'
        expect(extractTimeString(rfc3339)).toBe('14:30')
      })

      it('should handle midnight UTC', () => {
        const rfc3339 = '2026-01-09T00:00:00Z'
        expect(extractTimeString(rfc3339)).toBe('00:00')
      })

      it('should handle end of day UTC', () => {
        const rfc3339 = '2026-01-09T23:59:00Z'
        expect(extractTimeString(rfc3339)).toBe('23:59')
      })

      it('should extract UTC time from Date object', () => {
        const date = new Date(Date.UTC(2026, 0, 9, 9, 0, 0)) // Jan 9, 2026 9:00 AM UTC
        
        expect(extractTimeString(date)).toBe('09:00')
      })

      it('should handle morning times in UTC', () => {
        const date = new Date(Date.UTC(2026, 0, 1, 8, 15, 0))
        
        expect(extractTimeString(date)).toBe('08:15')
      })

      it('should handle afternoon times in UTC', () => {
        const date = new Date(Date.UTC(2026, 0, 1, 16, 45, 0))
        
        expect(extractTimeString(date)).toBe('16:45')
      })
    })

    describe('invalid inputs', () => {
      it('should return null for invalid date string', () => {
        expect(extractTimeString('not-a-date')).toBeNull()
      })

      it('should return null for empty string', () => {
        expect(extractTimeString('')).toBeNull()
      })

      it('should return null for invalid Date object', () => {
        expect(extractTimeString(new Date('invalid'))).toBeNull()
      })
    })
  })

  describe('findMatchingTimeSlot', () => {
    const availableSlots: TimeSlot[] = [
      createTimeSlot('2026-01-09T08:00:00'),
      createTimeSlot('2026-01-09T09:00:00'),
      createTimeSlot('2026-01-09T10:00:00'),
      createTimeSlot('2026-01-09T14:00:00'),
    ]

    it('should find matching slot by RFC3339 datetime', () => {
      const result = findMatchingTimeSlot('2026-01-09T09:00:00Z', availableSlots)
      
      expect(result).toBeDefined()
      expect(result?.startTime).toBe('2026-01-09T09:00:00')
    })

    it('should find matching slot by ISO timestamp', () => {
      const result = findMatchingTimeSlot('2026-01-09T14:00:00', availableSlots)
      
      expect(result).toBeDefined()
      expect(result?.startTime).toBe('2026-01-09T14:00:00')
    })

    it('should return undefined when no match found', () => {
      const result = findMatchingTimeSlot('11:00', availableSlots)
      
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty slots array', () => {
      const result = findMatchingTimeSlot('09:00', [])
      
      expect(result).toBeUndefined()
    })

    it('should return undefined for invalid time string', () => {
      const result = findMatchingTimeSlot('invalid', availableSlots)
      
      expect(result).toBeUndefined()
    })
  })

  describe('matchLoadedTimeSlots', () => {
    const availableSlots: TimeSlot[] = [
      createTimeSlot('2026-01-09T08:00:00'),
      createTimeSlot('2026-01-09T09:00:00'),
      createTimeSlot('2026-01-09T10:00:00'),
      createTimeSlot('2026-01-09T14:00:00'),
    ]

    it('should match single loaded slot to inspector', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots(
        [{ startTime: '2026-01-09T09:00:00Z' }],
        availableSlots,
        inspectorRef,
        clientRef
      )
      
      expect(inspectorRef.value).toBeDefined()
      expect(inspectorRef.value?.startTime).toBe('2026-01-09T09:00:00')
      expect(clientRef.value).toBeNull()
    })

    it('should match two loaded slots to inspector and client', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots(
        [{ startTime: '2026-01-09T08:00:00Z' }, { startTime: '2026-01-09T14:00:00Z' }],
        availableSlots,
        inspectorRef,
        clientRef
      )
      
      expect(inspectorRef.value?.startTime).toBe('2026-01-09T08:00:00')
      expect(clientRef.value?.startTime).toBe('2026-01-09T14:00:00')
    })

    it('should not modify refs when no loaded slots', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots([], availableSlots, inspectorRef, clientRef)
      
      expect(inspectorRef.value).toBeNull()
      expect(clientRef.value).toBeNull()
    })

    it('should not modify refs when no available slots', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots([{ startTime: '2026-01-09T09:00:00Z' }], [], inspectorRef, clientRef)
      
      expect(inspectorRef.value).toBeNull()
      expect(clientRef.value).toBeNull()
    })

    it('should not modify refs when no match found', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots(
        [{ startTime: '2026-01-09T11:00:00Z' }], // No slot at 11:00
        availableSlots,
        inspectorRef,
        clientRef
      )
      
      expect(inspectorRef.value).toBeNull()
      expect(clientRef.value).toBeNull()
    })

    it('should match inspector but not client when only first matches', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots(
        [{ startTime: '2026-01-09T09:00:00Z' }, { startTime: '2026-01-09T11:00:00Z' }], // 11:00 doesn't exist
        availableSlots,
        inspectorRef,
        clientRef
      )
      
      expect(inspectorRef.value?.startTime).toBe('2026-01-09T09:00:00')
      expect(clientRef.value).toBeNull()
    })
  })

  describe('matchLoadedTimeSlotsImmutable', () => {
    const availableSlots: TimeSlot[] = [
      createTimeSlot('2026-01-09T08:00:00'),
      createTimeSlot('2026-01-09T09:00:00'),
      createTimeSlot('2026-01-09T14:00:00'),
    ]

    it('should return matched slots without mutating anything', () => {
      const result = matchLoadedTimeSlotsImmutable(
        [{ startTime: '2026-01-09T09:00:00Z' }, { startTime: '2026-01-09T14:00:00Z' }],
        availableSlots
      )
      
      expect(result.inspectorSlot?.startTime).toBe('2026-01-09T09:00:00')
      expect(result.clientSlot?.startTime).toBe('2026-01-09T14:00:00')
    })

    it('should return nulls when no loaded slots', () => {
      const result = matchLoadedTimeSlotsImmutable([], availableSlots)
      
      expect(result.inspectorSlot).toBeNull()
      expect(result.clientSlot).toBeNull()
    })

    it('should return nulls when no available slots', () => {
      const result = matchLoadedTimeSlotsImmutable([{ startTime: '2026-01-09T09:00:00Z' }], [])
      
      expect(result.inspectorSlot).toBeNull()
      expect(result.clientSlot).toBeNull()
    })

    it('should return inspector only when one slot loaded', () => {
      const result = matchLoadedTimeSlotsImmutable(
        [{ startTime: '2026-01-09T08:00:00Z' }],
        availableSlots
      )
      
      expect(result.inspectorSlot?.startTime).toBe('2026-01-09T08:00:00')
      expect(result.clientSlot).toBeNull()
    })

    it('should return null for unmatched slots', () => {
      const result = matchLoadedTimeSlotsImmutable(
        [{ startTime: '2026-01-09T11:00:00Z' }, { startTime: '2026-01-09T12:00:00Z' }],
        availableSlots
      )
      
      expect(result.inspectorSlot).toBeNull()
      expect(result.clientSlot).toBeNull()
    })
  })
})
