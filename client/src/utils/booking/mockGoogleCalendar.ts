/**
 * Mock Google Calendar Free/Busy Data Generator
 * 
 * LEARNING: Generates realistic mock data matching Google Calendar API format
 * WHY: Enables testing time slotting with blocked periods without real API integration
 * PATTERN: Deterministic mock data generator for consistent testing
 * 
 * This module provides mock implementations of Google Calendar free/busy API responses
 * for testing time slot filtering functionality.
 */

import type { GoogleFreeBusyResponse, GoogleCalendarBusyPeriod } from '@/types/googleCalendar'
import { toRFC3339DateTime, type RFC3339DateTime } from '@/types/datetime'
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('mockGoogleCalendar')

/**
 * Configuration for generating mock busy periods
 * LEARNING: Configurable parameters for flexible test scenarios
 * WHY: Allows different test cases with varying busy period patterns
 */
export interface MockBusyPeriodConfig {
  /** Number of busy periods to generate per calendar */
  periodsPerCalendar?: number
  /** Minimum duration of busy periods in minutes */
  minDurationMinutes?: number
  /** Maximum duration of busy periods in minutes */
  maxDurationMinutes?: number
  /** Calendar IDs to generate busy periods for */
  calendarIds?: string[]
}

/**
 * Default configuration for mock busy periods
 * LEARNING: Sensible defaults for realistic test scenarios
 * WHY: Most tests can use defaults without specifying config
 */
const DEFAULT_CONFIG: Required<MockBusyPeriodConfig> = {
  periodsPerCalendar: 3,
  minDurationMinutes: 30,
  maxDurationMinutes: 120,
  calendarIds: ['primary', 'work', 'personal']
}

/**
 * Generate a random busy period within a date range
 * LEARNING: Creates realistic busy periods with random start times and durations
 * WHY: Simulates real calendar events with varying durations
 * PATTERN: Pure function that generates deterministic or random periods
 * 
 * @param dateRange - Start and end boundaries for the busy period (RFC3339 format)
 * @param earliestStartTime - Earliest time busy periods can start (RFC3339 format)
 * @param config - Configuration for duration ranges
 * @returns A busy period with RFC3339 formatted timestamps
 */
function generateRandomBusyPeriod(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  earliestStartTime: RFC3339DateTime,
  config: Required<Pick<MockBusyPeriodConfig, 'minDurationMinutes' | 'maxDurationMinutes'>>
): GoogleCalendarBusyPeriod {
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)
  const earliestStart = new Date(earliestStartTime)
  
  // LEARNING: Use earliest start time (current time if today, otherwise start of range)
  // WHY: Ensures busy periods don't start in the past
  // PATTERN: Use the later of earliestStartTime or startDate
  const effectiveStart = earliestStart > startDate ? earliestStart : startDate
  
  // Calculate available time window from effective start
  const totalMinutes = (endDate.getTime() - effectiveStart.getTime()) / (1000 * 60)
  
  // LEARNING: Handle edge case where date range is too small
  // WHY: If range is smaller than max duration, adjust duration to fit
  // PATTERN: Use available time or configured max, whichever is smaller
  const maxPossibleDuration = Math.min(config.maxDurationMinutes, totalMinutes)
  const minPossibleDuration = Math.min(config.minDurationMinutes, totalMinutes)
  
  // LEARNING: Improved error message with details
  // WHY: Helps debug why busy periods aren't being generated
  // PATTERN: Include available time and required minimum in error
  if (maxPossibleDuration <= 0 || maxPossibleDuration < minPossibleDuration) {
    throw new Error(`No time available: ${totalMinutes} minutes available, need at least ${minPossibleDuration} minutes`)
  }
  
  // LEARNING: Handle edge case where maxPossibleDuration equals minPossibleDuration
  // WHY: When time window is exactly the minimum duration, use that exact duration
  // PATTERN: Check for equality before calculating random duration
  const duration = maxPossibleDuration === minPossibleDuration
    ? minPossibleDuration
    : minPossibleDuration + Math.random() * (maxPossibleDuration - minPossibleDuration)
  
  // Generate random start time within the range (from effective start)
  // LEARNING: Use Math.random() for variety, but seed could make it deterministic
  // WHY: Random periods simulate real-world calendar usage
  // PATTERN: Ensure start allows for full duration to fit
  const maxStartOffset = Math.max(0, totalMinutes - duration)
  const randomStartOffset = Math.random() * maxStartOffset
  const periodStart = new Date(effectiveStart.getTime() + randomStartOffset * 60 * 1000)
  
  // Calculate end time
  const periodEnd = new Date(periodStart.getTime() + duration * 60 * 1000)
  
  // Ensure period doesn't extend past end boundary (safety check)
  if (periodEnd > endDate) {
    periodEnd.setTime(endDate.getTime())
    // Adjust start to ensure minimum duration if possible
    const adjustedStart = new Date(periodEnd.getTime() - minPossibleDuration * 60 * 1000)
    if (adjustedStart >= effectiveStart) {
      periodStart.setTime(adjustedStart.getTime())
    } else {
      periodStart.setTime(effectiveStart.getTime())
    }
  }
  
  return {
    start: toRFC3339DateTime(periodStart),
    end: toRFC3339DateTime(periodEnd)
  }
}

