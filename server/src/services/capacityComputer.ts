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

import type { CapacityConstraint } from '../../../shared/types/availabilityTypes.js'
import { TIME_BASIS_TYPES } from '../../../shared/constants/constraintConstants.js'
import {
  CapacityKeyParts,
  buildCapacityKey,
  capacityKeyToString,
  extractDateFromRFC3339
} from '../../../shared/utils/capacityKeyUtils.js'
import {
  sumWorkHoursForDay,
  sumWorkHoursForCalendarWeek,
  sumWorkHoursForRollingWeek,
  type RollingWeekDirection
} from '../utils/availabilities/availabiltiesDbUtils.js'

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
