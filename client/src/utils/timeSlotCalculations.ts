/**
 * Time Slot Calculation Utilities
 * 
 * LEARNING: Client-side time slot calculation functions
 * WHY: Calculate time slots from part instances without API dependency
 * PATTERN: Pure functions for time slot generation and duration calculation
 * Session 1.3.7: Client-Side Availability Calculations
 */

import type { TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { toRFC3339DateTime, type RFC3339DateTime } from '@/types/datetime'
import { getAvailabilitySettings, type BusinessHoursConfig } from '@/configs/availabilitySettings'
import { fitAvailableTimeSlots, parseUTCDate, type BusyTimeRange } from '@/utils/booking/timeSlotFitter'  // P3-6: Renamed for clarity
import { generateMockFreeBusyResponse, extractBusyTimesFromFreeBusyResponse } from '@/utils/booking/mockGoogleCalendar'
import { validateDateRange } from '@/utils/booking/dateRangeValidation'
import { DEFAULT_APPOINTMENT_DURATION_MINUTES } from '@/constants/scheduling'
import { createLogger } from '@/utils/logger'
import { fetchFreeBusy } from '@/services/calendarApiService'
import type { FreeBusyDataSource } from '@/composables/booking/useFreeBusyDataSource'

// Re-export types for consumers
export type { FreeBusyDataSource } from '@/composables/booking/useFreeBusyDataSource'

const logger = createLogger('timeSlotCalculations')

const isBusinessHoursConfig = (config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }): config is BusinessHoursConfig => {
  return 'hours' in config
}

/**
 * Round duration up to the nearest 15-minute increment
 * LEARNING: Ceiling function for time durations
 * WHY: Ensures appointment durations align with standard time increments
 * PATTERN: Use Math.ceil to round up, then multiply by increment
 * 
 * @param duration - Duration in minutes
 * @param increment - Increment in minutes (default: 15)
 * @returns Duration rounded up to nearest increment
 * 
 * Examples:
 * - roundUpToIncrement(37) -> 45 (rounds 37 up to 45)
 * - roundUpToIncrement(90) -> 90 (already on increment)
 * - roundUpToIncrement(91) -> 105 (rounds 91 up to 105)
 * - roundUpToIncrement(400) -> 405 (rounds 400 up to 405)
 */
export function roundUpToIncrement(duration: number, increment: number = 15): number {
  if (duration <= 0) return increment
  return Math.ceil(duration / increment) * increment
}

/**
 * Calculate duration from accumulated block instances
 * LEARNING: Sums all baseTime values from partInstances across all selected block instances
 * WHY: Duration includes time from base service, property type blocks, and availability options
 * PATTERN: Reduce block instances to sum of all part instances' baseTime values
 * Session 1.3.7: Refactored to handle all block instance types (service, property type block, availability options)
 * 
 * @param blockInstances - Array of BookingBlockInstance objects (service, property type block, availability options)
 * @returns Total duration in minutes, defaults to 90 if no block instances or part instances
 */
export function calculateDurationFromBlockInstances(blockInstances: BookingBlockInstance[]): number {
  if (!blockInstances || blockInstances.length === 0) {
    return DEFAULT_APPOINTMENT_DURATION_MINUTES
  }
  
  // PATTERN: Reduce block instances, then reduce part instances within each block
  const totalDuration = blockInstances.reduce((total, blockInstance) => {
    if (!blockInstance.partInstances || blockInstance.partInstances.length === 0) {
      return total
    }
    const blockDuration = blockInstance.partInstances.reduce((sum, partInstance) => {
      return sum + (partInstance.baseTime || 0)
    }, 0)
    return total + blockDuration
  }, 0)
  
  return totalDuration > 0 ? totalDuration : DEFAULT_APPOINTMENT_DURATION_MINUTES
}

/**
 * Options for getCalendarAvailability function
 * Session 2.1.2: Added for data source and cache control
 */
export interface GetCalendarAvailabilityOptions {
  /** Data source mode: 'real', 'mock', 'both', or 'none' */
  dataSource: FreeBusyDataSource
  /** Calendar emails to check (from settings) */
  calendarEmails: string[]
  /** Skip server cache for force refresh */
  skipCache?: boolean
}

