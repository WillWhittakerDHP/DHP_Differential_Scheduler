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

/**
 * Extract time string (HH:mm) from various time formats
 * 
 * LEARNING: Normalizes different time formats to HH:mm for comparison
 * WHY: Loaded appointments may have time in different formats (HH:mm, HH:mm:ss, ISO timestamp)
 * PATTERN: Pure function that handles multiple input formats
 * 
 * @param value - Time value as string (HH:mm, HH:mm:ss, or ISO timestamp) or Date object
 * @returns Time string in HH:mm format, or null if invalid
 */
export function extractTimeString(value: string | Date): string | null {
  try {
    if (typeof value === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
      // Already in HH:mm or HH:mm:ss format, extract just HH:mm
      // Use split to handle single-digit hours correctly (e.g., "9:30:45" -> "9:30")
      const parts = value.split(':')
      return `${parts[0]}:${parts[1]}`
    } else {
      // Assume it's an ISO timestamp, extract time portion in local time
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return null
      }
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
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
 */
export interface LoadedTimeSlot {
  time: string
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
    const inspectorMatch = findMatchingTimeSlot(loadedSlots[0].time, availableSlots)
    if (inspectorMatch) {
      inspectorAppointmentSlotRef.value = inspectorMatch
    }
  }

  // Match second slot to client (if exists)
  if (loadedSlots.length > 1) {
    const clientMatch = findMatchingTimeSlot(loadedSlots[1].time, availableSlots)
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
    ? findMatchingTimeSlot(loadedSlots[0].time, availableSlots) ?? null
    : null

  const clientSlot = loadedSlots.length > 1
    ? findMatchingTimeSlot(loadedSlots[1].time, availableSlots) ?? null
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
  const loadedTimeString = extractTimeString(loadedSlot.time)
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

/**
 * @deprecated Use findAppointmentSlotByOrderIndex instead
 */
export function findAppointmentTimeByOrderIndex(
  appointmentSlots: AppointmentSlots,
  orderIndex: number
): import('@/types/appointment').AppointmentSlot | undefined {
  return findAppointmentSlotByOrderIndex(appointmentSlots, orderIndex)
}

/**
 * @deprecated Use findMatchingAppointmentSlot instead
 */
export function findMatchingAppointmentTimeSlot(
  loadedSlot: LoadedTimeSlot,
  appointmentSlots: AppointmentSlots,
  orderIndex: number,
  timeBasis: 'inspector' | 'client' | null
): TimeSlot | TimeRange | undefined {
  return findMatchingAppointmentSlot(
    loadedSlot,
    appointmentSlots,
    orderIndex,
    timeBasis === null ? 'nonDifferential' : timeBasis
  )
}

/**
 * @deprecated Use matchLoadedTimeSlotsToAppointmentSlots instead
 */
export function matchLoadedTimeSlotsToAppointmentTimes(
  loadedSlots: LoadedTimeSlot[],
  appointmentSlots: AppointmentSlots,
  inspectorAppointmentSlotRef: Ref<TimeSlot | TimeRange | null>,
  clientAppointmentSlotRef: Ref<TimeSlot | TimeRange | null>,
  timeBasis: 'inspector' | 'client' | null = null
): void {
  return matchLoadedTimeSlotsToAppointmentSlots(
    loadedSlots,
    appointmentSlots,
    inspectorAppointmentSlotRef,
    clientAppointmentSlotRef,
    timeBasis === null ? 'nonDifferential' : timeBasis
  )
}
