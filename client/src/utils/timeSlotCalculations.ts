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
import type { RFC3339DateTime } from '@/types/datetime'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { fitTimeSlots, type BusinessHoursMap } from '@/utils/booking/timeSlotFitter'
import { generateMockFreeBusyResponse, extractBusyTimesFromFreeBusyResponse } from '@/utils/booking/mockGoogleCalendar'

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
    // Default to 90 minutes (1.5 hours) if no block instances selected
    return 90
  }
  
  // LEARNING: Sum baseTime from all part instances across all block instances
  // WHY: Duration accumulates from base service + property type block + availability options
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
  
  // Return calculated duration or default to 90 minutes if sum is 0
  return totalDuration > 0 ? totalDuration : 90
}

/**
 * @deprecated Use calculateDurationFromBlockInstances instead
 * Calculate duration from part instances (legacy - single block instance)
 * LEARNING: Kept for backward compatibility during migration
 * WHY: Some code may still reference this function
 * PATTERN: Wraps calculateDurationFromBlockInstances with single block instance
 */
export function calculateDurationFromPartInstances(service: BookingBlockInstance | null): number {
  return calculateDurationFromBlockInstances(service ? [service] : [])
}

/**
 * Get calendar availability using mock Google Calendar free/busy data
 * LEARNING: Uses mock data generator to simulate Google Calendar API responses
 * WHY: Enables testing time slot filtering with blocked periods without real API integration
 * PATTERN: Generates mock busy periods and extracts them for use with fitTimeSlots()
 * 
 * FUTURE: When ready for real Google Calendar integration:
 * 1. Add environment/config flag (e.g., USE_MOCK_CALENDAR_DATA)
 * 2. Create googleCalendarApi.ts with real API calls
 * 3. Switch between mock and real based on flag
 * 4. Keep mock implementation for testing/development
 * 
 * @param dateRange - Object with start and end RFC3339 datetime strings
 * @returns Array of busy time ranges compatible with fitTimeSlots() busyTimes parameter
 * 
 * @example
 * ```typescript
 * const busyTimes = getCalendarAvailability({
 *   start: '2026-01-15T00:00:00Z',
 *   end: '2026-01-16T00:00:00Z'
 * })
 * // Returns: [{ start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' }, ...]
 * ```
 */
export function getCalendarAvailability(dateRange: { start: RFC3339DateTime; end: RFC3339DateTime }): Array<{ start: RFC3339DateTime; end: RFC3339DateTime }> {
  // LEARNING: Determine earliest start time for busy periods
  // WHY: If date is today, busy periods should start from current time (not midnight)
  // PATTERN: Check if start datetime is today, use current time if so
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)
  const startDateOnly = new Date(dateRange.start)
  startDateOnly.setUTCHours(0, 0, 0, 0)
  const isToday = startDateOnly.getTime() === todayStart.getTime()
  
  const earliestStartTime = isToday ? now.toISOString() : dateRange.start
  
  // LEARNING: Return empty if earliest start time is significantly in the past
  // WHY: Past dates can't render in UI, no busy periods needed
  // PATTERN: Check earliestStartTime (not dateRange.start) because for today we use current time
  const earliestStartDateTime = new Date(earliestStartTime)
  const timeDifferenceMs = now.getTime() - earliestStartDateTime.getTime()
  const isSignificantlyPast = timeDifferenceMs > 1000 // More than 1 second in the past
  
  if (isSignificantlyPast) {
    return [] // Past dates can't render in UI, no busy periods needed
  }
  
  // Validate date range
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.warn('[getCalendarAvailability] Invalid date range (NaN):', dateRange)
    return []
  }
  
  if (startDate >= endDate) {
    console.warn('[getCalendarAvailability] start must be before end:', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      dateRange
    })
    return []
  }
  
  try {
    const mockResponse = generateMockFreeBusyResponse(dateRange, {
      periodsPerCalendar: 3,  // 3 busy periods per calendar
      minDurationMinutes: 30,  // Minimum 30 minutes
      maxDurationMinutes: 120,  // Maximum 2 hours
      calendarIds: ['primary', 'work', 'personal']  // Multiple calendars
    })
    
    // Extract busy times from all calendars, merging overlapping periods
    // LEARNING: Merge overlapping periods to avoid double-counting
    // WHY: Multiple calendars may have overlapping events
    // PATTERN: Extract and merge for accurate availability calculation
    const busyTimes = extractBusyTimesFromFreeBusyResponse(mockResponse, true)
    

    return busyTimes
  } catch (error) {
    // LEARNING: Handle errors gracefully
    // WHY: Mock generation might fail with invalid date ranges
    // PATTERN: Log error and return empty array (all times available)
    console.error('[getCalendarAvailability] Error generating mock calendar data:', error)
    return []
  }
}

/**
 * Generate time slots for a date range
 * LEARNING: Now delegates to fitTimeSlots() for core logic
 * WHY: Single source of truth for time slot fitting
 * PATTERN: Thin wrapper that fetches settings and calls core utility
 * Session 1.3.7: Updated to use settings config instead of hardcoded values
 * Session 1.4.1: Updated to async to fetch settings from API
 * Session 1.4.14: Refactored to use fitTimeSlots() core utility
 * 
 * @param dateRange - Object with start and end ISO date strings
 * @param duration - Appointment duration in minutes
 * @param busyTimes - Array of busy time ranges to exclude (optional)
 * @returns Promise<TimeSlot[]> - Array of TimeSlot objects
 */
export async function generateTimeSlots(
  dateRange: { start: string; end: string },
  duration: number,
  busyTimes: Array<{ start: string; end: string }> = []
): Promise<TimeSlot[]> {
  // LEARNING: Get availability settings from API
  // WHY: Uses admin-configurable business hours and time increments from database instead of hardcoded values
  // PATTERN: Load settings asynchronously from API, use throughout function
  const settings = await getAvailabilitySettings()
  
  // LEARNING: Check if date is in the past
  // WHY: Past dates shouldn't generate slots
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = parseLocalDate(dateRange.start)
  const startDateOnly = new Date(startDate)
  startDateOnly.setHours(0, 0, 0, 0)
  
  // LEARNING: Use fitTimeSlots() core utility for slot generation
  // WHY: Single source of truth for time slot fitting logic
  // PATTERN: Delegate to core utility with appropriate boundaries
  const result = fitTimeSlots({
    startBoundary: dateRange.start,
    endBoundary: dateRange.end,
    duration,
    businessHours: settings.businessHours as BusinessHoursMap,
    minuteIncrement: settings.minuteIncrement,
    busyTimes,
    includeFlags: { onSite: false, clientPresent: false, moveable: false }
  })
  
  return result.slots
}

/**
 * Parse date string to local Date object
 * LEARNING: Parses dates in local timezone, not UTC
 * WHY: When we do new Date('2026-01-09'), it creates UTC midnight, which becomes previous day in timezones behind UTC
 * PATTERN: Extract date part and create Date object in local timezone
 * 
 * NOTE: This function is kept here for backward compatibility, but parseLocalDate from timeSlotFitter should be used for new code
 */
function parseLocalDate(dateString: string): Date {
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed, creates date at local midnight
}

