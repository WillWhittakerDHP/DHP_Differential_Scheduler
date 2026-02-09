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
 * - Fetches calendar events (Events API only - derives busy periods from events)
 * - Calculates drive times
 * - Pre-computes capacity hours
 * - Returns ComputedAvailabilityData
 */

import type {
  ComputedAvailabilityData,
  ComputedAvailabilityRequest,
  Constraint,
  CapacityConstraint,
  BusyTimeRange,
  CalendarEvent,
  DefaultLocation,
  RFC3339DateTime,
} from '../../../shared/types/availabilityTypes.js'
import { BusinessSettings } from '../config/app.js'
import type { AvailabilitySettingsData } from '../db/models/admin/business_settings.js'
import {
  extractConstraints,
} from './constraintExtractor.js'
import { groupConstraintsByCategory } from '../../../shared/utils/constraintUtils.js'
import { getCalendarEvents } from './google/calendar/eventsService.js'
import { calculateDriveTime } from './google/maps/routesApiService.js'
import { computeScheduledHoursForRange } from './capacityComputer.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('ComputedAvailabilityService')
const AVAILABILITY_SETTINGS_KEY = 'availability_settings'

/**
 * Extract calendar emails configured for reading (readFrom: true)
 * LEARNING: Returns emails from calendars marked for availability checking
 * WHY: Events API calls need array of email strings for calendars to check
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
 * Convert calendar events to busy periods
 * LEARNING: Converts opaque calendar events to BusyTimeRange, filtering out transparent events
 * WHY: Events API provides transparency field - opaque events block time, transparent events don't
 * PATTERN: Filter by transparency, tag by eventType
 * 
 * @param allEvents - All calendar events (regular + out-of-office)
 * @returns Array of BusyTimeRange objects for events that block time
 */
function convertEventsToBusyPeriods(allEvents: CalendarEvent[]): BusyTimeRange[] {
  const busyPeriods: BusyTimeRange[] = []
  
  for (const event of allEvents) {
    // Skip transparent events - they don't block time (marked "Show as: Free")
    // Default to 'opaque' if transparency is not set (backward compatibility)
    if (event.transparency === 'transparent') {
      continue
    }
    
    // Tag events by their type for violation attribution
    const source: 'event' | 'outOfOffice' = event.eventType === 'outOfOffice' ? 'outOfOffice' : 'event'
    
    busyPeriods.push({
      start: event.start as RFC3339DateTime,
      end: event.end as RFC3339DateTime,
      placeId: event.placeId,
      source,
    })
  }
  
  return busyPeriods
}

/**
 * Calculate drive times for all unique placeIds in events
 * LEARNING: Pre-computes drive times between default location and each unique event location
 * WHY: Eliminates client-side drive time API calls, calculates for all events (not just first/last per date)
 * PATTERN: Collect unique placeIds, calculate drive times in parallel per placeId
 * 
 * @param calendarEvents - Regular calendar events (with placeId)
 * @param defaultLocation - Default location (home/office)
 * @param placeId - Property placeId for drive time calculations (unused, kept for API compatibility)
 * @returns Record mapping placeId strings to drive time minutes
 */
