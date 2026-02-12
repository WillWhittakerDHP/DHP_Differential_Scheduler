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
  
  // PATTERN: Use the later of earliestStartTime or startDate
  const effectiveStart = earliestStart > startDate ? earliestStart : startDate
  
  const totalMinutes = (endDate.getTime() - effectiveStart.getTime()) / (1000 * 60)
  
  // PATTERN: Use available time or configured max, whichever is smaller
  const maxPossibleDuration = Math.min(config.maxDurationMinutes, totalMinutes)
  const minPossibleDuration = Math.min(config.minDurationMinutes, totalMinutes)
  
  // PATTERN: Include available time and required minimum in error
  if (maxPossibleDuration <= 0 || maxPossibleDuration < minPossibleDuration) {
    throw new Error(`No time available: ${totalMinutes} minutes available, need at least ${minPossibleDuration} minutes`)
  }
  
  // PATTERN: Check for equality before calculating random duration
  const duration = maxPossibleDuration === minPossibleDuration
    ? minPossibleDuration
    : minPossibleDuration + Math.random() * (maxPossibleDuration - minPossibleDuration)
  
  // PATTERN: Ensure start allows for full duration to fit
  const maxStartOffset = Math.max(0, totalMinutes - duration)
  const randomStartOffset = Math.random() * maxStartOffset
  const periodStart = new Date(effectiveStart.getTime() + randomStartOffset * 60 * 1000)
  
  const periodEnd = new Date(periodStart.getTime() + duration * 60 * 1000)
  
  if (periodEnd > endDate) {
    periodEnd.setTime(endDate.getTime())
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
  
  const startDateTime = new Date(dateRange.start)
  const endDateTime = new Date(dateRange.end)
  const now = new Date()
  
  if (startDateTime >= endDateTime) {
    throw new Error('dateRange.start must be before dateRange.end')
  }
  
  // PATTERN: Check if start datetime is today, use current time if so
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)
  const startDateOnly = new Date(startDateTime)
  startDateOnly.setUTCHours(0, 0, 0, 0)
  const isToday = startDateOnly.getTime() === todayStart.getTime()
  
  const earliestStartTime: RFC3339DateTime = isToday ? toRFC3339DateTime(now) : dateRange.start
  
  // LEARNING: Convert earliestStartTime to Date object for calculations
  // PATTERN: Create Date object once, reuse for all calculations
  const earliestStartDateTime = new Date(earliestStartTime)
  
  // PATTERN: Early return with empty calendars, but allow small timing differences (race conditions)
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
  
  // PATTERN: Cap endDateTime at 48 hours from current time
  const maxEndTime = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours from now
  const constrainedEndDateTime = endDateTime > maxEndTime ? maxEndTime : endDateTime
  
  // PATTERN: Calculate difference between constrained end and earliest start time
  const availableMinutes = (constrainedEndDateTime.getTime() - earliestStartDateTime.getTime()) / (1000 * 60)
  
  // PATTERN: Early return with clear warning if window is too small
  if (availableMinutes < mergedConfig.minDurationMinutes) {
    logger.warn('Time window too small', {
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
  
  // PATTERN: Generate fewer periods if window is less than 2x minimum duration
  const adjustedPeriodsPerCalendar = availableMinutes < (mergedConfig.minDurationMinutes * 2)
    ? 1  // Only generate 1 period if window is small
    : mergedConfig.periodsPerCalendar
  
  // LEARNING: For very small windows, use full window as single busy period
  // PATTERN: If window fits between min and max duration, use it entirely
  const useFullWindow = availableMinutes >= mergedConfig.minDurationMinutes && 
                        availableMinutes <= mergedConfig.maxDurationMinutes &&
                        adjustedPeriodsPerCalendar === 1
  
  // PATTERN: Use Object.fromEntries + map to generate calendars immutably
  const calendars: Record<string, { busy: GoogleCalendarBusyPeriod[] }> = Object.fromEntries(
    mergedConfig.calendarIds.map(calendarId => {
      // LEARNING: Handle small window case - use full window as single period
      // PATTERN: Generate one period using the full available window (constrained to 48 hours)
      let busyPeriods: GoogleCalendarBusyPeriod[]
      
      if (useFullWindow) {
        const effectiveStart = new Date(earliestStartTime)
        const effectiveEnd = new Date(constrainedEndDateTime)
        
        const actualStart = effectiveStart > new Date(dateRange.start) ? effectiveStart : new Date(dateRange.start)
        
        // PATTERN: Cap end time at 48-hour maximum
        const periodEnd = effectiveEnd > maxEndTime ? maxEndTime : effectiveEnd
        
        busyPeriods = [{
          start: toRFC3339DateTime(actualStart),
          end: toRFC3339DateTime(periodEnd)
        }]
        
      } else {
        // PATTERN: Use Array.from + map to generate periods immutably, filter out errors
        busyPeriods = Array.from({ length: adjustedPeriodsPerCalendar }, (_, i) => {
          try {
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
            
            // PATTERN: Check and adjust period end time if needed
            const periodEndDate = new Date(period.end)
            if (periodEndDate > maxEndTime) {
              const adjustedPeriod = {
                ...period,
                end: toRFC3339DateTime(maxEndTime)
              }
              const periodStartDate = new Date(period.start)
              const adjustedDuration = (maxEndTime.getTime() - periodStartDate.getTime()) / (1000 * 60)
              if (adjustedDuration < mergedConfig.minDurationMinutes) {
                throw new Error(`Period would be too short after 48-hour constraint: ${adjustedDuration} minutes`)
              }
              return adjustedPeriod
            }
            
            return period
          } catch (error) {
            logger.error('Error adjusting busy period', { error, calendarId, periodIndex: i })
            logger.warn(`Skipping busy period ${i} for ${calendarId}:`, {
              error,
              errorMessage: error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined
            })
            return null
          }
        }).filter((period): period is GoogleCalendarBusyPeriod => period !== null)
      }
      
      return [calendarId, { busy: busyPeriods }]
    })
  )
  
  const response: GoogleFreeBusyResponse = {
    kind: 'calendar#freeBusy',
    timeMin: dateRange.start,
    timeMax: toRFC3339DateTime(constrainedEndDateTime), // Use constrained end time
    calendars: Object.keys(calendars).length > 0 ? calendars : undefined
  }
  
  return response
}

export function extractBusyTimesFromFreeBusyResponse(
  response: GoogleFreeBusyResponse,
  mergeOverlapping: boolean = false
): Array<{ start: string; end: string }> {
  if (!response.calendars) {
    return []
  }
  
  // PATTERN: Use flatMap to extract busy arrays from all calendars immutably
  const allBusyPeriods = Object.values(response.calendars)
    .flatMap((calendar) => {
      const busy = calendar.busy
      return busy !== undefined && busy !== null && Array.isArray(busy) ? busy : []
    })
  
  if (!mergeOverlapping || allBusyPeriods.length === 0) {
    return allBusyPeriods
  }
  
  // PATTERN: Sort by start time, then merge overlapping ranges using reduce
  const sorted = [...allBusyPeriods].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  )
  
  // PATTERN: Use reduce to merge overlapping periods immutably
  return sorted.reduce((merged: Array<{ start: string; end: string }>, period) => {
    if (merged.length === 0) {
      return [{ ...period }]
    }
    
    const lastMerged = merged[merged.length - 1]
    const lastEnd = new Date(lastMerged.end)
    const currentStart = new Date(period.start)
    
    // PATTERN: Merge if current starts before or at last end time
    if (currentStart <= lastEnd) {
      const currentEnd = new Date(period.end)
      if (currentEnd > lastEnd) {
        // PATTERN: Create new object instead of mutating
        return [
          ...merged.slice(0, -1),
          { ...lastMerged, end: period.end }
        ]
      }
      return merged
    } else {
      return [...merged, { ...period }]
    }
  }, [])
}
