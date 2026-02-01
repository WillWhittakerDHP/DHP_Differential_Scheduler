/**
 * Time Slot Matching Utilities
 * 
 * LEARNING: Shared utilities for matching loaded time slots to available slots
 * WHY: Extracted from useAvailabilityDefaults and useAvailabilityLogic to eliminate duplication
 * PATTERN: Pure functions that can be used by any composable needing time slot matching
 * 
 * Used by:
 * - useAvailabilityDefaults (for populating state from loaded appointments)
 * - useAvailabilityLogic (for matching API time slots)
 */

import type { Ref } from 'vue'
import type { TimeSlot, TimeRange, AppointmentSlots } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import { rfc3339ToLocalHHmm } from '@/composables/useLocalTime'

function extractTimeString(value: string | Date): string | null {
  try {
    // LEARNING: Only accept RFC3339 format (ISO timestamp)
    // WHY: HH:mm format should only exist at UI boundary, not in business logic
    // PATTERN: Convert to RFC3339 string if needed, then use useLocalTime for extraction
    let rfc3339: RFC3339DateTime
    
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return null
      }
      rfc3339 = value.toISOString() as RFC3339DateTime
    } else if (typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return null
      }
      rfc3339 = value as RFC3339DateTime
    } else {
      return null
    }
    
    // LEARNING: Use useLocalTime composable for local time extraction
    // PATTERN: Use rfc3339ToLocalHHmm from useLocalTime
    return rfc3339ToLocalHHmm(rfc3339)
  } catch {
    return null
  }
}

/**
 * Find a time slot that matches a given time string
 * 
 * LEARNING: Searches available slots for a matching time
 * WHY: Need to map loaded appointment times to available TimeSlot objects
 * PATTERN: Pure function that returns matching slot or undefined
 * 
 * LEARNING: Function used internally - not exported as it's not part of public API
 * WHY: This function is only used within this file by other functions
 * 
 * @param timeString - Time to match in any format (will be normalized to HH:mm)
 * @param availableSlots - Array of available TimeSlot objects
 * @returns Matching TimeSlot or undefined if no match found
 */
function findMatchingTimeSlot(
  timeString: string,
  availableSlots: TimeSlot[]
): TimeSlot | undefined {
  const normalizedTime = extractTimeString(timeString)
  if (!normalizedTime) return undefined
  
  return availableSlots.find(slot => {
    const slotTimeString = extractTimeString(slot.startTime)
    return slotTimeString === normalizedTime
  })
}

export interface LoadedTimeSlot {
  startTime: string  // RFC3339 datetime string
  endTime?: string   // Optional RFC3339 datetime string (for future use)
}

/**
 * Match loaded time slots to available time slots and update refs
 * 
 * LEARNING: Enables validation to pass when appointment is loaded with time slots
 * WHY: When editing an appointment, we need to restore the previously selected time slots
 * PATTERN: Matches loaded times to available slots, updates refs for major/minor slots
 * 
 * Algorithm:
 * 1. First loaded slot → major time slot (legacy: inspector)
 * 2. Second loaded slot (if exists) → minor time slot (legacy: client)
 * 
 * @param loadedSlots - Array of loaded time slots from saved appointment
 * @param availableSlots - Array of currently available TimeSlot objects
 * @param majorAppointmentSlotRef - Ref to update with matched major appointment slot
 * @param minorAppointmentSlotRef - Ref to update with matched minor appointment slot
 */
export function matchLoadedTimeSlots(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[],
  majorAppointmentSlotRef: Ref<TimeSlot | null>,
  minorAppointmentSlotRef: Ref<TimeSlot | null>
): void {
  if (loadedSlots.length === 0 || availableSlots.length === 0) return

  if (loadedSlots.length > 0) {
    const majorMatch = findMatchingTimeSlot(loadedSlots[0].startTime, availableSlots)
    if (majorMatch) {
      majorAppointmentSlotRef.value = majorMatch
    }
  }

  if (loadedSlots.length > 1) {
    const minorMatch = findMatchingTimeSlot(loadedSlots[1].startTime, availableSlots)
    if (minorMatch) {
      minorAppointmentSlotRef.value = minorMatch
    }
  }
}

/**
 * Match loaded time slots and return results (non-mutating version)
 * 
 * LEARNING: Pure function version for cases where you don't want to mutate refs
 * WHY: Some use cases prefer immutable returns over ref mutation
 * PATTERN: Returns matched slots instead of mutating refs
 * 
 * @param loadedSlots - Array of loaded time slots from saved appointment
 * @param availableSlots - Array of currently available TimeSlot objects
 * @returns Object with matched major and minor slots (or null if no match)
 */
export function matchLoadedTimeSlotsImmutable(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[]
): { majorSlot: TimeSlot | null; minorSlot: TimeSlot | null } {
  if (loadedSlots.length === 0 || availableSlots.length === 0) {
    return { majorSlot: null, minorSlot: null }
  }

  const majorSlot = loadedSlots.length > 0
    ? findMatchingTimeSlot(loadedSlots[0].startTime, availableSlots) ?? null
    : null

  const minorSlot = loadedSlots.length > 1
    ? findMatchingTimeSlot(loadedSlots[1].startTime, availableSlots) ?? null
    : null

  return { majorSlot, minorSlot }
}

