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
 * - Returns ComputedSlotAvailabilityData (slotsByDay, constraints, events, _meta)
 */

import type {
  ComputedSlotAvailabilityData,
  ComputedAvailabilityRequest,
  Constraint,
  CapacityConstraint,
  CalendarEvent,
  BusinessHoursConfig,
} from '../../../shared/types/availabilityTypes.js'
import { RANGE_CONSTRAINT_TYPES } from '../../../shared/constants/constraintConstants.js'
import { computeSlotsForDateRange } from './slotComputationService.js'
import { BusinessSettings } from '../config/app.js'
import type { AvailabilitySettingsData } from '../db/models/admin/business_settings.js'
import {
  extractConstraints,
} from './constraintExtractor.js'
import { groupConstraintsByCategory } from '../../../shared/utils/constraintUtils.js'
import { getCalendarEvents } from './google/calendar/eventsService.js'
import { calculateRouteMatrix } from './google/maps/routesApiService.js'
import { MapsApiError } from './google/maps/mapsErrorHandler.js'
import { getCachedDriveTime, cacheDriveTime } from './driveTimeCache.js'
import { withRetry } from './google/shared/googleApiRetry.js'
import type { RouteLocation } from './google/maps/mapsTypes.js'
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
 * Calculate drive times for all unique placeIds in events
 * LEARNING: Pre-computes drive times between candidate location and each event location (event->candidate and candidate->event)
 * WHY: Eliminates client-side drive time API calls, reduces Routes API calls from 2N to 2 (batched), skips entirely until candidate placeId exists
 * PATTERN: Gate on candidate placeId, check cache per pair, batch uncached pairs into Nx1 and 1xN matrix calls
 *
 * @param calendarEvents - Regular calendar events (with placeId)
 * @param candidatePlaceId - Candidate/customer placeId - if not provided, skips all drive time calculations (lazy loading)
 * @returns Record mapping event placeId strings to drive time minutes (empty if no candidate placeId)
 */
async function calculateDriveTimesForPlaceIds(
  calendarEvents: CalendarEvent[],
  candidatePlaceId: string | undefined
): Promise<Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>> {
  // Gate: Skip drive time calculations if no candidate placeId exists
  if (!candidatePlaceId) {
    logger.debug('Skipping drive time calculation: no candidate placeId provided')
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

  const candidateLocationRoute: RouteLocation = { placeId: candidatePlaceId }

  // Check cache for each pair and separate cached vs uncached
  const results: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }> = {}
  const uncachedToPlaceIds: string[] = []
  const uncachedFromPlaceIds: string[] = []

  for (const eventPlaceId of uniquePlaceIds) {
    const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }

    // driveToCandidate = event -> candidate (time to arrive at candidate from this event)
    const cachedTo = getCachedDriveTime(eventLocationRoute, candidateLocationRoute)
    if (cachedTo) {
      results[eventPlaceId] = {
        ...results[eventPlaceId],
        driveToCandidate: Math.ceil(cachedTo.durationSeconds / 60),
      }
    } else {
      uncachedToPlaceIds.push(eventPlaceId)
    }

    // driveFromCandidate = candidate -> event (time from candidate to this event)
    const cachedFrom = getCachedDriveTime(candidateLocationRoute, eventLocationRoute)
    if (cachedFrom) {
      results[eventPlaceId] = {
        ...results[eventPlaceId],
        driveFromCandidate: Math.ceil(cachedFrom.durationSeconds / 60),
      }
    } else {
      uncachedFromPlaceIds.push(eventPlaceId)
    }
  }

  logger.debug('Drive time cache check', {
    totalPlaceIds: uniquePlaceIds.length,
    cachedTo: uniquePlaceIds.length - uncachedToPlaceIds.length,
    cachedFrom: uniquePlaceIds.length - uncachedFromPlaceIds.length,
    uncachedTo: uncachedToPlaceIds.length,
    uncachedFrom: uncachedFromPlaceIds.length,
  })

  const batchStartTime = Date.now()

  // Batch driveToCandidate: origins=[eventPlaceIds], destinations=[candidate] (event -> candidate)
  if (uncachedToPlaceIds.length > 0) {
    try {
      const uncachedToLocations: RouteLocation[] = uncachedToPlaceIds.map(pid => ({ placeId: pid }))
      const toResults = await withRetry(
        () => calculateRouteMatrix(uncachedToLocations, [candidateLocationRoute], true),
        (error) => error instanceof MapsApiError && error.retryable
      )

      for (const result of toResults) {
        if (result.status === 'OK' && result.durationSeconds > 0) {
          const eventPlaceId = uncachedToPlaceIds[result.originIndex]
          const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }

          cacheDriveTime(
            eventLocationRoute,
            candidateLocationRoute,
            result.durationSeconds,
            result.distanceMeters
          )

          results[eventPlaceId] = {
            ...results[eventPlaceId],
            driveToCandidate: Math.ceil(result.durationSeconds / 60),
          }
        } else if (result.status !== 'OK') {
          logger.warn(`Route not found for driveToCandidate: placeId ${uncachedToPlaceIds[result.originIndex]}`, {
            status: result.status,
            condition: result.condition,
          })
        }
      }
    } catch (error) {
      logger.error('Failed to batch calculate driveToCandidate', { error, placeIds: uncachedToPlaceIds })
    }
  }

  // Batch driveFromCandidate: origins=[candidate], destinations=[eventPlaceIds] (candidate -> event)
  if (uncachedFromPlaceIds.length > 0) {
    try {
      const uncachedFromLocations: RouteLocation[] = uncachedFromPlaceIds.map(pid => ({ placeId: pid }))
      const fromResults = await withRetry(
        () => calculateRouteMatrix([candidateLocationRoute], uncachedFromLocations, true),
        (error) => error instanceof MapsApiError && error.retryable
      )

      for (const result of fromResults) {
        if (result.status === 'OK' && result.durationSeconds > 0) {
          const eventPlaceId = uncachedFromPlaceIds[result.destinationIndex]
          const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }

          cacheDriveTime(
            candidateLocationRoute,
            eventLocationRoute,
            result.durationSeconds,
            result.distanceMeters
          )

          results[eventPlaceId] = {
            ...results[eventPlaceId],
            driveFromCandidate: Math.ceil(result.durationSeconds / 60),
          }
        } else if (result.status !== 'OK') {
          logger.warn(`Route not found for driveFromCandidate: placeId ${uncachedFromPlaceIds[result.destinationIndex]}`, {
            status: result.status,
            condition: result.condition,
          })
        }
      }
    } catch (error) {
      logger.error('Failed to batch calculate driveFromCandidate', { error, placeIds: uncachedFromPlaceIds })
    }
  }

  const batchDuration = Date.now() - batchStartTime
  if (uncachedToPlaceIds.length > 0 || uncachedFromPlaceIds.length > 0) {
    logger.info(`Batched drive time calculation complete`, {
      durationMs: batchDuration,
      totalPlaceIds: uniquePlaceIds.length,
      apiCallsMade: (uncachedToPlaceIds.length > 0 ? 1 : 0) + (uncachedFromPlaceIds.length > 0 ? 1 : 0),
    })
  }

  return results
}

