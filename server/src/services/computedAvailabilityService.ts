/**
 * Computed Availability Service
 * 
 * LEARNING: Orchestrates all API calls and data processing to return pre-computed availability data
 * WHY: Eliminates multiple client-side API calls and constraint extraction
 * PATTERN: Single service that coordinates multiple data sources
 * 
 * Phase 4: Server-Side Computed Availability Data Refactor
 * - Fetches settings from database
 * - Extracts constraints server-side
 * - Fetches calendar data (free-busy, events)
 * - Calculates drive times
 * - Pre-computes capacity hours
 * - Returns ComputedAvailabilityData
 */

import type {
  ComputedAvailabilityData,
  ComputedAvailabilityRequest,
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  BusyTimeRange,
  CalendarEvent,
  DefaultLocation,
  RFC3339DateTime,
} from '@shared/types/availabilityTypes'
import { BusinessSettings } from '../config/app.js'
import type { AvailabilitySettingsData } from '../db/models/admin/business_settings.js'
import {
  extractRangeConstraints,
  extractOverlapConstraints,
  extractCapacityConstraints,
} from './constraintExtractor.js'
import { getFreeBusy, getCalendarEvents } from './googleCalendarService.js'
import { calculateDriveTime } from './googleMapsService.js'
import { computeScheduledHoursForRange } from './capacityComputer.js'

const AVAILABILITY_SETTINGS_KEY = 'availability_settings'

/**
 * Extract calendar emails configured for reading (readFrom: true)
 * LEARNING: Returns emails from calendars marked for availability checking
 * WHY: Free-busy API calls need array of email strings for calendars to check
 * PATTERN: Filter calendars by readFrom flag, return email array
 * 
 * @param calendarConfig - CalendarConfig object (optional)
 * @returns Array of calendar email strings where readFrom is true
 */
function getReadFromCalendars(calendarConfig?: AvailabilitySettingsData['calendarConfig']): string[] {
  if (!calendarConfig || !calendarConfig.enabled || !Array.isArray(calendarConfig.calendars)) {
    return []
  }
  
  return calendarConfig.calendars
    .filter(entry => entry.readFrom && entry.email && entry.email.trim() !== '')
    .map(entry => entry.email.trim())
}

/**
 * Separate calendar events by eventType
 * LEARNING: Distinguishes regular events from out-of-office events
 * WHY: Out-of-office events need different handling (merged into busy periods, not used for drive time)
 * PATTERN: Filter events by eventType property
 * 
 * @param events - Array of calendar events
 * @returns Object with regularEvents and outOfOfficeEvents arrays
 */
function separateEventTypes(events: CalendarEvent[]): {
  regularEvents: CalendarEvent[]
  outOfOfficeEvents: CalendarEvent[]
} {
  const regularEvents: CalendarEvent[] = []
  const outOfOfficeEvents: CalendarEvent[] = []
  
  for (const event of events) {
    if (event.eventType === 'outOfOffice') {
      outOfOfficeEvents.push(event)
    } else {
      regularEvents.push(event)
    }
  }
  
  return { regularEvents, outOfOfficeEvents }
}

/**
 * Merge out-of-office events into busy periods
 * LEARNING: Converts out-of-office events to BusyTimeRange and merges with free-busy data
 * WHY: Out-of-office events represent unavailable time, same as busy periods
 * PATTERN: Convert events to BusyTimeRange format and combine arrays
 * 
 * @param freeBusyPeriods - Busy periods from free-busy query
 * @param outOfOfficeEvents - Out-of-office calendar events
 * @returns Combined array of busy periods
 */
function mergeOutOfOfficeIntoBusyPeriods(
  freeBusyPeriods: BusyTimeRange[],
  outOfOfficeEvents: CalendarEvent[]
): BusyTimeRange[] {
  const outOfOfficePeriods: BusyTimeRange[] = outOfOfficeEvents.map(event => ({
    start: event.start as RFC3339DateTime,
    end: event.end as RFC3339DateTime,
    placeId: event.placeId,
    source: 'outOfOffice',  // Tag out-of-office events with their source
  }))
  
  return [...freeBusyPeriods, ...outOfOfficePeriods]
}

/**
 * Calculate drive times for all dates in range
 * LEARNING: Pre-computes drive times between default location and first/last events per day
 * WHY: Eliminates client-side drive time API calls
 * PATTERN: Group events by date, calculate drive times per day
 * 
 * @param calendarEvents - Regular calendar events (with placeId)
 * @param defaultLocation - Default location (home/office)
 * @param placeId - Property placeId for drive time calculations
 * @param dateRange - Date range to calculate drive times for
 * @returns Record mapping date strings (YYYY-MM-DD) to drive time minutes
 */