/**
 * Find AppointmentSlot by orderIndex
 * 
 * LEARNING: Locates AppointmentSlot at a specific normalized position
 * WHY: AppointmentSlots are normalized by orderIndex for consistent UI positioning
 * PATTERN: Find AppointmentSlot with matching orderIndex
 * 
 * LEARNING: Function used internally - not exported as it's not part of public API
 * WHY: This function is only used within this file by other functions
 * 
 * @param appointmentSlots - Array of AppointmentSlot objects
 * @param orderIndex - Normalized order index to find
 * @returns Matching AppointmentSlot or undefined if not found
 */
function findAppointmentSlotByOrderIndex(
  appointmentSlots: AppointmentSlots,
  orderIndex: number
): import('@/types/appointment').AppointmentSlot | undefined {
  return appointmentSlots.find(slot => slot.orderIndex === orderIndex)
}

/**
 * Match loaded time slot to AppointmentSlot by orderIndex
 * 
 * LEARNING: Matches loaded time slot to AppointmentSlot based on normalized position
 * WHY: For AppointmentSlots, matching is by position (orderIndex) rather than exact time
 * PATTERN: Find AppointmentSlot at orderIndex, extract TimeSlot based on perspective
 * 
 * @param loadedSlot - Loaded time slot from saved appointment
 * @param appointmentSlots - Array of AppointmentSlot objects
 * @param orderIndex - Normalized order index to match
 * @param timeBasis - Time perspective ('major' | 'minor' | 'nonDifferential')
 * @returns Matching TimeSlot or undefined if no match found
 */
export function findMatchingAppointmentSlot(
  loadedSlot: LoadedTimeSlot,
  appointmentSlots: AppointmentSlots,
  orderIndex: number,
  timeBasis: 'major' | 'minor' | 'nonDifferential'
): TimeSlot | TimeRange | undefined {
  const appointmentSlot = findAppointmentSlotByOrderIndex(appointmentSlots, orderIndex)
  if (!appointmentSlot) return undefined

  // PATTERN: Use eventTimeRanges lookup by event name (configured via availabilitySettings)
  let slot: TimeRange | null = null
  
  if (timeBasis === 'minor') {
    const minorEventName = 'Minor'
    slot = appointmentSlot.eventTimeRanges?.[minorEventName] || appointmentSlot.totalTimeRange
  } else {
    const majorEventName = 'Major'
    slot = appointmentSlot.eventTimeRanges?.[majorEventName] || appointmentSlot.totalTimeRange
  }

  if (!slot) return undefined

  // PATTERN: Compare time strings
  const loadedTimeString = extractTimeString(loadedSlot.startTime)
  const slotTimeString = extractTimeString(slot.startTime)
  
  return loadedTimeString === slotTimeString ? slot : undefined
}

/**
 * Match loaded time slots to AppointmentSlots by orderIndex
 * 
 * LEARNING: Matches loaded slots to AppointmentSlots based on normalized positions
 * WHY: For AppointmentSlots structure, matching is by orderIndex (position) rather than exact time
 * PATTERN: Match first loaded slot to first AppointmentSlot (orderIndex 0), second to second, etc.
 * 
 * LEARNING: Function not exported - unused in codebase
 * WHY: This function is not currently used, kept for potential future use
 * NOTE: If needed in future, uncomment export
 * 
 * @param loadedSlots - Array of loaded time slots from saved appointment
 * @param appointmentSlots - Array of AppointmentSlot objects
 * @param majorAppointmentSlotRef - Ref to update with matched major appointment slot
 * @param minorAppointmentSlotRef - Ref to update with matched minor appointment slot
 * @param timeBasis - Current time perspective ('major' | 'minor' | 'nonDifferential')
 */
function matchLoadedTimeSlotsToAppointmentSlots(
  loadedSlots: LoadedTimeSlot[],
  appointmentSlots: AppointmentSlots,
  majorAppointmentSlotRef: Ref<TimeSlot | TimeRange | null>,
  minorAppointmentSlotRef: Ref<TimeSlot | TimeRange | null>,
  timeBasis: 'major' | 'minor' | 'nonDifferential' = 'nonDifferential'
): void {
  if (loadedSlots.length === 0 || appointmentSlots.length === 0) return

  // PATTERN: Find AppointmentSlot at orderIndex 0, extract major perspective TimeSlot
  if (loadedSlots.length > 0) {
    const majorMatch = findMatchingAppointmentSlot(
      loadedSlots[0],
      appointmentSlots,
      0,
      timeBasis === 'nonDifferential' ? 'major' : timeBasis
    )
    if (majorMatch) {
      majorAppointmentSlotRef.value = majorMatch
    }
  }

  // PATTERN: Try orderIndex 0 first (same position, different time), then orderIndex 1
  if (loadedSlots.length > 1) {
    let minorMatch = findMatchingAppointmentSlot(
      loadedSlots[1],
      appointmentSlots,
      0,
      'minor'
    )
    
    if (!minorMatch && appointmentSlots.length > 1) {
      minorMatch = findMatchingAppointmentSlot(
        loadedSlots[1],
        appointmentSlots,
        1,
        'minor'
      )
    }
    
    if (minorMatch) {
      minorAppointmentSlotRef.value = minorMatch
    }
  }
}