async function calculateDriveTimesForPlaceIds(
  calendarEvents: CalendarEvent[],
  defaultLocation: DefaultLocation | undefined,
  placeId: string | undefined
): Promise<Record<string, { driveTimeTo?: number; driveTimeFrom?: number }>> {
  // If no defaultLocation, return empty
  if (!defaultLocation) {
    return {}
  }
  
  // Collect unique placeIds from events
  const uniquePlaceIds = [...new Set(
    calendarEvents
      .map(event => event.placeId)
      .filter((placeId): placeId is string => !!placeId)
  )]
  
  if (uniquePlaceIds.length === 0) {
    return {}
  }
  
  // Calculate drive times in parallel (cache handles deduplication)
  const results = await Promise.all(
    uniquePlaceIds.map(async (eventPlaceId) => {
      try {
        const [toResult, fromResult] = await Promise.all([
          calculateDriveTime(
            { placeId: defaultLocation.placeId },
            { placeId: eventPlaceId },
            true // useTraffic
          ).catch((error) => {
            logger.error(`Failed to calculate driveTimeTo for placeId ${eventPlaceId}:`, error)
            return null
          }),
          calculateDriveTime(
            { placeId: eventPlaceId },
            { placeId: defaultLocation.placeId },
            true // useTraffic
          ).catch((error) => {
            logger.error(`Failed to calculate driveTimeFrom for placeId ${eventPlaceId}:`, error)
            return null
          }),
        ])
        
        return {
          placeId: eventPlaceId,
          driveTimeTo: toResult?.durationMinutes,
          driveTimeFrom: fromResult?.durationMinutes,
        }
      } catch (error) {
        logger.error(`Failed to calculate drive times for placeId ${eventPlaceId}:`, error)
        return null
      }
    })
  )
  
  // Build lookup record, filtering out null results
  const driveTimesByPlaceId: Record<string, { driveTimeTo?: number; driveTimeFrom?: number }> = {}
  for (const result of results) {
    if (result && (result.driveTimeTo !== undefined || result.driveTimeFrom !== undefined)) {
      driveTimesByPlaceId[result.placeId] = {
        driveTimeTo: result.driveTimeTo,
        driveTimeFrom: result.driveTimeFrom,
      }
    }
  }
  
  return driveTimesByPlaceId
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
  
  // 2. Extract constraints server-side (unified array)
  const constraints = extractConstraints(settings)
  
  // Group constraints by category for category-specific processing
  const { capacity } = groupConstraintsByCategory(constraints)
  
  // 3. Get calendar emails for events query
  const calendarEmails = getReadFromCalendars(settings.calendarConfig)
  
  // 4. Fetch calendar events (Events API only - no FreeBusy needed)
  // LEARNING: Events API provides transparency field to distinguish "busy" vs "free" events
  // WHY: Single data source eliminates duplication and provides richer attribution
  // PATTERN: One Events call per calendar email (all in parallel)
  const calendarEnabled = calendarEmails.length > 0 && settings.calendarConfig?.enabled
  
  const eventsResponses = await Promise.all(
    calendarEmails.map(email =>
      calendarEnabled
        ? getCalendarEvents(email, request.dateRange.start, request.dateRange.end)
        : Promise.resolve({ events: [], _meta: { source: 'empty' as const } })
    )
  )
  
  // 5. Convert calendar events from ALL calendars to CalendarEvent array
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
        transparency: event.transparency,
      }))
  )
  
  // 6. Convert events to busy periods (filters transparent events, tags by source)
  const busyPeriods = convertEventsToBusyPeriods(allCalendarEvents)
  
  // 7. Separate event types (for drive time calculations and response structure)
  const { regularEvents, outOfOfficeEvents } = separateEventTypes(allCalendarEvents)
  
  // 9. Calculate drive times (if placeId provided)
  const driveTimesByPlaceId = await calculateDriveTimesForPlaceIds(
    regularEvents,
    settings.defaultLocation,
    request.placeId
  )
  
  // 10. Enrich busy periods with drive times
  // LEARNING: Stamp drive time values directly onto each BusyTimeRange
  // WHY: Unifies drive time data with busy period pipeline, eliminates separate data path
  // PATTERN: Map over busy periods, look up drive times by placeId, attach to period
  const enrichedBusyPeriods = busyPeriods.map(bp => {
    if (!bp.placeId) return bp
    const driveTimes = driveTimesByPlaceId[bp.placeId]
    if (!driveTimes) return bp
    return {
      ...bp,
      driveTimeTo: driveTimes.driveTimeTo,
      driveTimeFrom: driveTimes.driveTimeFrom,
    }
  })
  
  // 11. Pre-compute capacity hours
  const scheduledHoursByKey = await computeScheduledHoursForRange(
    request.dateRange,
    capacity
  )
  
  // 12. Enrich capacity constraints with scheduled hours
  const enrichedConstraints = constraints.map(constraint => {
    if (constraint.category !== 'capacity') return constraint
    // Filter hours to only keys matching this constraint's type
    const relevantHours: Record<string, number> = {}
    for (const [key, hours] of Object.entries(scheduledHoursByKey)) {
      if (key.startsWith(constraint.type + ':')) {
        relevantHours[key] = hours
      }
    }
    return { ...constraint, scheduledHours: relevantHours }
  })
  
  // 13. Assemble and return ComputedAvailabilityData
  const computedData: ComputedAvailabilityData = {
    // Constraints (extracted server-side, unified array, enriched with scheduled hours)
    constraints: enrichedConstraints,
    minuteIncrement: settings.minuteIncrement,
    timezone: settings.timezone,
    durationRounding: settings.durationRounding,
    
    // Calendar data (busy periods enriched with drive times)
    busyPeriods: enrichedBusyPeriods,
    calendarEvents: regularEvents,
    outOfOfficeEvents,
    
    // Metadata
    _meta: {
      dateRange: request.dateRange,
      placeId: request.placeId,
      defaultLocation: settings.defaultLocation,
      generatedAt: new Date().toISOString(),
      cacheStatus: {
        events: eventsResponses.every(r => r._meta?.source === 'cache') ? 'hit' : 'miss',
      },
    },
  }
  
  const duration = Date.now() - startTime
  logger.info(`Computed availability data in ${duration}ms`)
  
  return computedData
}