async function calculateDriveTimesForRange(
  calendarEvents: CalendarEvent[],
  defaultLocation: DefaultLocation | undefined,
  placeId: string | undefined,
  dateRange: { start: string; end: string }
): Promise<Record<string, { driveTimeTo?: number; driveTimeFrom?: number }>> {
  const driveTimesByDate: Record<string, { driveTimeTo?: number; driveTimeFrom?: number }> = {}
  
  // If no placeId or defaultLocation, return empty
  if (!placeId || !defaultLocation) {
    return driveTimesByDate
  }
  
  // Filter events to only those with placeId (needed for drive time calculations)
  const eventsWithPlaceId = calendarEvents.filter(event => event.placeId)
  
  if (eventsWithPlaceId.length === 0) {
    return driveTimesByDate
  }
  
  // Group events by date
  const eventsByDate = new Map<string, CalendarEvent[]>()
  for (const event of eventsWithPlaceId) {
    const date = event.start.split('T')[0]
    if (!eventsByDate.has(date)) {
      eventsByDate.set(date, [])
    }
    eventsByDate.get(date)!.push(event)
  }
  
  // Calculate drive times for each date
  for (const [date, events] of eventsByDate.entries()) {
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => a.start.localeCompare(b.start))
    
    const firstEvent = sortedEvents[0]
    const lastEvent = sortedEvents[sortedEvents.length - 1]
    
    const driveTimes: { driveTimeTo?: number; driveTimeFrom?: number } = {}
    
    // Calculate driveTimeTo (from default location to first event)
    if (firstEvent.placeId) {
      try {
        const result = await calculateDriveTime(
          { placeId: defaultLocation.placeId },
          { placeId: firstEvent.placeId },
          true // useTraffic
        )
        if (result) {
          driveTimes.driveTimeTo = result.durationMinutes
        }
      } catch (error) {
        console.error(`[ComputedAvailabilityService] Failed to calculate driveTimeTo for ${date}:`, error)
        // Continue without driveTimeTo
      }
    }
    
    // Calculate driveTimeFrom (from last event to default location)
    if (lastEvent.placeId) {
      try {
        const result = await calculateDriveTime(
          { placeId: lastEvent.placeId },
          { placeId: defaultLocation.placeId },
          true // useTraffic
        )
        if (result) {
          driveTimes.driveTimeFrom = result.durationMinutes
        }
      } catch (error) {
        console.error(`[ComputedAvailabilityService] Failed to calculate driveTimeFrom for ${date}:`, error)
        // Continue without driveTimeFrom
      }
    }
    
    if (driveTimes.driveTimeTo !== undefined || driveTimes.driveTimeFrom !== undefined) {
      driveTimesByDate[date] = driveTimes
    }
  }
  
  return driveTimesByDate
}

/**
 * Convert free-busy response to BusyTimeRange array
 * LEARNING: Transforms Google Calendar API response format to BusyTimeRange[]
 * WHY: Standardizes busy period format for slot generation
 * PATTERN: Flatten calendar-specific busy arrays into single array
 * 
 * @param freeBusyResponse - Free-busy response from Google Calendar API
 * @returns Array of BusyTimeRange objects
 */
function convertFreeBusyToBusyPeriods(freeBusyResponse: {
  calendars: {
    [email: string]: {
      busy: Array<{ start: string; end: string }>
    }
  }
}): BusyTimeRange[] {
  const busyPeriods: BusyTimeRange[] = []
  
  for (const calendarData of Object.values(freeBusyResponse.calendars)) {
    for (const busyPeriod of calendarData.busy || []) {
      busyPeriods.push({
        start: busyPeriod.start as RFC3339DateTime,
        end: busyPeriod.end as RFC3339DateTime,
        source: 'freeBusy',  // From Google Calendar FreeBusy API - we only know "this time is busy"
      })
    }
  }
  
  return busyPeriods
}

/**
 * Compute availability data for a date range
 * LEARNING: Main orchestrator function that coordinates all data fetching and processing
 * WHY: Single entry point for all availability computation
 * PATTERN: Sequential and parallel operations where possible
 * 
 * @param request - ComputedAvailabilityRequest with date range, placeId, duration, and dataSource
 * @returns ComputedAvailabilityData with all pre-computed availability information
 */
