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
 * - Correct time slot array building with major event only
 * - Adding minor event when different from major
 * - Null returns when required data missing
 * - Data structure correctly maps inputs to output
 * - Fallback to totalTimeRange when no eventTimeRanges match
 * 
 * Dependencies:
 * - vitest for testing
 * - AppointmentSlot type from appointment types
 * 
 * SESSION: 2.1.3b - Updated to use eventTimeRanges with dynamic event name lookup
 */

import { describe, it, expect } from 'vitest'
import {
  buildSelectedTimeSlots,
  buildAvailabilityStepData,
} from '../availabilityStepData'
import type { AppointmentSlot, AppointmentShape, EventFinal, TimeRange } from '@/types/appointment'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { EventShapeEntity } from '@/types/entities'

// Mock event shape entities with attendees
const MAJOR_ATTENDEE_ID = 'major-attendee-id'
const MINOR_ATTENDEE_ID = 'minor-attendee-id'

const mockMajorEventShape: EventShapeEntity = {
  id: 'event-shape-major',
  name: 'OnSite',
  attendees: [MAJOR_ATTENDEE_ID],
}

const mockMinorEventShape: EventShapeEntity = {
  id: 'event-shape-minor',
  name: 'ClientPresent',
  attendees: [MINOR_ATTENDEE_ID],
}

// Mock availability settings with attendee configuration
const mockAvailabilitySettings: AvailabilitySettings = {
  differentialPerspectives: {
    majorAttendees: [MAJOR_ATTENDEE_ID],
    minorAttendees: [MINOR_ATTENDEE_ID],
  },
}

function createAppointmentSlot(params: {
  majorStartTime?: RFC3339DateTime
  majorEndTime?: RFC3339DateTime
  majorDuration?: number
  minorStartTime?: RFC3339DateTime
  minorEndTime?: RFC3339DateTime
  minorDuration?: number
  totalStartTime?: RFC3339DateTime
  totalEndTime?: RFC3339DateTime
  totalDuration?: number
}): AppointmentSlot {
  // Build eventFinals array based on provided params
  const eventFinals: EventFinal[] = []
  
  if (params.majorStartTime) {
    eventFinals.push({
      eventShape: mockMajorEventShape as unknown as import('@/types/events').EventShape,
      rawDuration: params.majorDuration || 120,
      roundedDuration: params.majorDuration || 120,
    })
  }
  
  if (params.minorStartTime) {
    eventFinals.push({
      eventShape: mockMinorEventShape as unknown as import('@/types/events').EventShape,
      rawDuration: params.minorDuration || 30,
      roundedDuration: params.minorDuration || 30,
    })
  }

  const shape: AppointmentShape = {
    finalizedParts: [],
    slotShape: {
      rawDuration: params.totalDuration || params.majorDuration || 0,
      roundedDuration: params.totalDuration || params.majorDuration || 0,
      eventFinals,
      rawDifferentialOffset: 0,
      roundedDifferentialOffset: 0
    }
  }

  // Build eventTimeRanges based on event shape names
  const eventTimeRanges: Record<string, TimeRange | null> = {}
  
  if (params.majorStartTime && params.majorEndTime) {
    eventTimeRanges['OnSite'] = {
      startTime: params.majorStartTime,
      endTime: params.majorEndTime,
      duration: params.majorDuration || 120,
    }
  }
  
  if (params.minorStartTime && params.minorEndTime) {
    eventTimeRanges['ClientPresent'] = {
      startTime: params.minorStartTime,
      endTime: params.minorEndTime,
      duration: params.minorDuration || 30,
    }
  }

  // Build totalTimeRange
  const totalTimeRange: TimeRange | null = params.totalStartTime && params.totalEndTime ? {
    startTime: params.totalStartTime,
    endTime: params.totalEndTime,
    duration: params.totalDuration || 120,
  } : null
  
  return {
    buttonIndex: 0,
    isAvailable: true,
    shape,
    startTime: params.majorStartTime || params.totalStartTime || '2026-01-15T10:00:00Z',
    eventTimeRanges,
    totalTimeRange,
  }
}

