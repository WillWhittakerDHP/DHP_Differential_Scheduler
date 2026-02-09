/**
 * Capacity Computer Service
 * 
 * LEARNING: Pre-computes scheduled hours for all capacity constraints in a date range
 * WHY: Eliminates N individual client API calls by computing all capacity hours server-side
 * PATTERN: Batch computation of capacity hours for entire date range
 * 
 * Phase 3: Server-Side Computed Availability Data Refactor
 * - Pre-computes capacity hours for all dates in requested range
 * - Returns Record<string, number> keyed by capacity key string
 * - Reuses existing availabilitiesDbUtils functions
 */

import type { CapacityConstraint } from '@shared/types/availabilityTypes'
import {
  sumWorkHoursForDay,
  sumWorkHoursForCalendarWeek,
  sumWorkHoursForRollingWeek,
  type RollingWeekDirection
} from '../utils/availabilities/availabiltiesDbUtils.js'

const TIME_BASIS_TYPES = {
  DAILY: 'daily' as const,
  CALENDAR_WEEK: 'calendarWeek' as const,
  ROLLING_WEEK: 'rollingWeek' as const,
} as const

/**
 * Capacity key parts structure
 * LEARNING: Structured representation of capacity key before stringification
 * WHY: Allows type-safe key building before converting to string
 */
interface CapacityKeyParts {
  type: 'daily' | 'calendarWeek' | 'rollingWeek'
  date: string  // YYYY-MM-DD
  direction?: RollingWeekDirection  // Only for rollingWeek
}

/**
 * Build capacity key parts for a constraint and date
 * LEARNING: Centralized key generation eliminates duplication
 * WHY: Single source of truth for capacity key format
 * PATTERN: Pure function that generates structured key parts
 * 
 * @param constraint - Capacity constraint to build key for
 * @param date - Date string (YYYY-MM-DD)
 * @returns Structured capacity key parts
 */
function buildCapacityKey(constraint: CapacityConstraint, date: string): CapacityKeyParts {
  return {
    type: constraint.type,
    date,
    direction: constraint.type === TIME_BASIS_TYPES.ROLLING_WEEK ? (constraint.direction || 'past') : undefined
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
 * Extract date string (YYYY-MM-DD) from RFC3339 datetime
 * LEARNING: Utility to extract date portion from datetime string
 * WHY: Capacity keys use date-only strings, not full datetime
 * PATTERN: Simple string manipulation
 * 
 * @param rfc3339DateTime - RFC3339 datetime string
 * @returns Date string in YYYY-MM-DD format
 */
function extractDateFromRFC3339(rfc3339DateTime: string): string {
  return rfc3339DateTime.split('T')[0]
}

/**
 * Get all unique dates in a date range
 * LEARNING: Generates array of date strings for each day in range
 * WHY: Need to compute capacity hours for each unique date
 * PATTERN: Iterate through date range, extract date strings
 * 
 * @param startDate - Start date (RFC3339 or Date)
 * @param endDate - End date (RFC3339 or Date)
 * @returns Array of date strings (YYYY-MM-DD)
 */
function getUniqueDatesInRange(startDate: string | Date, endDate: string | Date): string[] {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  const dates: string[] = []
  const current = new Date(start)
  
  // Set to start of day
  current.setUTCHours(0, 0, 0, 0)
  
  const endDateOnly = new Date(end)
  endDateOnly.setUTCHours(23, 59, 59, 999)
  
  while (current <= endDateOnly) {
    dates.push(current.toISOString().split('T')[0])
    current.setUTCDate(current.getUTCDate() + 1)
  }
  
  return dates
}

/**
 * Pre-compute scheduled hours for all capacity constraints in a date range
 * LEARNING: Batch computation of capacity hours eliminates N client API calls
 * WHY: Server can efficiently compute all capacity hours in one pass
 * PATTERN: Generate all unique capacity keys, fetch hours once per key, return map
 * 
 * @param dateRange - Date range to compute capacity hours for
 * @param capacityConstraints - Array of capacity constraints to compute
 * @returns Record mapping capacity key strings to scheduled hours
 */
export async function computeScheduledHoursForRange(
  dateRange: { start: string; end: string },
  capacityConstraints: CapacityConstraint[]
): Promise<Record<string, number>> {
  // Filter to only active constraints
  const activeConstraints = capacityConstraints.filter(c => c.enforcement !== 'off')
  
  if (activeConstraints.length === 0) {
    return {}
  }
  
  // Get all unique dates in the range
  const uniqueDates = getUniqueDatesInRange(dateRange.start, dateRange.end)
  
  // Build set of unique capacity keys
  const capacityKeyPartsSet = new Set<string>()
  const keyPartsMap = new Map<string, CapacityKeyParts>()
  
  // For each date and each constraint, build the capacity key
  for (const date of uniqueDates) {
    for (const constraint of activeConstraints) {
      const keyParts = buildCapacityKey(constraint, date)
      const keyString = capacityKeyToString(keyParts)
      capacityKeyPartsSet.add(keyString)
      keyPartsMap.set(keyString, keyParts)
    }
  }
  
  // Fetch hours for each unique key
  const scheduledHoursByKey: Record<string, number> = {}
  
  await Promise.all(
    Array.from(capacityKeyPartsSet).map(async (keyString) => {
      const keyParts = keyPartsMap.get(keyString)!
      const dateObj = new Date(keyString.split(':')[1] + 'T00:00:00Z')
      
      let hours = 0
      
      switch (keyParts.type) {
        case TIME_BASIS_TYPES.DAILY:
          hours = await sumWorkHoursForDay(dateObj)
          break
        case TIME_BASIS_TYPES.CALENDAR_WEEK:
          hours = await sumWorkHoursForCalendarWeek(dateObj)
          break
        case TIME_BASIS_TYPES.ROLLING_WEEK:
          hours = await sumWorkHoursForRollingWeek(
            dateObj,
            keyParts.direction || 'past'
          )
          break
      }
      
      scheduledHoursByKey[keyString] = hours
    })
  )
  
  return scheduledHoursByKey
}
