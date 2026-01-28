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
import type { AppointmentSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'

// Helper to create mock AppointmentSlot
function createAppointmentSlot(params: {
  totalOnSiteStartTime?: RFC3339DateTime
  totalOnSiteEndTime?: RFC3339DateTime
  totalOnSiteDuration?: number
  totalClientPresentStartTime?: RFC3339DateTime
  totalClientPresentEndTime?: RFC3339DateTime
  totalClientPresentDuration?: number
}): AppointmentSlot {
  return {
    buttonIndex: 0,
    isAvailable: true,
    earlyArrival: null,
    dataCollection: null,
    reportWriting: null,
    clientPresentation: null,
    totalOnSite: params.totalOnSiteStartTime && params.totalOnSiteEndTime ? {
      startTime: params.totalOnSiteStartTime,
      endTime: params.totalOnSiteEndTime,
      duration: params.totalOnSiteDuration || 120,
    } : null,
    totalClientPresent: params.totalClientPresentStartTime && params.totalClientPresentEndTime ? {
      startTime: params.totalClientPresentStartTime,
      endTime: params.totalClientPresentEndTime,
      duration: params.totalClientPresentDuration || 30,
    } : null,
    totalMoveable: null,
    totalTime: null,
  }
}

describe('availabilityStepData', () => {
  describe('buildSelectedTimeSlots', () => {
    it('should return null when selectedSlot is null', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: null,
      })
      
      expect(result).toBeNull()
    })

    it('should return null when selectedDateStart is null', () => {
      const slot = createAppointmentSlot({
        totalOnSiteStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        totalOnSiteEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        totalOnSiteDuration: 120,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: null,
        selectedSlot: slot,
      })
      
      expect(result).toBeNull()
    })

    it('should return single slot when only totalOnSite provided', () => {
      const slot = createAppointmentSlot({
        totalOnSiteStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        totalOnSiteEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        totalOnSiteDuration: 120,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
      })
      
      expect(result).toEqual([
        { 
          startTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        },
      ])
    })

    it('should return single slot when clientPresent equals onSite startTime', () => {
      const slot = createAppointmentSlot({
        totalOnSiteStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        totalOnSiteEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        totalOnSiteDuration: 120,
        totalClientPresentStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        totalClientPresentEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        totalClientPresentDuration: 120,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
      })
      
      // Should only return one slot since startTimes are the same
      expect(result).toEqual([
        { 
          startTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        },
      ])
    })

    it('should return two slots when clientPresent differs from onSite', () => {
      const slot = createAppointmentSlot({
        totalOnSiteStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        totalOnSiteEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        totalOnSiteDuration: 120,
        totalClientPresentStartTime: '2026-01-15T10:00:00.000Z' as RFC3339DateTime,
        totalClientPresentEndTime: '2026-01-15T10:30:00.000Z' as RFC3339DateTime,
        totalClientPresentDuration: 30,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
      })
      
      expect(result).toEqual([
        { 
          startTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        },
        { 
          startTime: '2026-01-15T10:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T10:30:00.000Z' as RFC3339DateTime,
          duration: 30,
        },
      ])
    })

    it('should preserve exact RFC3339 time strings', () => {
      const slot = createAppointmentSlot({
        totalOnSiteStartTime: '2026-01-15T09:30:00.000Z' as RFC3339DateTime,
        totalOnSiteEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        totalOnSiteDuration: 90,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
      })
      
      expect(result?.[0].startTime).toBe('2026-01-15T09:30:00.000Z')
      expect(result?.[0].endTime).toBe('2026-01-15T11:00:00.000Z')
    })
  })

  describe('buildAvailabilityStepData', () => {
    it('should build data with selected date and time slots', () => {
      const result = buildAvailabilityStepData({
        selectedDate: { start: '2026-01-15', end: '2026-01-15' },
        selectedTimeSlots: [{ 
          startTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        }],
      })
      
      expect(result).toEqual({
        selectedDate: { start: '2026-01-15', end: '2026-01-15' },
        selectedTimeSlots: [{ 
          startTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        }],
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
          { 
            startTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
            endTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
            duration: 120,
          },
          { 
            startTime: '2026-01-15T11:30:00.000Z' as RFC3339DateTime,
            endTime: '2026-01-15T12:00:00.000Z' as RFC3339DateTime,
            duration: 30,
          },
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