describe('availabilityStepData', () => {
  describe('buildSelectedTimeSlots', () => {
    it('should return null when selectedSlot is null', () => {
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: null,
        availabilitySettings: mockAvailabilitySettings,
      })
      
      expect(result).toBeNull()
    })

    it('should return null when selectedDateStart is null', () => {
      const slot = createAppointmentSlot({
        majorStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        majorEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        majorDuration: 120,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: null,
        selectedSlot: slot,
        availabilitySettings: mockAvailabilitySettings,
      })
      
      expect(result).toBeNull()
    })

    it('should return single slot when only major event provided', () => {
      const slot = createAppointmentSlot({
        majorStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        majorEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        majorDuration: 120,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
        availabilitySettings: mockAvailabilitySettings,
      })
      
      expect(result).toEqual([
        { 
          startTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        },
      ])
    })

    it('should return single slot when minor equals major startTime', () => {
      const slot = createAppointmentSlot({
        majorStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        majorEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        majorDuration: 120,
        minorStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        minorEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        minorDuration: 120,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
        availabilitySettings: mockAvailabilitySettings,
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

    it('should return two slots when minor differs from major', () => {
      const slot = createAppointmentSlot({
        majorStartTime: '2026-01-15T09:00:00.000Z' as RFC3339DateTime,
        majorEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        majorDuration: 120,
        minorStartTime: '2026-01-15T10:00:00.000Z' as RFC3339DateTime,
        minorEndTime: '2026-01-15T10:30:00.000Z' as RFC3339DateTime,
        minorDuration: 30,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
        availabilitySettings: mockAvailabilitySettings,
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
        majorStartTime: '2026-01-15T09:30:00.000Z' as RFC3339DateTime,
        majorEndTime: '2026-01-15T11:00:00.000Z' as RFC3339DateTime,
        majorDuration: 90,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
        availabilitySettings: mockAvailabilitySettings,
      })
      
      expect(result?.[0].startTime).toBe('2026-01-15T09:30:00.000Z')
      expect(result?.[0].endTime).toBe('2026-01-15T11:00:00.000Z')
    })

    it('should fallback to totalTimeRange when no settings provided', () => {
      const slot = createAppointmentSlot({
        totalStartTime: '2026-01-15T14:00:00.000Z' as RFC3339DateTime,
        totalEndTime: '2026-01-15T16:00:00.000Z' as RFC3339DateTime,
        totalDuration: 120,
      })
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
        // No availabilitySettings - should fallback to totalTimeRange
      })
      
      expect(result).toEqual([
        { 
          startTime: '2026-01-15T14:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T16:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        },
      ])
    })

    it('should fallback to totalTimeRange when no eventTimeRanges match', () => {
      // Create slot with eventTimeRanges that don't match the settings
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape: {
          finalizedParts: [],
          slotShape: {
            rawDuration: 120,
            roundedDuration: 120,
            eventFinals: [],
            rawDifferentialOffset: 0,
            roundedDifferentialOffset: 0
          }
        },
        startTime: '2026-01-15T14:00:00.000Z',
        eventTimeRanges: {
          'SomeOtherEvent': {
            startTime: '2026-01-15T14:00:00.000Z' as RFC3339DateTime,
            endTime: '2026-01-15T16:00:00.000Z' as RFC3339DateTime,
            duration: 120,
          }
        },
        totalTimeRange: {
          startTime: '2026-01-15T14:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T16:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        },
      }
      
      const result = buildSelectedTimeSlots({
        selectedDateStart: '2026-01-15',
        selectedSlot: slot,
        availabilitySettings: mockAvailabilitySettings,
      })
      
      // Should fallback to totalTimeRange
      expect(result).toEqual([
        { 
          startTime: '2026-01-15T14:00:00.000Z' as RFC3339DateTime,
          endTime: '2026-01-15T16:00:00.000Z' as RFC3339DateTime,
          duration: 120,
        },
      ])
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
      
      expect(result.selectedDate).not.toBe(inputDate)
      expect(result.selectedDate).toEqual(inputDate)
    })
  })
})
