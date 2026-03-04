
import type {
  ComputedSlotAvailabilityData,
  ComputedAvailabilityRequest,
  ComputedSlot,
  CalendarEvent,
  BusinessHoursConfig,
  Constraint,
  RangeConstraint,
} from '../../../shared/types/availabilityTypes.js'
import { RANGE_CONSTRAINT_TYPES } from '../../../shared/constants/constraintConstants.js'
import { computeSlotsForDateRange } from './slotComputationService.js'
import { AppointmentAttendee, BusinessSettings } from '../config/app.js'
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
import { AVAILABILITY_SETTINGS_KEY } from '../routes/internal/appointments/appointmentConstants.js'
import { partitionByEventType } from '../utils/availabilities/availabilityPrimitives.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('ComputedAvailabilityService')

const CACHE_STATUS_HIT = 'hit' as const
const CACHE_STATUS_MISS = 'miss' as const

function getReadFromCalendars(calendarConfig?: AvailabilitySettingsData['calendarConfig']): string[] {
  if (!calendarConfig || !calendarConfig.enabled || !Array.isArray(calendarConfig.calendars)) {
    return []
  }
  
  return calendarConfig.calendars
    .filter(entry => entry.readFrom && entry.email && entry.email.trim() !== '')
    .map(entry => entry.email.trim())
}

async function calculateDriveTimesForPlaceIds(
  calendarEvents: CalendarEvent[],
  candidatePlaceId: string | undefined
): Promise<Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>> {
  if (!candidatePlaceId) {
    logger.debug('Skipping drive time calculation: no candidate placeId provided')
    return {}
  }

  const uniquePlaceIds = [...new Set(
    calendarEvents
      .map(event => event.placeId)
      .filter((placeId): placeId is string => !!placeId)
  )]

  if (uniquePlaceIds.length === 0) {
    return {}
  }

  const candidateLocationRoute: RouteLocation = { placeId: candidatePlaceId }

  type CacheAcc = {
    results: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>
    uncachedTo: string[]
    uncachedFrom: string[]
  }
  const { results, uncachedTo: uncachedToPlaceIds, uncachedFrom: uncachedFromPlaceIds } =
    uniquePlaceIds.reduce<CacheAcc>(
      (acc, eventPlaceId) => {
        const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }
        const cachedTo = getCachedDriveTime(eventLocationRoute, candidateLocationRoute)
        const cachedFrom = getCachedDriveTime(candidateLocationRoute, eventLocationRoute)
        const existingResult = acc.results[eventPlaceId]
        const nextEntry = {
          ...(existingResult !== undefined && existingResult !== null ? existingResult : {}),
          ...(cachedTo
            ? // @audit-allow:hardcoding:fieldMapping - API drive-time payload shape
              { driveToCandidate: Math.ceil(cachedTo.durationSeconds / 60) }
            : {}),
          ...(cachedFrom
            ? // @audit-allow:hardcoding:fieldMapping - API drive-time payload shape
              { driveFromCandidate: Math.ceil(cachedFrom.durationSeconds / 60) }
            : {}),
        }
        return {
          results: { ...acc.results, [eventPlaceId]: nextEntry },
          uncachedTo: cachedTo ? acc.uncachedTo : [...acc.uncachedTo, eventPlaceId],
          uncachedFrom: cachedFrom ? acc.uncachedFrom : [...acc.uncachedFrom, eventPlaceId],
        }
      },
      { results: {}, uncachedTo: [], uncachedFrom: [] }
    )

  logger.debug('Drive time cache check', {
    totalPlaceIds: uniquePlaceIds.length,
    cachedTo: uniquePlaceIds.length - uncachedToPlaceIds.length,
    cachedFrom: uniquePlaceIds.length - uncachedFromPlaceIds.length,
    uncachedTo: uncachedToPlaceIds.length,
    uncachedFrom: uncachedFromPlaceIds.length,
  })

  const batchStartTime = Date.now()

  let resultsAfterTo = results
  if (uncachedToPlaceIds.length > 0) {
    try {
      const uncachedToLocations: RouteLocation[] = uncachedToPlaceIds.map((pid) => ({ placeId: pid }))
      const toResults = await withRetry(
        () => calculateRouteMatrix(uncachedToLocations, [candidateLocationRoute], true),
        (error) => error instanceof MapsApiError && error.retryable
      )
      const toUpdates = toResults.reduce<
        Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>
      >((acc, result) => {
        if (result.status === 'OK' && result.durationSeconds > 0) {
          const eventPlaceId = uncachedToPlaceIds[result.originIndex]
          const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }
          cacheDriveTime(
            eventLocationRoute,
            candidateLocationRoute,
            result.durationSeconds,
            result.distanceMeters
          )
          return {
            ...acc,
            [eventPlaceId]: {
              ...results[eventPlaceId],
              ...acc[eventPlaceId],
              driveToCandidate: Math.ceil(result.durationSeconds / 60),
            },
          }
        }
        if (result.status !== 'OK') {
          logger.warn(`Route not found for driveToCandidate: placeId ${uncachedToPlaceIds[result.originIndex]}`, {
            status: result.status,
            condition: result.condition,
          })
        }
        return acc
      }, {})
      resultsAfterTo = { ...results, ...toUpdates }
    } catch (error) {
      logger.error('Failed to batch calculate driveToCandidate', { error, placeIds: uncachedToPlaceIds })
    }
  }

  let resultsFinal = resultsAfterTo
  if (uncachedFromPlaceIds.length > 0) {
    try {
      const uncachedFromLocations: RouteLocation[] = uncachedFromPlaceIds.map((pid) => ({ placeId: pid }))
      const fromResults = await withRetry(
        () => calculateRouteMatrix([candidateLocationRoute], uncachedFromLocations, true),
        (error) => error instanceof MapsApiError && error.retryable
      )
      const fromUpdates = fromResults.reduce<
        Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>
      >((acc, result) => {
        if (result.status === 'OK' && result.durationSeconds > 0) {
          const eventPlaceId = uncachedFromPlaceIds[result.destinationIndex]
          const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }
          cacheDriveTime(
            candidateLocationRoute,
            eventLocationRoute,
            result.durationSeconds,
            result.distanceMeters
          )
          return {
            ...acc,
            [eventPlaceId]: {
              ...resultsAfterTo[eventPlaceId],
              ...acc[eventPlaceId],
              driveFromCandidate: Math.ceil(result.durationSeconds / 60),
            },
          }
        }
        if (result.status !== 'OK') {
          logger.warn(
            `Route not found for driveFromCandidate: placeId ${uncachedFromPlaceIds[result.destinationIndex]}`,
            { status: result.status, condition: result.condition }
          )
        }
        return acc
      }, {})
      resultsFinal = { ...resultsAfterTo, ...fromUpdates }
    } catch (error) {
      logger.error('Failed to batch calculate driveFromCandidate', {
        error,
        placeIds: uncachedFromPlaceIds,
      })
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

  return resultsFinal
}

