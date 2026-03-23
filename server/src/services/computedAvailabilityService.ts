
import type {
  ComputedSlotAvailabilityData,
  ComputedAvailabilityRequest,
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
import { AppointmentAttendee, ConstraintOverride } from '../config/app.js'
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import { getCalendarSettings } from '../repositories/calendarSettingsRepository.js'
import { getAvailabilitySettingsData } from '../repositories/availabilitySettingsRepository.js'
import {
  extractConstraints,
} from './constraintExtractor.js'
import { groupConstraintsByCategory, relaxConstraintsForExceptions } from '../../../shared/utils/constraintUtils.js'
import { computeScheduledHoursForRange } from './capacityComputer.js'
import { partitionByEventType } from '../utils/availabilities/availabilityPrimitives.js'
import { createLogger } from '../utils/logger.js'
import { getReadFromCalendars } from './computedAvailabilityCalendarRead.js'
import {
  calculateDriveTimesForPlaceIds,
  resolveDefaultLocationCandidateDriveLegsMinutes,
} from './computedAvailabilityDriveHelpers.js'
import {
  fetchAndDedupeCalendarEvents,
  enrichCapacityConstraintsWithHours,
  buildComputedAvailabilityResponse,
} from './computedAvailabilityResponseHelpers.js'
import { resolveNumericPolicyForAvailabilityAndCalendar } from './organizationNumericPolicyService.js'

const logger = createLogger('ComputedAvailabilityService')

async function fetchAvailabilitySettings(): Promise<AvailabilitySettingsData> {
  return getAvailabilitySettingsData()
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
  const resolvedPolicy = await resolveNumericPolicyForAvailabilityAndCalendar(
    settings,
    calendarSettings
  )
  const settingsWithResolvedNumericPolicy: AvailabilitySettingsData = {
    ...settings,
    minuteIncrement: resolvedPolicy.timeAndRounding.minuteIncrement,
    durationRounding: resolvedPolicy.timeAndRounding.durationRounding,
    driveTimeFee: resolvedPolicy.driveTimeFee,
  }

  if (dataSource === 'none') {
    logger.info(`[dataSource=none] Returning empty response with settings metadata`)
    return buildComputedAvailabilityResponse(
      {},
      [],
      settingsWithResolvedNumericPolicy,
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

  const overlapRegularEvents = await excludeAppointmentFromOverlap(
    regularEvents,
    request.appointmentId
  )

  const driveTimesByPlaceId = useRealApis
    ? await calculateDriveTimesForPlaceIds(overlapRegularEvents, request.candidatePlaceId)
    : {}

  const candidateDriveLegs = useRealApis
    ? await resolveDefaultLocationCandidateDriveLegsMinutes(
        settings.defaultLocation?.placeId,
        request.candidatePlaceId
      )
    : { driveToCandidate: 0, driveFromCandidate: 0 }

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
      request.appointmentId
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
        settingsWithResolvedNumericPolicy.minuteIncrement,
        constraintsForSlots,
        overlapRegularEvents,
        effectiveOutOfOfficeEvents,
        driveTimesByPlaceId,
        businessHoursConfig,
        settings.timezone ?? 'UTC',
        new Date(),
        effectiveOooEnforcement,
        candidateDriveLegs
      )
    : {}

  const computedData = buildComputedAvailabilityResponse(
    slotsByDay,
    constraintsForSlots,
    settingsWithResolvedNumericPolicy,
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
interface ForceCreateSlotContext {
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
  _durationMinutes: number,
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
