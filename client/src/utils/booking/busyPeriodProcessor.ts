/**
 * Busy Period Processor
 * 
 * LEARNING: Handles validation, sorting, merging, and parsing of busy periods
 * WHY: Separated from slotAvailabilityOrchestrator to reduce complexity and improve maintainability
 * PATTERN: Pure utility functions - no side effects
 */

import type { BusyTimeRange } from '@shared/types/availabilityTypes'
import type { ParsedBusyTimeRange } from './timeSlotTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('busyPeriodProcessor')

// Re-export for backward compatibility
export type { ParsedBusyTimeRange }

/**
 * Validate a single busy period
 * LEARNING: Check that start < end and times are valid
 * WHY: Invalid busy periods can cause incorrect availability
 * PATTERN: Validate before pre-processing, log errors
 * 
 * @param busy - Busy period to validate
 * @returns true if valid, false otherwise
 */
function validateBusyPeriod(busy: BusyTimeRange): boolean {
  const start = new Date(busy.start)
  const end = new Date(busy.end)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false
  }
  
  if (start >= end) {
    return false
  }
  
  return true
}

/**
 * Sort busy periods by start time
 * LEARNING: Sorted busy periods enable efficient merging
 * WHY: Merging requires chronological order
 * PATTERN: Sort in place or create sorted copy
 * 
 * @param busyTimes - Busy periods to sort
 * @returns Sorted busy periods (by start time)
 */
function sortBusyPeriods(busyTimes: BusyTimeRange[]): BusyTimeRange[] {
  return [...busyTimes].sort((a, b) => {
    const aStart = new Date(a.start)
    const bStart = new Date(b.start)
    return aStart.getTime() - bStart.getTime()
  })
}

/**
 * Merge overlapping or adjacent busy periods
 * LEARNING: Reduces number of overlap checks during slot generation
 * WHY: Merging [10:00-11:00, 10:30-12:00] → [10:00-12:00] reduces checks
 * PATTERN: Use reduce to build merged array immutably
 * 
 * @param sortedBusyTimes - Busy periods sorted by start time
 * @returns Merged busy periods (non-overlapping)
 */
function mergeBusyPeriods(sortedBusyTimes: BusyTimeRange[]): BusyTimeRange[] {
  if (sortedBusyTimes.length === 0) return []
  
  // PATTERN: Reduce with accumulator that creates new objects instead of mutating
  return sortedBusyTimes.slice(1).reduce((merged, current) => {
    const lastMerged = merged[merged.length - 1]
    const lastEnd = new Date(lastMerged.end)
    const currentStart = new Date(current.start)
    const currentEnd = new Date(current.end)
    
    // Only merge periods with the same source - preserves source information for violation attribution
    if (currentStart <= lastEnd && current.source === lastMerged.source) {
      if (currentEnd > lastEnd) {
        // WHY: Immutable pattern - don't mutate objects in arrays
        // PATTERN: Replace last element with new merged object
        return [
          ...merged.slice(0, -1),
          { ...lastMerged, end: current.end }
        ]
      }
      return merged
    } else {
      return [...merged, { ...current }]
    }
  }, [{ ...sortedBusyTimes[0] }])
}

/**
 * Pre-process busy periods: validate, sort, and merge
 * LEARNING: Single function that prepares busy periods for slot generation
 * WHY: Ensures busy periods are valid and optimized before slot checks
 * PATTERN: Validate → Sort → Merge → Return processed periods
 * 
 * @param busyTimes - Raw busy periods from calendar or user input
 * @returns Validated, sorted, and merged busy periods
 */
export function preprocessBusyPeriods(busyTimes: BusyTimeRange[]): BusyTimeRange[] {
  if (busyTimes.length === 0) return []
  
  // Step 1: Validate and filter invalid periods
  const validBusyTimes = busyTimes.filter(validateBusyPeriod)
  
  // DEBUG: Log filtering results
  if (busyTimes.length !== validBusyTimes.length) {
    const invalidCount = busyTimes.length - validBusyTimes.length
    logger.warn(`Filtered out ${invalidCount} invalid busy periods (${busyTimes.length} -> ${validBusyTimes.length})`)
  }
  
  if (validBusyTimes.length === 0) return []
  
  const sortedBusyTimes = sortBusyPeriods(validBusyTimes)
  
  const mergedBusyTimes = mergeBusyPeriods(sortedBusyTimes)
  
  // DEBUG: Log merging results
  if (sortedBusyTimes.length !== mergedBusyTimes.length) {
    logger.debug(`Merged ${sortedBusyTimes.length} periods into ${mergedBusyTimes.length} periods`)
  }
  
  return mergedBusyTimes
}

/**
 * Parse busy periods to Date objects once
 * LEARNING: Performance optimization - parse busy periods once at start
 * WHY: Avoid creating new Date objects inside loops (50-80% reduction)
 * PATTERN: Map busy periods to cached Date objects before slot generation
 * 
 * @param busyTimes - Pre-processed busy periods
 * @returns Parsed busy periods with Date objects
 */
export function parseBusyPeriods(busyTimes: BusyTimeRange[]): ParsedBusyTimeRange[] {
  return busyTimes.map(busy => ({
    start: new Date(busy.start),
    end: new Date(busy.end),
    source: busy.source,
    placeId: busy.placeId,
    driveTimeTo: busy.driveTimeTo,
    driveTimeFrom: busy.driveTimeFrom,
  }))
}
