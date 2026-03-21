
import type {
  ComputedSlotAvailabilityData,
  ComputedAvailabilityRequest,
  ComputedSlot,
  CalendarEvent,
  BusinessHoursConfig,
  Constraint,
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
} from '../../../shared/types/availabilityTypes.js'
import { RANGE_CONSTRAINT_TYPES } from '../../../shared/constants/constraintConstants.js'
import { computeSlotsForDateRange, attachDriveTimesToEvents } from './slotComputationService.js'
import type { EventWithDrive } from './slotConstraintCheckers.js'
import { AppointmentAttendee, ConstraintOverride, BusinessSettings } from '../config/app.js'
import type { AvailabilitySettingsData } from '../db/models/admin/business_settings.js'
import type { CalendarSettingsData } from '../db/models/admin/calendar_settings.js'
import { getCalendarSettings } from '../repositories/calendarSettingsRepository.js'
import { AVAILABILITY_SETTINGS_KEY } from '../constants/appConstants.js'
import { defaultAvailabilitySettings } from '../routes/internal/businessSettings/businessSettingsConstants.js'
import {
  extractConstraints,
} from './constraintExtractor.js'
import { groupConstraintsByCategory, relaxConstraintsForExceptions } from '../../../shared/utils/constraintUtils.js'
import { getCalendarEvents } from './google/calendar/eventsService.js'
import { calculateRouteMatrix } from './google/maps/routesApiService.js'
import { MapsApiError } from './google/maps/mapsErrorHandler.js'
import { getCachedDriveTime, cacheDriveTime } from './driveTimeCache.js'
import { withRetry } from './google/shared/googleApiRetry.js'
import type { RouteLocation } from './google/maps/mapsTypes.js'
import { computeScheduledHoursForRange } from './capacityComputer.js'
import { partitionByEventType } from '../utils/availabilities/availabilityPrimitives.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('ComputedAvailabilityService')

const CACHE_STATUS_HIT = 'hit' as const
const CACHE_STATUS_MISS = 'miss' as const

function getReadFromCalendars(calendarSettings: CalendarSettingsData): string[] {
  if (!calendarSettings.enabled || !Array.isArray(calendarSettings.calendars)) {
    return []
  }
  return calendarSettings.calendars
    .filter((entry) => entry.readFrom && entry.email && entry.email.trim() !== '')
    .map((entry) => entry.email.trim())
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
  const row = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  })
  return (row?.settingValue ?? defaultAvailabilitySettings) as AvailabilitySettingsData
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
  request: ComputedAvailabilityRequest,
  allowedExceptionsApplied?: boolean
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
      ...(allowedExceptionsApplied !== undefined ? { allowedExceptionsApplied } : {}),
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

/**
 * When both allowedExceptions and appointmentId are present, loads ConstraintOverride,
 * verifies every allowed key is in overriddenViolations, and returns relaxed constraints
 * and a flag. Otherwise returns original constraints and false.
 */
async function resolveAllowedExceptions(
  constraints: Constraint[],
  allowedExceptions: string[] | undefined,
  appointmentId: string | undefined
): Promise<{ constraintsForSlots: Constraint[]; allowedExceptionsApplied: boolean }> {
  const hasExceptions = allowedExceptions != null && allowedExceptions.length > 0
  if (!hasExceptions || !appointmentId) {
    return { constraintsForSlots: constraints, allowedExceptionsApplied: false }
  }

  const override = await ConstraintOverride.findOne({
    where: { appointmentId },
    attributes: ['overriddenViolations'],
  })
  if (!override?.overriddenViolations?.length) {
    return { constraintsForSlots: constraints, allowedExceptionsApplied: false }
  }

  const allowedSet = new Set(override.overriddenViolations)
  const allAllowed = allowedExceptions.every((key) => allowedSet.has(key))
  if (!allAllowed) {
    return { constraintsForSlots: constraints, allowedExceptionsApplied: false }
  }

  const relaxed = relaxConstraintsForExceptions(constraints, allowedExceptions)
  return { constraintsForSlots: relaxed, allowedExceptionsApplied: true }
}