/**
 * Get calendar availability (busy times) for a date range
 * 
 * LEARNING: Async function supporting multiple data sources
 * WHY: Allows switching between real API, mock data, or both
 * PATTERN: Data source determines where busy times come from
 * 
 * Session 2.1.2: Updated to be async with data source support
 * 
 * @param dateRange - Start and end of date range (RFC3339)
 * @param options - Data source mode, calendar emails, and cache options
 * @returns Promise of busy time ranges
 * @throws CalendarApiError if real API call fails
 */
export async function getCalendarAvailability(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  options: GetCalendarAvailabilityOptions
): Promise<BusyTimeRange[]> {
  const { dataSource, calendarEmails, skipCache } = options
  
  // PATTERN: Check if start datetime is today, use current time if so
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)
  const startDateOnly = new Date(dateRange.start)
  startDateOnly.setUTCHours(0, 0, 0, 0)
  const isToday = startDateOnly.getTime() === todayStart.getTime()
  
  const earliestStartTime = isToday ? toRFC3339DateTime(now) : dateRange.start
  
  // PATTERN: Check earliestStartTime (not dateRange.start) because for today we use current time
  const earliestStartDateTime = new Date(earliestStartTime)
  const timeDifferenceMs = now.getTime() - earliestStartDateTime.getTime()
  const isSignificantlyPast = timeDifferenceMs > 1000 // More than 1 second in the past
  
  if (isSignificantlyPast) {
    return [] // Past dates can't render in UI, no busy periods needed
  }
  
  // PATTERN: Use validateDateRange to check and normalize date range
  const validatedRange = validateDateRange(dateRange)
  if (!validatedRange) {
    // validateDateRange logs warnings internally
    return []
  }
  
  logger.debug('[getCalendarAvailability] Using data source:', {
    dataSource,
    calendarCount: calendarEmails.length,
    skipCache
  })
  
  // Handle 'none' mode - return empty array (all times available)
  if (dataSource === 'none') {
    logger.debug('[getCalendarAvailability] Data source is "none", returning empty')
    return []
  }
  
  // Handle 'mock' mode - only use mock data
  if (dataSource === 'mock') {
    return getMockBusyTimes(dateRange, calendarEmails)
  }
  
  // Handle 'real' mode - only use API data
  if (dataSource === 'real') {
    return await getRealBusyTimes(dateRange, calendarEmails, skipCache)
  }
  
  // Handle 'both' mode - merge real + mock data
  if (dataSource === 'both') {
    const [realTimes, mockTimes] = await Promise.all([
      getRealBusyTimes(dateRange, calendarEmails, skipCache),
      Promise.resolve(getMockBusyTimes(dateRange, calendarEmails))
    ])
    
    // Merge and sort to combine overlapping periods
    const mergedTimes = mergeOverlappingBusyTimes([...realTimes, ...mockTimes])
    return mergedTimes
  }
  
  // Fallback (shouldn't reach here)
  logger.warn('[getCalendarAvailability] Unknown data source, using mock')
  return getMockBusyTimes(dateRange, calendarEmails)
}

/**
 * Get mock busy times
 * LEARNING: Generates mock data for testing/development
 * WHY: Allows offline development and predictable testing
 */
function getMockBusyTimes(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  calendarEmails: string[]
): BusyTimeRange[] {
  // PATTERN: Fall back to default IDs if no calendars configured
  const calendarIds = calendarEmails.length > 0 
    ? calendarEmails 
    : ['primary', 'work', 'personal']
  
  try {
    const mockResponse = generateMockFreeBusyResponse(dateRange, {
      periodsPerCalendar: 3,
      minDurationMinutes: 30,
      maxDurationMinutes: 120,
      calendarIds
    })
    
    const busyTimes = extractBusyTimesFromFreeBusyResponse(mockResponse, true)
    
    return busyTimes.map(period => ({
      start: period.start as RFC3339DateTime,
      end: period.end as RFC3339DateTime
    }))
  } catch (error) {
    logger.error('[getMockBusyTimes] Error generating mock data:', error)
    return []
  }
}

/**
 * Get real busy times from Google Calendar API
 * LEARNING: Calls server endpoint for actual calendar data
 * WHY: Production use requires real calendar data
 * @throws CalendarApiError if API call fails
 */