/**
 * Generate mock Google Calendar free/busy API response
 * LEARNING: Creates realistic mock data matching Google Calendar API format
 * WHY: Enables testing without real API integration
 * PATTERN: Generates multiple calendars with configurable busy periods
 * 
 * @param dateRange - Start and end RFC3339 datetime strings for the query range
 * @param config - Optional configuration for busy period generation
 * @returns GoogleFreeBusyResponse matching Google Calendar API format
 * 
 * @example
 * ```typescript
 * const response = generateMockFreeBusyResponse({
 *   start: '2026-01-15T00:00:00Z',
 *   end: '2026-01-16T00:00:00Z'
 * })
 * ```
 */
export function generateMockFreeBusyResponse(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  config: MockBusyPeriodConfig = {}
): GoogleFreeBusyResponse {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Validate date range
  const startDateTime = new Date(dateRange.start)
  const endDateTime = new Date(dateRange.end)
  const now = new Date()
  
  if (startDateTime >= endDateTime) {
    throw new Error('dateRange.start must be before dateRange.end')
  }
  
  // LEARNING: Determine earliest start time for busy periods
  // WHY: If date is today, busy periods should start from current time (not midnight)
  // PATTERN: Check if start datetime is today, use current time if so
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)
  const startDateOnly = new Date(startDateTime)
  startDateOnly.setUTCHours(0, 0, 0, 0)
  const isToday = startDateOnly.getTime() === todayStart.getTime()
  
  const earliestStartTime: RFC3339DateTime = isToday ? toRFC3339DateTime(now) : dateRange.start
  
  // LEARNING: Convert earliestStartTime to Date object for calculations
  // WHY: Need Date object for time comparisons and calculations
  // PATTERN: Create Date object once, reuse for all calculations
  const earliestStartDateTime = new Date(earliestStartTime)
  
  // LEARNING: Return empty response if earliest start time is significantly in the past
  // WHY: Past dates can't render in UI, no need to generate busy periods
  // PATTERN: Early return with empty calendars, but allow small timing differences (race conditions)
  // NOTE: Use 1 second buffer to account for timing differences between date creation and check
  // NOTE: Check earliestStartTime (not dateRange.start) because for today we use current time
  const timeDifferenceMs = now.getTime() - earliestStartDateTime.getTime()
  const isSignificantlyPast = timeDifferenceMs > 1000 // More than 1 second in the past
  
  if (isSignificantlyPast) {
    logger.warn('Early return - earliest start time is significantly in the past:', {
      earliestStartTime: earliestStartTime,
      earliestStartDateTime: earliestStartDateTime.toISOString(),
      now: now.toISOString(),
      differenceMs: timeDifferenceMs,
      differenceSeconds: Math.round(timeDifferenceMs / 1000),
      differenceMinutes: Math.round(timeDifferenceMs / (1000 * 60) * 100) / 100
    })
    return {
      kind: 'calendar#freeBusy',
      timeMin: dateRange.start,
      timeMax: dateRange.end,
      calendars: {} // Empty - no busy periods for past dates
    }
  }
  
  // LEARNING: Constrain end time to maximum 48 hours from now
  // WHY: Busy periods should only be generated for the next 48 hours, not far future dates
  // PATTERN: Cap endDateTime at 48 hours from current time
  const maxEndTime = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours from now
  const constrainedEndDateTime = endDateTime > maxEndTime ? maxEndTime : endDateTime
  
  // LEARNING: Calculate available time window in minutes
  // WHY: Need to check if there's enough time to generate busy periods
  // PATTERN: Calculate difference between constrained end and earliest start time
  const availableMinutes = (constrainedEndDateTime.getTime() - earliestStartDateTime.getTime()) / (1000 * 60)
  
  // LEARNING: Check if time window is too small before attempting generation
  // WHY: Prevents silent failures when there's not enough time
  // PATTERN: Early return with clear warning if window is too small
  if (availableMinutes < mergedConfig.minDurationMinutes) {
    console.warn('[mockGoogleCalendar] Time window too small:', {
      availableMinutes: Math.round(availableMinutes * 100) / 100,
      minDurationMinutes: mergedConfig.minDurationMinutes,
      message: 'Cannot generate busy periods - not enough time remaining'
    })
    return {
      kind: 'calendar#freeBusy',
      timeMin: dateRange.start,
      timeMax: dateRange.end,
      calendars: {} // Empty - not enough time for busy periods
    }
  }
  
  // LEARNING: Adjust number of periods if time window is small
  // WHY: When window is small, reduce periods to increase success rate
  // PATTERN: Generate fewer periods if window is less than 2x minimum duration
  const adjustedPeriodsPerCalendar = availableMinutes < (mergedConfig.minDurationMinutes * 2)
    ? 1  // Only generate 1 period if window is small
    : mergedConfig.periodsPerCalendar
  
  // LEARNING: For very small windows, use full window as single busy period
  // WHY: Ensures at least one busy period is generated when possible
  // PATTERN: If window fits between min and max duration, use it entirely
  const useFullWindow = availableMinutes >= mergedConfig.minDurationMinutes && 
                        availableMinutes <= mergedConfig.maxDurationMinutes &&
                        adjustedPeriodsPerCalendar === 1
  
  // Generate busy periods for each calendar
  const calendars: Record<string, { busy: GoogleCalendarBusyPeriod[] }> = {}
  
  for (const calendarId of mergedConfig.calendarIds) {
    const busyPeriods: GoogleCalendarBusyPeriod[] = []
    
    // LEARNING: Handle small window case - use full window as single period
    // WHY: Ensures at least one busy period when window is small but sufficient
    // PATTERN: Generate one period using the full available window (constrained to 48 hours)
    if (useFullWindow) {
      const effectiveStart = new Date(earliestStartTime)
      const effectiveEnd = new Date(constrainedEndDateTime)
      
      // Ensure effective start is not before dateRange start
      const actualStart = effectiveStart > new Date(dateRange.start) ? effectiveStart : new Date(dateRange.start)
      
      // LEARNING: Ensure period doesn't extend beyond 48-hour limit
      // WHY: Busy periods must be within next 48 hours
      // PATTERN: Cap end time at 48-hour maximum
      const periodEnd = effectiveEnd > maxEndTime ? maxEndTime : effectiveEnd
      
      busyPeriods.push({
        start: toRFC3339DateTime(actualStart),
        end: toRFC3339DateTime(periodEnd)
      })
      
    } else {
      // Generate configured number of busy periods (or adjusted number for small windows)
      for (let i = 0; i < adjustedPeriodsPerCalendar; i++) {
        try {
          // LEARNING: Create constrained date range for period generation
          // WHY: Ensure periods don't extend beyond 48-hour limit
          // PATTERN: Use constrained end time instead of original end time
          const constrainedDateRange = {
            start: dateRange.start,
            end: toRFC3339DateTime(constrainedEndDateTime)
          }
          
          const period = generateRandomBusyPeriod(
            constrainedDateRange,
            earliestStartTime,
            {
              minDurationMinutes: mergedConfig.minDurationMinutes,
              maxDurationMinutes: mergedConfig.maxDurationMinutes
            }
          )
          
          // LEARNING: Ensure period doesn't extend beyond 48-hour limit
          // WHY: Additional safety check to cap periods at 48 hours
          // PATTERN: Check and adjust period end time if needed
          const periodEndDate = new Date(period.end)
          if (periodEndDate > maxEndTime) {
            period.end = toRFC3339DateTime(maxEndTime)
            // Adjust start if period becomes too short
            const periodStartDate = new Date(period.start)
            const adjustedDuration = (maxEndTime.getTime() - periodStartDate.getTime()) / (1000 * 60)
            if (adjustedDuration < mergedConfig.minDurationMinutes) {
              // Period too short, skip it
              throw new Error(`Period would be too short after 48-hour constraint: ${adjustedDuration} minutes`)
            }
          }
          
          busyPeriods.push(period)
        } catch (error) {
          // LEARNING: Log detailed error information
          // WHY: Helps understand why periods can't be generated
          // PATTERN: Include calendar ID, period index, and error details
          logger.warn(`Skipping busy period ${i} for ${calendarId}:`, {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
          })
        }
      }
    }
    
    calendars[calendarId] = { busy: busyPeriods }
  }
  
  const response: GoogleFreeBusyResponse = {
    kind: 'calendar#freeBusy',
    timeMin: dateRange.start,
    timeMax: toRFC3339DateTime(constrainedEndDateTime), // Use constrained end time
    calendars: Object.keys(calendars).length > 0 ? calendars : undefined
  }
  
  return response
}