async function fetchAvailabilitySettings(): Promise<AvailabilitySettingsData> {
  const setting = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  })
  if (!setting) {
    throw new Error(`Settings not found for key: ${AVAILABILITY_SETTINGS_KEY}`)
  }
  return setting.settingValue
}

async function fetchAndDedupeCalendarEvents(
  calendarEmails: string[],
  dateRange: { start: string; end: string },
  calendarEnabled: boolean
): Promise<{ events: CalendarEvent[]; responses: Awaited<ReturnType<typeof getCalendarEvents>>[] }> {
  const eventsResponses = await Promise.all(
    calendarEmails.map((email) =>
      calendarEnabled
        ? getCalendarEvents(email, dateRange.start, dateRange.end)
        : Promise.resolve({ events: [], _meta: { source: 'empty' as const } })
    )
  )
  const seenEventIds = new Set<string>()
  const events: CalendarEvent[] = eventsResponses.flatMap((response) =>
    response.events
      .filter((event) => {
        if (seenEventIds.has(event.id)) return false
        seenEventIds.add(event.id)
        return true
      })
      .map((event) => ({
        id: event.id,
        start: event.start,
        end: event.end,
        placeId: event.placeId,
        summary: event.summary,
        eventType: event.eventType || 'default',
        transparency: event.transparency,
      }))
  )
  return { events, responses: eventsResponses }
}

function enrichCapacityConstraintsWithHours(
  constraints: Constraint[],
  scheduledHoursByKey: Record<string, number>,
  scheduledIncomeByKey?: Record<string, number>
): Constraint[] {
  return constraints.map((constraint) => {
    if (constraint.category !== 'capacity') return constraint
    const prefix = constraint.type + ':'
    const relevantHours = Object.fromEntries(
      Object.entries(scheduledHoursByKey).filter(([key]) => key.startsWith(prefix))
    )
    const relevantIncome =
      scheduledIncomeByKey != null
        ? Object.fromEntries(
            Object.entries(scheduledIncomeByKey).filter(([key]) => key.startsWith(prefix))
          )
        : undefined
    return {
      ...constraint,
      scheduledHours: relevantHours,
      ...(relevantIncome != null && Object.keys(relevantIncome).length > 0 ? { scheduledIncome: relevantIncome } : {}),
    }
  })
}

function buildComputedAvailabilityResponse(
  slotsByDay: Record<string, ComputedSlot[]>,
  enrichedConstraints: Constraint[],
  settings: AvailabilitySettingsData,
  regularEvents: CalendarEvent[],
  outOfOfficeEvents: CalendarEvent[],
  eventsResponses: Awaited<ReturnType<typeof getCalendarEvents>>[],
  request: ComputedAvailabilityRequest
): ComputedSlotAvailabilityData {
  return {
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
        events: eventsResponses.every((r) => r._meta?.source === 'cache')
          ? CACHE_STATUS_HIT
          : CACHE_STATUS_MISS,
      },
    },
  }
}