export async function computeAvailabilityData(
  request: ComputedAvailabilityRequest
): Promise<ComputedAvailabilityData> {
  const startTime = Date.now()
  
  // 1. Fetch settings from database
  const setting = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  })
  
  if (!setting) {
    throw new Error(`Settings not found for key: ${AVAILABILITY_SETTINGS_KEY}`)
  }
  
  const settings: AvailabilitySettingsData = setting.settingValue
  
  // 2. Extract constraints server-side
  const rangeConstraints = extractRangeConstraints(settings)
  const overlapConstraints = extractOverlapConstraints(settings)
  const capacityConstraints = extractCapacityConstraints(settings)
  
  // 3. Get calendar emails for free-busy query
  const calendarEmails = getReadFromCalendars(settings.calendarConfig)
  
  // 4. Fetch calendar data (free-busy and events) in parallel
  // LEARNING: FreeBusy accepts multiple emails, but Events API requires one call per calendar
  // WHY: We need events from ALL calendars (for OOO detection, drive time placeIds, event details)
  // PATTERN: Parallel fetch - one FreeBusy call + one Events call per calendar email
  const calendarEnabled = calendarEmails.length > 0 && settings.calendarConfig?.enabled
  
  const [freeBusyResponse, ...eventsResponses] = await Promise.all([
    // Free-busy query (accepts all calendar emails at once)
    calendarEnabled
      ? getFreeBusy(calendarEmails, request.dateRange.start, request.dateRange.end, request.dataSource === 'none')
      : Promise.resolve({ calendars: {}, _meta: { source: 'empty' as const } }),
    // Calendar events query - one call per calendar email (all in parallel)
    ...calendarEmails.map(email =>
      calendarEnabled
        ? getCalendarEvents(email, request.dateRange.start, request.dateRange.end)
        : Promise.resolve({ events: [], _meta: { source: 'empty' as const } })
    ),
  ])
  
  // 5. Convert free-busy response to BusyTimeRange array
  const freeBusyPeriods = convertFreeBusyToBusyPeriods(freeBusyResponse)
  
  // 6. Convert calendar events from ALL calendars to CalendarEvent array
  // LEARNING: Flatten events from all calendar responses, deduplicate by event ID
  // WHY: Same event might appear on multiple calendars (e.g., shared events)
  const seenEventIds = new Set<string>()
  const allCalendarEvents: CalendarEvent[] = eventsResponses.flatMap(response =>
    response.events
      .filter(event => {
        if (seenEventIds.has(event.id)) return false
        seenEventIds.add(event.id)
        return true
      })
      .map(event => ({
        id: event.id,
        start: event.start,
        end: event.end,
        placeId: event.placeId,
        summary: event.summary,
        eventType: event.eventType || 'default',
      }))
  )
  
  // 7. Separate event types
  const { regularEvents, outOfOfficeEvents } = separateEventTypes(allCalendarEvents)
  
  // 8. Merge out-of-office events into busy periods
  const busyPeriods = mergeOutOfOfficeIntoBusyPeriods(freeBusyPeriods, outOfOfficeEvents)
  
  // 9. Calculate drive times (if placeId provided)
  const driveTimesByDate = await calculateDriveTimesForRange(
    regularEvents,
    settings.defaultLocation,
    request.placeId,
    request.dateRange
  )
  
  // 10. Pre-compute capacity hours
  const scheduledHoursByKey = await computeScheduledHoursForRange(
    request.dateRange,
    capacityConstraints
  )
  
  // 11. Assemble and return ComputedAvailabilityData
  const computedData: ComputedAvailabilityData = {
    // Constraints (extracted server-side)
    rangeConstraints,
    overlapConstraints,
    capacityConstraints,
    minuteIncrement: settings.minuteIncrement,
    timezone: settings.timezone,
    durationRounding: settings.durationRounding,
    
    // Calendar data
    busyPeriods,
    calendarEvents: regularEvents,
    outOfOfficeEvents,
    
    // Drive times
    driveTimesByDate,
    
    // Capacity hours
    scheduledHoursByKey,
    
    // Metadata
    _meta: {
      dateRange: request.dateRange,
      placeId: request.placeId,
      defaultLocation: settings.defaultLocation,
      generatedAt: new Date().toISOString(),
      cacheStatus: {
        freeBusy: freeBusyResponse._meta?.source === 'cache' ? 'hit' : 'miss',
        events: eventsResponses.every(r => r._meta?.source === 'cache') ? 'hit' : 'miss',
        driveTime: 'miss', // Drive times are always calculated fresh (not cached separately)
      },
    },
  }
  
  const duration = Date.now() - startTime
  console.log(`[ComputedAvailabilityService] Computed availability data in ${duration}ms`)
  
  return computedData
}