/**
 * Extract busy times from Google Calendar free/busy response
 * LEARNING: Flattens busy periods from all calendars into single array
 * WHY: fitAvailableTimeSlots() expects a flat array of busy time ranges  // P3-6: Updated function name
 * PATTERN: Extract and flatten, optionally merge overlapping periods
 * 
 * @param response - Google Calendar free/busy API response
 * @param mergeOverlapping - Whether to merge overlapping busy periods (default: false)
 * @returns Array of busy time ranges compatible with fitTimeSlots()
 * 
 * @example
 * ```typescript
 * const response = generateMockFreeBusyResponse(dateRange)
 * const busyTimes = extractBusyTimesFromFreeBusyResponse(response)
 * const slots = fitAvailableTimeSlots({ ..., busyTimes })  // P3-6: Updated function name
 * ```
 */
export function extractBusyTimesFromFreeBusyResponse(
  response: GoogleFreeBusyResponse,
  mergeOverlapping: boolean = false
): Array<{ start: string; end: string }> {
  if (!response.calendars) {
    return []
  }
  
  // LEARNING: Flatten busy periods from all calendars
  // WHY: Multiple calendars may have overlapping busy periods
  // PATTERN: Use flatMap to extract busy arrays from all calendars
  const allBusyPeriods: Array<{ start: string; end: string }> = []
  
  for (const calendar of Object.values(response.calendars)) {
    if (calendar.busy) {
      allBusyPeriods.push(...calendar.busy)
    }
  }
  
  if (!mergeOverlapping || allBusyPeriods.length === 0) {
    return allBusyPeriods
  }
  
  // LEARNING: Merge overlapping busy periods
  // WHY: Prevents double-counting when multiple calendars have overlapping events
  // PATTERN: Sort by start time, then merge overlapping ranges
  const sorted = [...allBusyPeriods].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  )
  
  const merged: Array<{ start: string; end: string }> = []
  
  for (const period of sorted) {
    if (merged.length === 0) {
      merged.push({ ...period })
      continue
    }
    
    const lastMerged = merged[merged.length - 1]
    const lastEnd = new Date(lastMerged.end)
    const currentStart = new Date(period.start)
    
    // LEARNING: Check if periods overlap or are adjacent
    // WHY: Adjacent periods should be merged to avoid gaps
    // PATTERN: Merge if current starts before or at last end time
    if (currentStart <= lastEnd) {
      // Merge: extend last period to include current
      const currentEnd = new Date(period.end)
      if (currentEnd > lastEnd) {
        lastMerged.end = period.end
      }
    } else {
      // No overlap: add as new period
      merged.push({ ...period })
    }
  }
  
  return merged
}