async function resolveReschedulingGoogleEventIds(appointmentId: string): Promise<Set<string>> {
  const attendees = await AppointmentAttendee.findAll({
    where: { appointmentId },
    attributes: ['googleEventId'],
  })

  return new Set(
    attendees
      .map((attendee) => attendee.googleEventId)
      .filter((eventId): eventId is string => typeof eventId === 'string' && eventId.trim().length > 0)
  )
}

/** Exclude the given appointment's calendar event(s) from overlap checks (e.g. when editing that appointment). */
async function excludeAppointmentFromOverlap(
  regularEvents: CalendarEvent[],
  appointmentId?: string
): Promise<CalendarEvent[]> {
  if (!appointmentId) {
    return regularEvents
  }

  const eventIdsToExclude = await resolveReschedulingGoogleEventIds(appointmentId)
  if (eventIdsToExclude.size === 0) {
    logger.warn('No Google event ids found for appointment; overlap exclusion skipped', {
      appointmentId,
    })
    return regularEvents
  }

  return regularEvents.filter((event) => !eventIdsToExclude.has(event.id))
}

export async function computeAvailabilityData(
  request: ComputedAvailabilityRequest
): Promise<ComputedSlotAvailabilityData> {
  const startTime = Date.now()
  const dataSource = request.dataSource ?? 'real'

  const settings = await fetchAvailabilitySettings()

  if (dataSource === 'none') {
    logger.info(`[dataSource=none] Returning empty response with settings metadata`)
    return buildComputedAvailabilityResponse(
      {},
      [],
      settings,
      [],
      [],
      [],
      request
    )
  }

  const constraints = extractConstraints(settings)

  const useRealApis = dataSource === 'real'

  const calendarEmails = getReadFromCalendars(settings.calendarConfig)
  const calendarEnabled = useRealApis
    && calendarEmails.length > 0
    && (settings.calendarConfig?.enabled ?? false)

  const { events: allCalendarEvents, responses: eventsResponses } =
    await fetchAndDedupeCalendarEvents(
      calendarEmails,
      request.dateRange,
      calendarEnabled
    )

  const { regularEvents, outOfOfficeEvents } =
    partitionByEventType(allCalendarEvents)

  const effectiveAppointmentId =
    request.appointmentId ?? request.reschedulingAppointmentId
  if (request.reschedulingAppointmentId != null && request.appointmentId == null) {
    logger.debug('reschedulingAppointmentId is deprecated; use appointmentId')
  }
  const overlapRegularEvents = await excludeAppointmentFromOverlap(
    regularEvents,
    effectiveAppointmentId
  )

  const driveTimesByPlaceId = useRealApis
    ? await calculateDriveTimesForPlaceIds(overlapRegularEvents, request.candidatePlaceId)
    : {}

  if (!useRealApis) {
    logger.info(`[dataSource=${dataSource}] Skipping Google Calendar and Routes API calls`)
  }

  const { capacity } = groupConstraintsByCategory(constraints)
  const { scheduledHoursByKey, scheduledIncomeByKey } = await computeScheduledHoursForRange(
    request.dateRange,
    capacity
  )
  const enrichedConstraints = enrichCapacityConstraintsWithHours(
    constraints,
    scheduledHoursByKey,
    scheduledIncomeByKey
  )

  const businessHoursConstraint = enrichedConstraints.find(
    (c) =>
      c.category === 'range' &&
      c.type === RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS
  ) as RangeConstraint | undefined
  const businessHoursConfig = businessHoursConstraint?.config as
    | BusinessHoursConfig
    | undefined

  const rawOooEnforcement = settings.overlapSources?.outOfOffice?.enforcement
  const oooEnforcement = rawOooEnforcement !== undefined && rawOooEnforcement !== null ? rawOooEnforcement : 'hard'
  const effectiveOutOfOfficeEvents = oooEnforcement === 'off' ? [] : outOfOfficeEvents
  const effectiveOooEnforcement: 'flexible' | 'hard' =
    oooEnforcement === 'flexible' ? 'flexible' : 'hard'

  const slotsByDay = businessHoursConfig
    ? computeSlotsForDateRange(
        request.dateRange,
        request.duration,
        settings.minuteIncrement,
        enrichedConstraints,
        overlapRegularEvents,
        effectiveOutOfOfficeEvents,
        driveTimesByPlaceId,
        businessHoursConfig,
        settings.timezone ?? 'UTC',
        new Date(),
        effectiveOooEnforcement
      )
    : {}

  const computedData = buildComputedAvailabilityResponse(
    slotsByDay,
    enrichedConstraints,
    settings,
    regularEvents,
    outOfOfficeEvents,
    eventsResponses,
    request
  )

  const duration = Date.now() - startTime
  logger.info(`[dataSource=${dataSource}] Computed slot availability in ${duration}ms`)

  return computedData
}
