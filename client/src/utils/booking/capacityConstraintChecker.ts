/**
 * Capacity Constraint Checker
 * 
 * LEARNING: Handles capacity constraint checking (daily, calendar week, rolling week)
 * WHY: Separated from slotAvailabilityManager to reduce complexity and improve maintainability
 * PATTERN: Pure utility functions - no side effects
 */

import type { TimeSlot } from '@/types/appointment'
import type { CapacityConstraint } from '@shared/types/availabilityTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('capacityConstraintChecker')

/**
 * Capacity key parts for building unique keys
 * LEARNING: Structured representation of capacity constraint keys
 * WHY: Enables efficient batching and caching of capacity checks
 * PATTERN: Type-safe key parts that can be stringified
 */
interface CapacityKeyParts {
  type: string
  date: string
  direction?: 'past' | 'future' | 'centered'
}

/**
 * Extract date string (YYYY-MM-DD) from RFC3339 datetime
 * LEARNING: Utility for extracting date component from RFC3339 strings
 * WHY: Capacity keys use date strings, not full timestamps
 * PATTERN: Extract date part before 'T' separator
 * 
 * @param rfc3339 - RFC3339 datetime string
 * @returns Date string in YYYY-MM-DD format
 */
function extractDateFromRFC3339(rfc3339: string): string {
  return rfc3339.split('T')[0]
}

/**
 * Build capacity key parts from constraint and slot date
 * LEARNING: Creates structured key parts for capacity constraint
 * WHY: Enables efficient batching and caching of capacity checks
 * PATTERN: Extract date, include direction for rolling week constraints
 * 
 * @param constraint - Capacity constraint
 * @param slotDate - Slot date string (YYYY-MM-DD)
 * @returns Capacity key parts
 */
function buildCapacityKey(constraint: CapacityConstraint, slotDate: string): CapacityKeyParts {
  return {
    type: constraint.type,
    date: slotDate,
    direction: constraint.type === 'rollingWeek' ? (constraint.direction || 'past') : undefined
  }
}

/**
 * Convert capacity key parts to string for Map usage
 * LEARNING: Single conversion point for key stringification
 * WHY: Ensures consistent string format across all usage
 * PATTERN: Convert structured parts to string only when needed for Map keys
 * 
 * @param parts - Capacity key parts to convert
 * @returns String representation of capacity key
 */
function capacityKeyToString(parts: CapacityKeyParts): string {
  if (parts.direction) {
    return `${parts.type}:${parts.date}:${parts.direction}`
  }
  return `${parts.type}:${parts.date}`
}

/**
 * Merge violations with existing flexible violations
 * LEARNING: Centralized violation merging ensures consistency
 * WHY: Single source of truth for violation handling
 * PATTERN: Pure function that merges and formats violations
 * 
 * @param existing - Existing violations array (may be undefined)
 * @param newViolations - New violations to merge
 * @param passes - Whether the constraint check passed (default: true)
 * @returns Object with hasFlexibleViolations flag and merged violations array
 */
function mergeViolations(
  existing: string[] | undefined,
  newViolations: string[],
  _passes: boolean = true
): { hasFlexibleViolations: boolean; flexibleViolations: string[] | undefined } {
  // PATTERN: Always merge violations for debugging overlay, regardless of pass/fail
  // WHY: Even hard failures should record their violation type for visibility
  const allViolations = [...(existing || []), ...newViolations]
  return {
    hasFlexibleViolations: allViolations.length > 0,
    flexibleViolations: allViolations.length > 0 ? allViolations : undefined
  }
}

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
 * This function applies capacity constraints using pre-computed capacity hours
 * from the server orchestrator. This supports asynchronous appointment creation
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
 * @param capacityConstraints - Optional array of capacity constraints (daily, calendar week, rolling week)
 * @param precomputedCapacityHours - Pre-computed capacity hours by key from server orchestrator
 * @returns Slots with capacity filters applied
 */
export function applyCapacityFilters(
  slots: TimeSlot[],
  duration: number,
  capacityConstraints?: CapacityConstraint[],
  precomputedCapacityHours?: Record<string, number>
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

  // Filter constraints to only active ones
  const activeCapacityConstraints = capacityConstraints.filter(c => c.enforcement !== 'off')
  if (activeCapacityConstraints.length === 0) {
    return slots
  }

  // PATTERN: Build map of slot startTime to array of key strings during batching phase
  const slotKeysMap = new Map<string, string[]>()
  const capacityKeyPartsSet = new Set<string>()
  
  // PATTERN: Reduce slots to Map, creating new arrays instead of mutating
  availableSlots.reduce((map, slot) => {
    const slotDate = extractDateFromRFC3339(slot.startTime)
    
    // PATTERN: Map constraints to key strings, then process each key
    const slotKeys = activeCapacityConstraints.map((constraint) => {
      const keyParts = buildCapacityKey(constraint, slotDate)
      const keyString = capacityKeyToString(keyParts)
      capacityKeyPartsSet.add(keyString)
      return keyString
    })
    
    map.set(slot.startTime, slotKeys)
    return map
  }, slotKeysMap)

  // Phase 6: Use pre-computed capacity hours from server orchestrator (required)
  // WHY: All capacity calculations happen server-side, eliminating async operations
  // PATTERN: Synchronous lookup from pre-computed data structure
  if (!precomputedCapacityHours) {
    // Pre-computed capacity hours are required - return slots without capacity filtering
    // This should not happen in normal flow - orchestrator always provides capacity hours
    logger.warn('[applyCapacityFilters] Pre-computed capacity hours not provided - skipping capacity checks')
    return slots
  }
  
  const capacityHoursByKey = new Map<string, number>()
  for (const keyString of capacityKeyPartsSet) {
    const hours = precomputedCapacityHours[keyString] ?? 0
    capacityHoursByKey.set(keyString, hours)
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
        const constraint = activeCapacityConstraints[i]
        if (constraint.enforcement !== 'hard') return false
        const currentHours = capacityHoursByKey.get(keyString) || 0
        return currentHours + slotDurationHours > constraint.maxHours
      })

      if (hardFailure) {
        return { passes: false, violations: [] }
      }

      // Check flexible constraints - block if limit already exceeded
      const flexibleBlocked = slotKeys.some((keyString, i) => {
        const constraint = activeCapacityConstraints[i]
        if (constraint.enforcement !== 'flexible') return false
        const currentHours = capacityHoursByKey.get(keyString) || 0
        return currentHours >= constraint.maxHours
      })

      if (flexibleBlocked) {
        return { passes: false, violations: [] }
      }

      const violations = slotKeys
        .map((keyString, i) => {
          const constraint = activeCapacityConstraints[i]
          if (constraint.enforcement !== 'flexible') return null
          const currentHours = capacityHoursByKey.get(keyString) || 0
          if (currentHours + slotDurationHours > constraint.maxHours) {
            return `capacity.${constraint.type}`
          }
          return null
        })
        .filter((v): v is string => v !== null)

      return { passes: true, violations }
    }

    const { passes, violations } = checkCapacityConstraints()

    const mergedViolations = mergeViolations(slot.flexibleViolations, violations, passes)

    return {
      ...slot,
      isAvailable: slot.isAvailable && passes,
      hasFlexibleViolations: mergedViolations.hasFlexibleViolations || slot.hasFlexibleViolations,
      flexibleViolations: mergedViolations.flexibleViolations
    }
  })

  return slotsWithCapacity
}
