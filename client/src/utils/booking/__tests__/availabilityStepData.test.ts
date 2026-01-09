/**
 * AVAILABILITY STEP DATA TESTS
 * 
 * Unit tests for availabilityStepData utility functions.
 * Tests building availability data structures for wizard submission.
 * 
 * What it covers:
 * - buildSelectedTimeSlots: Create time slot array from selections
 * - buildAvailabilityStepData: Create availability data structure
 * 
 * How it works:
 * - Tests time slot building with various combinations
 * - Tests data structure creation
 * 
 * What it validates:
 * - Correct time slot array building with inspector slot only
 * - Adding client slot when different from inspector
 * - Null returns when required data missing
 * - Data structure correctly maps inputs to output
 * 
 * Dependencies:
 * - vitest for testing
 * - TimeSlot type from appointment types
 */

import { describe, it, expect } from 'vitest'
import {
  buildSelectedTimeSlots,
  buildAvailabilityStepData,
} from '../availabilityStepData'
import type { TimeSlot } from '@/types/appointment'

// Helper to create mock time slot
function createTimeSlot(slotStart: string): TimeSlot {
  return {
    slotStart,
    slotEnd: '', // Not used in the logic being tested
  }
}

describe('availabilityStepData', () => {
  describe('buildSelectedTimeSlots', () => {
    it('should return null when inspectorTimeSlot is null', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: null,
        clientTimeSlot: createTimeSlot('10:00'),
        onSiteTotal: 120,
        presentationDuration: 30,
      })
      
      expect(result).toBeNull()
    })

    it('should return null when selectedDateStart is null', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: null,
        inspectorTimeSlot: createTimeSlot('09:00'),
        clientTimeSlot: createTimeSlot('10:00'),
        onSiteTotal: 120,
        presentationDuration: 30,
      })
      
      expect(result).toBeNull()
    })

    it('should return single slot when only inspector slot provided', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: createTimeSlot('09:00'),
        clientTimeSlot: null,
        onSiteTotal: 120,
        presentationDuration: 30,
      })
      
      expect(result).toEqual([
        { time: '09:00', duration: 120 },
      ])
    })

    it('should return single slot when client slot equals inspector slot', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: createTimeSlot('09:00'),
        clientTimeSlot: createTimeSlot('09:00'),
        onSiteTotal: 120,
        presentationDuration: 30,
      })
      
      expect(result).toEqual([
        { time: '09:00', duration: 120 },
      ])
    })

    it('should return two slots when client slot differs from inspector slot', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: createTimeSlot('09:00'),
        clientTimeSlot: createTimeSlot('11:00'),
        onSiteTotal: 120,
        presentationDuration: 30,
      })
      
      expect(result).toEqual([
        { time: '09:00', duration: 120 },
        { time: '11:00', duration: 30 },
      ])
    })

    it('should use onSiteTotal for inspector slot duration', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: createTimeSlot('08:00'),
        clientTimeSlot: null,
        onSiteTotal: 180,
        presentationDuration: 45,
      })
      
      expect(result?.[0].duration).toBe(180)
    })

    it('should use presentationDuration for client slot duration', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: createTimeSlot('08:00'),
        clientTimeSlot: createTimeSlot('12:00'),
        onSiteTotal: 180,
        presentationDuration: 45,
      })
      
      expect(result?.[1].duration).toBe(45)
    })

    it('should preserve exact time string from slot', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: createTimeSlot('2026-01-15T09:30:00.000Z'),
        clientTimeSlot: null,
        onSiteTotal: 90,
        presentationDuration: 30,
      })
      
      expect(result?.[0].time).toBe('2026-01-15T09:30:00.000Z')
    })
  })

  describe('buildAvailabilityStepData', () => {
    it('should build data with selected date and time slots', () => {
      const result = buildAvailabilityStepData({
        selectedDate: { start: '2026-01-15', end: '2026-01-15' },
        selectedTimeSlots: [{ time: '09:00', duration: 120 }],
      })
      
      expect(result).toEqual({
        selectedDate: { start: '2026-01-15', end: '2026-01-15' },
        selectedTimeSlots: [{ time: '09:00', duration: 120 }],
      })
    })

    it('should handle null start date', () => {
      const result = buildAvailabilityStepData({
        selectedDate: { start: null, end: null },
        selectedTimeSlots: null,
      })
      
      expect(result.selectedDate.start).toBeNull()
      expect(result.selectedDate.end).toBeNull()
    })

    it('should handle null time slots', () => {
      const result = buildAvailabilityStepData({
        selectedDate: { start: '2026-01-15', end: '2026-01-15' },
        selectedTimeSlots: null,
      })
      
      expect(result.selectedTimeSlots).toBeNull()
    })

    it('should handle multiple time slots', () => {
      const result = buildAvailabilityStepData({
        selectedDate: { start: '2026-01-15', end: '2026-01-15' },
        selectedTimeSlots: [
          { time: '09:00', duration: 120 },
          { time: '11:30', duration: 30 },
        ],
      })
      
      expect(result.selectedTimeSlots).toHaveLength(2)
    })

    it('should create new date object (not reference)', () => {
      const inputDate = { start: '2026-01-15', end: '2026-01-15' }
      const result = buildAvailabilityStepData({
        selectedDate: inputDate,
        selectedTimeSlots: null,
      })
      
      // Should be a different object reference
      expect(result.selectedDate).not.toBe(inputDate)
      expect(result.selectedDate).toEqual(inputDate)
    })
  })
})