async function getRealBusyTimes(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  calendarEmails: string[],
  skipCache?: boolean
): Promise<BusyTimeRange[]> {
  // Don't call API if no calendars configured
  if (calendarEmails.length === 0) {
    logger.debug('[getRealBusyTimes] No calendars configured, returning empty')
    return []
  }
  
  // Call the calendar API service
  // PATTERN: Let errors propagate (explicit error handling, not silent)
  const busyTimes = await fetchFreeBusy(
    calendarEmails,
    dateRange.start,
    dateRange.end,
    { skipCache }
  )
  
  return busyTimes
}

/**
 * Merge overlapping busy time ranges
 * LEARNING: Combines overlapping periods into single ranges
 * WHY: When merging real + mock data, we need to combine overlaps
 * PATTERN: Sort by start, then merge adjacent/overlapping periods
 */
function mergeOverlappingBusyTimes(busyTimes: BusyTimeRange[]): BusyTimeRange[] {
  if (busyTimes.length === 0) return []
  
  // Sort by start time
  const sorted = [...busyTimes].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  )
  
  const merged: BusyTimeRange[] = []
  
  for (const period of sorted) {
    if (merged.length === 0) {
      merged.push({ ...period })
      continue
    }
    
    const last = merged[merged.length - 1]
    const lastEnd = new Date(last.end).getTime()
    const currentStart = new Date(period.start).getTime()
    
    // Check if periods overlap or are adjacent
    if (currentStart <= lastEnd) {
      // Extend the last period if current ends later
      const currentEnd = new Date(period.end).getTime()
      if (currentEnd > lastEnd) {
        last.end = period.end
      }
    } else {
      // No overlap, add as new period
      merged.push({ ...period })
    }
  }
  
  return merged
}

/**
 * Synchronous version for backward compatibility
 * @deprecated Use getCalendarAvailability with options instead
 * Session 2.1.2: Kept for backward compatibility during migration
 * NOTE: Uses default calendar IDs since settings require async fetch
 */
export function getCalendarAvailabilitySync(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime }
): BusyTimeRange[] {
  // Use default IDs since we can't access async settings synchronously
  return getMockBusyTimes(dateRange, ['primary', 'work', 'personal'])
}

/**
 * Generate time slots for a date range
 * LEARNING: Now delegates to fitAvailableTimeSlots() for core logic  // P3-6: Updated function name
 * WHY: Single source of truth for time slot fitting
 * PATTERN: Thin wrapper that fetches settings and calls core utility
 * Session 1.3.7: Updated to use settings config instead of hardcoded values
 * Session 1.4.1: Updated to async to fetch settings from API
 * Session 1.4.14: Refactored to use fitAvailableTimeSlots() core utility  // P3-6: Updated function name
 * 
 * @param dateRange - Object with start and end ISO date strings
 * @param duration - Appointment duration in minutes
 * @param busyTimes - Array of busy time ranges to exclude (optional)
 * @returns Promise<TimeSlot[]> - Array of TimeSlot objects
 */
export async function generateTimeSlots(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  duration: number,
  busyTimes: Array<{ start: RFC3339DateTime; end: RFC3339DateTime }> = []
): Promise<TimeSlot[]> {
  // PATTERN: Load settings asynchronously from API, use throughout function
  const settings = await getAvailabilitySettings()
  
  // LEARNING: Use UTC methods for all date operations
  // WHY: All business logic should use UTC to avoid timezone issues
  const startDate = parseUTCDate(dateRange.start)
  if (!startDate) {
    logger.warn('Invalid start date in dateRange:', dateRange.start)
    return []
  }
  
  // LEARNING: Extract businessHours from structured rangeConstraints
  // WHY: No top-level businessHours fallback - must use structured format
  // PATTERN: Get businessHours from rangeConstraints.businessHours.config.hours
  const businessHoursConfig = settings.rangeConstraints?.businessHours?.config
  const businessHours = businessHoursConfig && isBusinessHoursConfig(businessHoursConfig)
    ? businessHoursConfig.hours
    : null
  if (!businessHours) {
    throw new Error('businessHours must be provided in rangeConstraints.businessHours.config.hours')
  }
  
  // PATTERN: Delegate to core utility with appropriate boundaries
  const result = await fitAvailableTimeSlots({  // P3-6: Renamed for clarity
    startBoundary: dateRange.start,
    endBoundary: dateRange.end,
    duration,
    businessHours,
    minuteIncrement: settings.minuteIncrement,
    busyTimes,
    includeFlags: { major: false, minor: false, moveable: false }
  })
  
  return result.slots
}