export async function computeAvailabilityData(
  request: ComputedAvailabilityRequest
): Promise<ComputedSlotAvailabilityData> {
  const startTime = Date.now()
  const dataSource = request.dataSource ?? 'real'

  const settings = await fetchAvailabilitySettings()
  const calendarSettings = await getCalendarSettings()

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

  const calendarEmails = getReadFromCalendars(calendarSettings)
  const calendarEnabled = useRealApis
    && calendarEmails.length > 0
    && (calendarSettings.enabled ?? false)

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

  const { constraintsForSlots, allowedExceptionsApplied } =
    await resolveAllowedExceptions(
      enrichedConstraints,
      request.allowedExceptions,
      effectiveAppointmentId
    )

  const businessHoursConstraint = constraintsForSlots.find(
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
        constraintsForSlots,
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
    constraintsForSlots,
    settings,
    regularEvents,
    outOfOfficeEvents,
    eventsResponses,
    request,
    allowedExceptionsApplied
  )

  const duration = Date.now() - startTime
  logger.info(`[dataSource=${dataSource}] Computed slot availability in ${duration}ms`)

  return computedData
}

/** Context for force-create: constraints and events for a single slot (used by computeViolationsForSlot). */
export interface ForceCreateSlotContext {
  rangeConstraints: RangeConstraint[]
  overlapConstraints: OverlapConstraint[]
  capacityConstraints: CapacityConstraint[]
  eventsWithDrive: EventWithDrive[]
}

/**
 * Prepares constraint and event context for a single slot (admin force-create).
 * Fetches settings, calendar events, drive times, enriches capacity, and returns
 * grouped constraints + eventsWithDrive for computeViolationsForSlot.
 */
export async function getForceCreateSlotContext(
  slotStart: Date,
  slotEnd: Date,
  durationMinutes: number,
  candidatePlaceId?: string
): Promise<ForceCreateSlotContext> {
  const settings = await fetchAvailabilitySettings()
  const calendarSettings = await getCalendarSettings()
  const constraints = extractConstraints(settings)
  const dayStart = new Date(slotStart)
  dayStart.setUTCHours(0, 0, 0, 0)
  const dayEnd = new Date(slotEnd)
  dayEnd.setUTCHours(23, 59, 59, 999)
  const dateRange = {
    start: dayStart.toISOString(),
    end: dayEnd.toISOString(),
  }
  const calendarEmails = getReadFromCalendars(calendarSettings)
  const calendarEnabled =
    calendarEmails.length > 0 && (calendarSettings.enabled ?? false)
  const { events: allCalendarEvents } = await fetchAndDedupeCalendarEvents(
    calendarEmails,
    dateRange,
    calendarEnabled
  )
  const { regularEvents, outOfOfficeEvents } = partitionByEventType(allCalendarEvents)
  const driveTimesByPlaceId = calendarEnabled
    ? await calculateDriveTimesForPlaceIds(allCalendarEvents, candidatePlaceId)
    : {}
  const { capacity } = groupConstraintsByCategory(constraints)
  const { scheduledHoursByKey, scheduledIncomeByKey } =
    await computeScheduledHoursForRange(dateRange, capacity)
  const enrichedConstraints = enrichCapacityConstraintsWithHours(
    constraints,
    scheduledHoursByKey,
    scheduledIncomeByKey
  )
  const { range: rangeConstraints, overlap: overlapConstraints, capacity: capacityConstraints } =
    groupConstraintsByCategory(enrichedConstraints)
  const rawOooEnforcement = settings.overlapSources?.outOfOffice?.enforcement
  const oooEnforcement =
    rawOooEnforcement !== undefined && rawOooEnforcement !== null ? rawOooEnforcement : 'hard'
  const effectiveOooEnforcement: 'flexible' | 'hard' =
    oooEnforcement === 'flexible' ? 'flexible' : 'hard'
  const effectiveOutOfOffice = oooEnforcement === 'off' ? [] : outOfOfficeEvents
  const eventsWithDrive = attachDriveTimesToEvents(
    regularEvents,
    effectiveOutOfOffice,
    driveTimesByPlaceId,
    true,
    effectiveOooEnforcement
  )
  return {
    rangeConstraints,
    overlapConstraints,
    capacityConstraints,
    eventsWithDrive,
  }
}
