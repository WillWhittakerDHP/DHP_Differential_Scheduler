/**
 * Capacity Constraint Checker
 * 
 * LEARNING: Handles capacity constraint checking (daily, calendar week, rolling week)
 * WHY: Separated from slotAvailabilityOrchestrator to reduce complexity and improve maintainability
 * PATTERN: Pure utility functions - no side effects
 */

import type { TimeSlot } from '@/types/appointment'
import type { CapacityConstraint } from '@shared/types/availabilityTypes'
import {
  extractDateFromRFC3339,
  buildCapacityKey,
  capacityKeyToString
} from '@shared/utils/capacityKeyUtils'
import { mergeViolations } from '@shared/utils/constraintUtils'


/**
 * Apply capacity filters to slots
 * LEARNING: Checks capacity limits for each slot and updates availability flag
 * WHY: Separates capacity checking from busy period checking
 * PATTERN: Batch capacity checks by unique date/week keys to reduce API calls
 * 
 * ============================================================================
 * ASYNCHRONOUS APPOINTMENT CREATION WORKFLOW SUPPORT
 * ============================================================================
 * 
 * This function applies capacity constraints using enriched capacity constraints
 * with scheduledHours from the server. This supports asynchronous appointment creation
 * workflows where appointments exist in the database with 'submitted' or 'confirmed'
 * status before being synced to Google Calendar.
 * 
 * APPOINTMENT STATUS WORKFLOW:
 * - 'started': Non-quote mode appointment creation in progress (NOT COUNTED)
 * - 'submitted': Submitted through app, awaiting confirmation (COUNTED)
 * - 'confirmed': Submitted and confirmed (COUNTED)
 * 
 * SEPARATION OF CONCERNS:
 * - Free-busy checking: Uses Google Calendar API to check external calendar events
 * - Capacity checking: Uses database appointments (this function) to check internal workflow state
 * 
 * WHY BOTH ARE NEEDED:
 * - Free-busy blocks slots based on calendar events (external, already synced)
 * - Capacity blocks slots based on database appointments (internal, including pending/confirmed but not-yet-synced)
 * 
 * @param slots - Array of slots to check (already marked with busy period availability)
 * @param duration - Appointment duration in minutes
 * @param capacityConstraints - Optional array of capacity constraints (daily, calendar week, rolling week), enriched with scheduledHours
 * @returns Slots with capacity filters applied
 */
export function applyCapacityFilters(
  slots: TimeSlot[],
  duration: number,
  capacityConstraints?: CapacityConstraint[]
): TimeSlot[] {
  // If no capacity constraints, return slots as-is
  if (!capacityConstraints || capacityConstraints.length === 0) {
    return slots
  }

  // PATTERN: Collect unique capacity keys, fetch hours once per key, apply cached results to all slots
  
  const availableSlots = slots.filter(slot => slot.isAvailable)
  if (availableSlots.length === 0) {
    return slots
  }

  // PATTERN: Build map of slot startTime to array of key strings during batching phase
  const slotKeysMap = new Map<string, string[]>()
  
  // PATTERN: Use for...of for side effects (populating map)
  for (const slot of availableSlots) {
    const slotDate = extractDateFromRFC3339(slot.startTime)
    
    // PATTERN: Map constraints to key strings
    const slotKeys = capacityConstraints.map((constraint) => {
      const keyParts = buildCapacityKey(constraint, slotDate)
      return capacityKeyToString(keyParts)
    })
    
    slotKeysMap.set(slot.startTime, slotKeys)
  }

  const slotDurationHours = duration / 60
  const slotsWithCapacity = slots.map((slot) => {
    if (!slot.isAvailable) {
      return slot
    }

    // PATTERN: Look up keys from slotKeysMap instead of rebuilding them
    const slotKeys = slotKeysMap.get(slot.startTime) || []

    /**
     * LEARNING: Extract constraint checking logic to pure function
     * WHY: Separates constraint evaluation from violation collection
     * PATTERN: Pure function returns { passes, violations }
     */
    const checkCapacityConstraints = (): { passes: boolean; violations: string[] } => {
      const hardFailure = slotKeys.some((keyString, i) => {
        const constraint = capacityConstraints[i]
        if (constraint.enforcement !== 'hard') return false
        const currentHours = constraint.scheduledHours?.[keyString] ?? 0
        return currentHours + slotDurationHours > constraint.maxHours
      })

      if (hardFailure) {
        return { passes: false, violations: [] }
      }

      // Check flexible constraints - block if limit already exceeded
      const flexibleBlocked = slotKeys.some((keyString, i) => {
        const constraint = capacityConstraints[i]
        if (constraint.enforcement !== 'flexible') return false
        const currentHours = constraint.scheduledHours?.[keyString] ?? 0
        return currentHours >= constraint.maxHours
      })

      if (flexibleBlocked) {
        return { passes: false, violations: [] }
      }

      const violations = slotKeys
        .map((keyString, i) => {
          const constraint = capacityConstraints[i]
          if (constraint.enforcement !== 'flexible') return null
          const currentHours = constraint.scheduledHours?.[keyString] ?? 0
          if (currentHours + slotDurationHours > constraint.maxHours) {
            return `capacity.${constraint.type}`
          }
          return null
        })
        .filter((v): v is string => v !== null)

      return { passes: true, violations }
    }

    const { passes, violations } = checkCapacityConstraints()

    const mergedViolations = mergeViolations(slot.flexibleViolations, violations)

    return {
      ...slot,
      isAvailable: slot.isAvailable && passes,
      hasFlexibleViolations: mergedViolations.hasFlexibleViolations || slot.hasFlexibleViolations,
      flexibleViolations: mergedViolations.flexibleViolations
    }
  })

  return slotsWithCapacity
}
