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
 * @param dateRange - Start and end boundaries for the busy period
 * @param config - Configuration for duration ranges
 * @returns A busy period with RFC3339 formatted timestamps
 */
function generateRandomBusyPeriod(
  dateRange: { start: string; end: string },
  config: Required<Pick<MockBusyPeriodConfig, 'minDurationMinutes' | 'maxDurationMinutes'>>
): GoogleCalendarBusyPeriod {
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)
  
  // Calculate available time window
  const totalMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
  
  // LEARNING: Handle edge case where date range is too small
  // WHY: If range is smaller than max duration, adjust duration to fit
  // PATTERN: Use available time or configured max, whichever is smaller
  const maxPossibleDuration = Math.min(config.maxDurationMinutes, totalMinutes)
  const minPossibleDuration = Math.min(config.minDurationMinutes, totalMinutes)
  
  // Generate random duration within possible range
  const duration = minPossibleDuration + 
    Math.random() * (maxPossibleDuration - minPossibleDuration)
  
  // Generate random start time within the range
  // LEARNING: Use Math.random() for variety, but seed could make it deterministic
  // WHY: Random periods simulate real-world calendar usage
  // PATTERN: Ensure start allows for full duration to fit
  const maxStartOffset = Math.max(0, totalMinutes - duration)
  const randomStartOffset = Math.random() * maxStartOffset
  const periodStart = new Date(startDate.getTime() + randomStartOffset * 60 * 1000)
  
  // Calculate end time
  const periodEnd = new Date(periodStart.getTime() + duration * 60 * 1000)
  
  // Ensure period doesn't extend past end boundary (safety check)
  if (periodEnd > endDate) {
    periodEnd.setTime(endDate.getTime())
    // Adjust start to ensure minimum duration if possible
    const adjustedStart = new Date(periodEnd.getTime() - minPossibleDuration * 60 * 1000)
    if (adjustedStart >= startDate) {
      periodStart.setTime(adjustedStart.getTime())
    } else {
      periodStart.setTime(startDate.getTime())
    }
  }
  
  return {
    start: periodStart.toISOString(),
    end: periodEnd.toISOString()
  }
}

/**
 * Generate mock Google Calendar free/busy API response
 * LEARNING: Creates realistic mock data matching Google Calendar API format
 * WHY: Enables testing without real API integration
 * PATTERN: Generates multiple calendars with configurable busy periods
 * 
 * @param dateRange - Start and end ISO date strings for the query range
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
  dateRange: { start: string; end: string },
  config: MockBusyPeriodConfig = {}
): GoogleFreeBusyResponse {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Validate date range
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)
  
  if (startDate >= endDate) {
    throw new Error('dateRange.start must be before dateRange.end')
  }
  
  // Generate busy periods for each calendar
  const calendars: Record<string, { busy: GoogleCalendarBusyPeriod[] }> = {}
  
  for (const calendarId of mergedConfig.calendarIds) {
    const busyPeriods: GoogleCalendarBusyPeriod[] = []
    
    // Generate configured number of busy periods
    for (let i = 0; i < mergedConfig.periodsPerCalendar; i++) {
      try {
        const period = generateRandomBusyPeriod(dateRange, {
          minDurationMinutes: mergedConfig.minDurationMinutes,
          maxDurationMinutes: mergedConfig.maxDurationMinutes
        })
        busyPeriods.push(period)
      } catch (error) {
        // Skip periods that can't fit in the date range
        console.warn(`[mockGoogleCalendar] Skipping busy period ${i} for ${calendarId}:`, error)
      }
    }
    
    calendars[calendarId] = { busy: busyPeriods }
  }
  
  return {
    kind: 'calendar#freeBusy',
    timeMin: dateRange.start,
    timeMax: dateRange.end,
    calendars
  }
}

/**
 * Extract busy times from Google Calendar free/busy response
 * LEARNING: Flattens busy periods from all calendars into single array
 * WHY: fitTimeSlots() expects a flat array of busy time ranges
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
 * const slots = fitTimeSlots({ ..., busyTimes })
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
