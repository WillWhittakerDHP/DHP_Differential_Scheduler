/**
 * Shared Capacity Key Utilities
 * 
 * WHY: Ensures key format consistency between producer (server) and consumer (client)
 * PATTERN: Shared utilities alongside shared types
 * 
 * Phase: Constraint DRY Refactor
 * - Moved from client/src/utils/booking/capacityConstraintChecker.ts
 * - Moved from server/src/services/capacityComputer.ts
 */

import type { CapacityConstraint } from '../types/availabilityTypes.js'
import type { RollingWeekDirection } from '../types/availabilityTypes.js'
import { TIME_BASIS_TYPES } from '../constants/constraintConstants.js'

/**
 * Capacity key parts structure
 * WHY: Allows type-safe key building before converting to string
 * PATTERN: Interface with type, date, and optional direction
 */
export interface CapacityKeyParts {
  type: 'daily' | 'calendarWeek' | 'rollingWeek'
  date: string  // YYYY-MM-DD
  direction?: RollingWeekDirection  // Only for rollingWeek
}

/**
 * Extract date string (YYYY-MM-DD) from RFC3339 datetime
 * WHY: Capacity keys use date-only strings, not full datetime
 * PATTERN: Simple string manipulation
 * 
 * @param rfc3339DateTime - RFC3339 datetime string
 * @returns Date string in YYYY-MM-DD format
 */
export function extractDateFromRFC3339(rfc3339DateTime: string): string {
  return rfc3339DateTime.split('T')[0]
}

/**
 * Build capacity key parts for a constraint and date
 * WHY: Single source of truth for capacity key format
 * PATTERN: Pure function that generates structured key parts
 * 
 * @param constraint - Capacity constraint to build key for
 * @param date - Date string (YYYY-MM-DD)
 * @returns Structured capacity key parts
 */
export function buildCapacityKey(constraint: CapacityConstraint, date: string): CapacityKeyParts {
  return {
    type: constraint.type,
    date,
    direction: constraint.type === TIME_BASIS_TYPES.ROLLING_WEEK ? (constraint.direction || 'past') : undefined
  }
}

/**
 * Convert capacity key parts to string for Map usage
 * WHY: Ensures consistent string format across all usage
 * PATTERN: Convert structured parts to string only when needed for Map keys
 * 
 * @param parts - Capacity key parts to convert
 * @returns String representation of capacity key
 */
export function capacityKeyToString(parts: CapacityKeyParts): string {
  if (parts.direction) {
    return `${parts.type}:${parts.date}:${parts.direction}`
  }
  return `${parts.type}:${parts.date}`
}
