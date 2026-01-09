/**
 * TIME SLOT MATCHING TESTS
 * 
 * Unit tests for timeSlotMatching utility functions.
 * Tests time extraction, slot matching, and loaded appointment restoration.
 * 
 * What it covers:
 * - extractTimeString: Normalizing various time formats to HH:mm
 * - findMatchingTimeSlot: Finding available slots by time
 * - matchLoadedTimeSlots: Restoring time slot selections from saved appointments
 * - matchLoadedTimeSlotsImmutable: Pure function version of matching
 * 
 * How it works:
 * - Tests various input formats: HH:mm, HH:mm:ss, ISO timestamps
 * - Tests slot matching against available time slots
 * - Tests ref mutation for composable compatibility
 * 
 * What it validates:
 * - Correct time extraction from various formats
 * - Proper slot matching by time comparison
 * - Correct population of inspector/client slot refs
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref for reactive references
 * - TimeSlot type from appointment types
 */

import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import {
  extractTimeString,
  findMatchingTimeSlot,
  matchLoadedTimeSlots,
  matchLoadedTimeSlotsImmutable,
} from '../timeSlotMatching'
import type { TimeSlot } from '@/types/appointment'

// Helper to create mock TimeSlot
function createTimeSlot(slotStart: string, duration = 60): TimeSlot {
  return {
    slotStart,
    slotEnd: slotStart, // Not used in matching logic
    duration,
    available: true,
  }
}

describe('timeSlotMatching', () => {
  describe('extractTimeString', () => {
    describe('HH:mm format', () => {
      it('should extract time from HH:mm format', () => {
        expect(extractTimeString('09:30')).toBe('09:30')
      })

      it('should extract time from H:mm format (single digit hour)', () => {
        expect(extractTimeString('9:30')).toBe('9:30')
      })

      it('should handle midnight', () => {
        expect(extractTimeString('00:00')).toBe('00:00')
      })

      it('should handle end of day', () => {
        expect(extractTimeString('23:59')).toBe('23:59')
      })
    })

    describe('HH:mm:ss format', () => {
      it('should extract time from HH:mm:ss format (trim seconds)', () => {
        expect(extractTimeString('09:30:00')).toBe('09:30')
      })

      it('should handle single digit hour with seconds', () => {
        expect(extractTimeString('9:30:45')).toBe('9:30')
      })
    })

    describe('ISO timestamp format', () => {
      it('should extract local time from ISO timestamp', () => {
        // Create a date at a specific local time
        const date = new Date(2026, 0, 9, 14, 30, 0) // Jan 9, 2026 2:30 PM local
        const isoString = date.toISOString()
        
        expect(extractTimeString(isoString)).toBe('14:30')
      })

      it('should extract time from Date object', () => {
        const date = new Date(2026, 5, 15, 9, 0, 0) // June 15, 2026 9:00 AM local
        
        expect(extractTimeString(date)).toBe('09:00')
      })

      it('should handle morning times', () => {
        const date = new Date(2026, 0, 1, 8, 15, 0)
        
        expect(extractTimeString(date)).toBe('08:15')
      })

      it('should handle afternoon times', () => {
        const date = new Date(2026, 0, 1, 16, 45, 0)
        
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

    it('should find matching slot by HH:mm time', () => {
      const result = findMatchingTimeSlot('09:00', availableSlots)
      
      expect(result).toBeDefined()
      expect(result?.slotStart).toBe('2026-01-09T09:00:00')
    })

    it('should find matching slot by ISO timestamp', () => {
      const result = findMatchingTimeSlot('2026-01-09T14:00:00', availableSlots)
      
      expect(result).toBeDefined()
      expect(result?.slotStart).toBe('2026-01-09T14:00:00')
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
        [{ time: '09:00' }],
        availableSlots,
        inspectorRef,
        clientRef
      )
      
      expect(inspectorRef.value).toBeDefined()
      expect(inspectorRef.value?.slotStart).toBe('2026-01-09T09:00:00')
      expect(clientRef.value).toBeNull()
    })

    it('should match two loaded slots to inspector and client', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots(
        [{ time: '08:00' }, { time: '14:00' }],
        availableSlots,
        inspectorRef,
        clientRef
      )
      
      expect(inspectorRef.value?.slotStart).toBe('2026-01-09T08:00:00')
      expect(clientRef.value?.slotStart).toBe('2026-01-09T14:00:00')
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
      
      matchLoadedTimeSlots([{ time: '09:00' }], [], inspectorRef, clientRef)
      
      expect(inspectorRef.value).toBeNull()
      expect(clientRef.value).toBeNull()
    })

    it('should not modify refs when no match found', () => {
      const inspectorRef = ref<TimeSlot | null>(null)
      const clientRef = ref<TimeSlot | null>(null)
      
      matchLoadedTimeSlots(
        [{ time: '11:00' }], // No slot at 11:00
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
        [{ time: '09:00' }, { time: '11:00' }], // 11:00 doesn't exist
        availableSlots,
        inspectorRef,
        clientRef
      )
      
      expect(inspectorRef.value?.slotStart).toBe('2026-01-09T09:00:00')
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
        [{ time: '09:00' }, { time: '14:00' }],
        availableSlots
      )
      
      expect(result.inspectorSlot?.slotStart).toBe('2026-01-09T09:00:00')
      expect(result.clientSlot?.slotStart).toBe('2026-01-09T14:00:00')
    })

    it('should return nulls when no loaded slots', () => {
      const result = matchLoadedTimeSlotsImmutable([], availableSlots)
      
      expect(result.inspectorSlot).toBeNull()
      expect(result.clientSlot).toBeNull()
    })

    it('should return nulls when no available slots', () => {
      const result = matchLoadedTimeSlotsImmutable([{ time: '09:00' }], [])
      
      expect(result.inspectorSlot).toBeNull()
      expect(result.clientSlot).toBeNull()
    })

    it('should return inspector only when one slot loaded', () => {
      const result = matchLoadedTimeSlotsImmutable(
        [{ time: '08:00' }],
        availableSlots
      )
      
      expect(result.inspectorSlot?.slotStart).toBe('2026-01-09T08:00:00')
      expect(result.clientSlot).toBeNull()
    })

    it('should return null for unmatched slots', () => {
      const result = matchLoadedTimeSlotsImmutable(
        [{ time: '11:00' }, { time: '12:00' }],
        availableSlots
      )
      
      expect(result.inspectorSlot).toBeNull()
      expect(result.clientSlot).toBeNull()
    })
  })
})