/**
 * Compute availability data for a date range
 * LEARNING: Main orchestrator function that coordinates all data fetching and processing
 * WHY: Single entry point for all availability computation
 * PATTERN: Sequential and parallel operations where possible
 * 
 * @param request - ComputedAvailabilityRequest with date range, candidatePlaceId, duration, and dataSource
 * @returns ComputedSlotAvailabilityData with slotsByDay and metadata
 */
export async function computeAvailabilityData(
  request: ComputedAvailabilityRequest
): Promise<ComputedSlotAvailabilityData> {
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
  
  // 6. Separate event types (for drive time and slot computation)
  const { regularEvents, outOfOfficeEvents } = separateEventTypes(allCalendarEvents)

  // 7. Calculate drive times (if candidatePlaceId provided)
  // Only regular events (events with location); OOO does not get drive times
  const driveTimesByPlaceId = await calculateDriveTimesForPlaceIds(
    regularEvents,
    request.candidatePlaceId
  )

  // 8. Pre-compute capacity hours
  const scheduledHoursByKey = await computeScheduledHoursForRange(
    request.dateRange,
    capacity
  )
  
  // 9. Enrich capacity constraints with scheduled hours
  const enrichedConstraints = constraints.map(constraint => {
    if (constraint.category !== 'capacity') return constraint
    const relevantHours: Record<string, number> = {}
    for (const [key, hours] of Object.entries(scheduledHoursByKey)) {
      if (key.startsWith(constraint.type + ':')) {
        relevantHours[key] = hours
      }
    }
    return { ...constraint, scheduledHours: relevantHours }
  })

  // 10. Get business hours for slot computation (required for day boundaries)
  const businessHoursConstraint = enrichedConstraints.find(
    c => c.category === 'range' && c.type === RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS
  ) as import('../../../shared/types/availabilityTypes.js').RangeConstraint | undefined
  const businessHoursConfig = businessHoursConstraint?.config as BusinessHoursConfig | undefined

  // 11. Apply overlapSources enforcement to out-of-office events
  // LEARNING: Check settings.overlapSources.outOfOffice.enforcement before passing OOO events to slot computation
  // WHY: Allows admin to toggle OOO blocking without changing data fetching — events are still returned for display
  // PATTERN: 'off' = don't block at all, 'flexible' = warn only, 'hard' = block (default)
  const oooEnforcement = settings.overlapSources?.outOfOffice?.enforcement ?? 'hard'
  const effectiveOutOfOfficeEvents = oooEnforcement === 'off' ? [] : outOfOfficeEvents
  const effectiveOooEnforcement: 'flexible' | 'hard' = oooEnforcement === 'flexible' ? 'flexible' : 'hard'

  // 12. Compute slots per day (range, overlap, capacity checked server-side with event-level context)
  const slotsByDay = businessHoursConfig
    ? computeSlotsForDateRange(
        request.dateRange,
        request.duration,
        settings.minuteIncrement,
        enrichedConstraints,
        regularEvents,
        effectiveOutOfOfficeEvents,
        driveTimesByPlaceId,
        businessHoursConfig,
        settings.timezone ?? 'UTC',
        new Date(),
        effectiveOooEnforcement
      )
    : {}

  // 12. Assemble and return ComputedSlotAvailabilityData
  const computedData: ComputedSlotAvailabilityData = {
    slotsByDay,
    constraints: enrichedConstraints,
    minuteIncrement: settings.minuteIncrement,
    timezone: settings.timezone,
    durationRounding: settings.durationRounding,
    calendarEvents: regularEvents,
    outOfOfficeEvents,
    _meta: {
      dateRange: request.dateRange,
      candidatePlaceId: request.candidatePlaceId,
      defaultLocation: settings.defaultLocation,
      generatedAt: new Date().toISOString(),
      cacheStatus: {
        events: eventsResponses.every(r => r._meta?.source === 'cache') ? 'hit' : 'miss',
      },
    },
  }

  const duration = Date.now() - startTime
  logger.info(`Computed slot availability in ${duration}ms`)

  return computedData
}
