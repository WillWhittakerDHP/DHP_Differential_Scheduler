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

/**
 * Extract time string (HH:mm) from RFC3339 datetime format
 * 
 * LEARNING: Extracts time portion from RFC3339 datetime for matching (UI-boundary function)
 * WHY: Time slot matching needs to compare times, but RFC3339 is UTC - convert to local for matching
 * PATTERN: Use useLocalTime composable to extract local HH:mm from RFC3339
 * 
 * NOTE: This function is used for matching time slots, not display.
 * For display formatting, use useLocalTime composable directly.
 * 
 * @param value - RFC3339 datetime string or Date object
 * @returns Time string in HH:mm format (local timezone), or null if invalid
 */
export function extractTimeString(value: string | Date): string | null {
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
    // WHY: Centralizes all local time conversions at UI boundary
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
 * @param timeString - Time to match in any format (will be normalized to HH:mm)
 * @param availableSlots - Array of available TimeSlot objects
 * @returns Matching TimeSlot or undefined if no match found
 */
export function findMatchingTimeSlot(
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

/**
 * Loaded time slot structure (from saved appointments)
 * LEARNING: Uses startTime (RFC3339) to match SelectedTimeSlot format
 * WHY: SelectedTimeSlot now uses startTime/endTime format, matching code should use same format
 */
export interface LoadedTimeSlot {
  startTime: string  // RFC3339 datetime string
  endTime?: string   // Optional RFC3339 datetime string (for future use)
}

/**
 * Match loaded time slots to available time slots and update refs
 * 
 * LEARNING: Enables validation to pass when appointment is loaded with time slots
 * WHY: When editing an appointment, we need to restore the previously selected time slots
 * PATTERN: Matches loaded times to available slots, updates refs for inspector/client slots
 * 
 * Algorithm:
 * 1. First loaded slot → inspector time slot
 * 2. Second loaded slot (if exists) → client time slot
 * 
 * @param loadedSlots - Array of loaded time slots from saved appointment
 * @param availableSlots - Array of currently available TimeSlot objects
 * @param inspectorAppointmentSlotRef - Ref to update with matched inspector appointment slot
 * @param clientAppointmentSlotRef - Ref to update with matched client appointment slot
 */
export function matchLoadedTimeSlots(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[],
  inspectorAppointmentSlotRef: Ref<TimeSlot | null>,
  clientAppointmentSlotRef: Ref<TimeSlot | null>
): void {
  if (loadedSlots.length === 0 || availableSlots.length === 0) return

  // Match first slot to inspector
  if (loadedSlots.length > 0) {
    const inspectorMatch = findMatchingTimeSlot(loadedSlots[0].startTime, availableSlots)
    if (inspectorMatch) {
      inspectorAppointmentSlotRef.value = inspectorMatch
    }
  }

  // Match second slot to client (if exists)
  if (loadedSlots.length > 1) {
    const clientMatch = findMatchingTimeSlot(loadedSlots[1].startTime, availableSlots)
    if (clientMatch) {
      clientAppointmentSlotRef.value = clientMatch
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
 * @returns Object with matched inspector and client slots (or null if no match)
 */
export function matchLoadedTimeSlotsImmutable(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[]
): { inspectorSlot: TimeSlot | null; clientSlot: TimeSlot | null } {
  if (loadedSlots.length === 0 || availableSlots.length === 0) {
    return { inspectorSlot: null, clientSlot: null }
  }

  const inspectorSlot = loadedSlots.length > 0
    ? findMatchingTimeSlot(loadedSlots[0].startTime, availableSlots) ?? null
    : null

  const clientSlot = loadedSlots.length > 1
    ? findMatchingTimeSlot(loadedSlots[1].startTime, availableSlots) ?? null
    : null

  return { inspectorSlot, clientSlot }
}

/**
 * Find AppointmentSlot by orderIndex
 * 
 * LEARNING: Locates AppointmentSlot at a specific normalized position
 * WHY: AppointmentSlots are normalized by orderIndex for consistent UI positioning
 * PATTERN: Find AppointmentSlot with matching orderIndex
 * 
 * @param appointmentSlots - Array of AppointmentSlot objects
 * @param orderIndex - Normalized order index to find
 * @returns Matching AppointmentSlot or undefined if not found
 */
export function findAppointmentSlotByOrderIndex(
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
 * @param timeBasis - Time perspective ('inspector' | 'client' | 'nonDifferential')
 * @returns Matching TimeSlot or undefined if no match found
 */
export function findMatchingAppointmentSlot(
  loadedSlot: LoadedTimeSlot,
  appointmentSlots: AppointmentSlots,
  orderIndex: number,
  timeBasis: 'inspector' | 'client' | 'nonDifferential'
): TimeSlot | TimeRange | undefined {
  const appointmentSlot = findAppointmentSlotByOrderIndex(appointmentSlots, orderIndex)
  if (!appointmentSlot) return undefined

  // LEARNING: Extract TimeSlot or TimeRange based on time perspective
  // WHY: Different perspectives show different times at the same position
  // PATTERN: Prefer TimeSlot (clientPresentation, dataCollection), fallback to TimeRange (totalTime, totalOnSite)
  let slot: TimeSlot | TimeRange | null = null
  
  if (timeBasis === 'client') {
    slot = appointmentSlot.clientPresentation || appointmentSlot.totalTime
  } else {
    slot = appointmentSlot.dataCollection || appointmentSlot.totalTime || appointmentSlot.totalOnSite
  }

  if (!slot) return undefined

  // LEARNING: Verify the slot time matches loaded time
  // WHY: Ensure we're matching the correct slot even when position matches
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
 * @param loadedSlots - Array of loaded time slots from saved appointment
 * @param appointmentSlots - Array of AppointmentSlot objects
 * @param inspectorAppointmentSlotRef - Ref to update with matched inspector appointment slot
 * @param clientAppointmentSlotRef - Ref to update with matched client appointment slot
 * @param timeBasis - Current time perspective ('inspector' | 'client' | 'nonDifferential')
 */
export function matchLoadedTimeSlotsToAppointmentSlots(
  loadedSlots: LoadedTimeSlot[],
  appointmentSlots: AppointmentSlots,
  inspectorAppointmentSlotRef: Ref<TimeSlot | TimeRange | null>,
  clientAppointmentSlotRef: Ref<TimeSlot | TimeRange | null>,
  timeBasis: 'inspector' | 'client' | 'nonDifferential' = 'nonDifferential'
): void {
  if (loadedSlots.length === 0 || appointmentSlots.length === 0) return

  // LEARNING: Match first slot to inspector (orderIndex 0)
  // WHY: First loaded slot represents inspector start time
  // PATTERN: Find AppointmentSlot at orderIndex 0, extract inspector perspective TimeSlot
  if (loadedSlots.length > 0) {
    const inspectorMatch = findMatchingAppointmentSlot(
      loadedSlots[0],
      appointmentSlots,
      0,
      timeBasis === 'nonDifferential' ? 'inspector' : timeBasis
    )
    if (inspectorMatch) {
      inspectorAppointmentSlotRef.value = inspectorMatch
    }
  }

  // LEARNING: Match second slot to client (orderIndex 0 or 1, depending on structure)
  // WHY: Second loaded slot represents client start time (if different from inspector)
  // PATTERN: Try orderIndex 0 first (same position, different time), then orderIndex 1
  if (loadedSlots.length > 1) {
    // Try matching at same orderIndex first (differential - same position, different time)
    let clientMatch = findMatchingAppointmentSlot(
      loadedSlots[1],
      appointmentSlots,
      0,
      'client'
    )
    
    // If no match at orderIndex 0, try orderIndex 1 (different position)
    if (!clientMatch && appointmentSlots.length > 1) {
      clientMatch = findMatchingAppointmentSlot(
        loadedSlots[1],
        appointmentSlots,
        1,
        'client'
      )
    }
    
    if (clientMatch) {
      clientAppointmentSlotRef.value = clientMatch
    }
  }
}

