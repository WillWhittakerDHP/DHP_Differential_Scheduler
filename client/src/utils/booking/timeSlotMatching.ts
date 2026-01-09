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
import type { TimeSlot } from '@/types/appointment'

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
    const slotTimeString = extractTimeString(slot.slotStart)
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
 * @param inspectorTimeSlotRef - Ref to update with matched inspector slot
 * @param clientTimeSlotRef - Ref to update with matched client slot
 */
export function matchLoadedTimeSlots(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[],
  inspectorTimeSlotRef: Ref<TimeSlot | null>,
  clientTimeSlotRef: Ref<TimeSlot | null>
): void {
  if (loadedSlots.length === 0 || availableSlots.length === 0) return

  // Match first slot to inspector
  if (loadedSlots.length > 0) {
    const inspectorMatch = findMatchingTimeSlot(loadedSlots[0].time, availableSlots)
    if (inspectorMatch) {
      inspectorTimeSlotRef.value = inspectorMatch
    }
  }

  // Match second slot to client (if exists)
  if (loadedSlots.length > 1) {
    const clientMatch = findMatchingTimeSlot(loadedSlots[1].time, availableSlots)
    if (clientMatch) {
      clientTimeSlotRef.value = clientMatch
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
