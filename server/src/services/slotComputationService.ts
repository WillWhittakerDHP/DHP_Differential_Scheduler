
import type {
  ComputedSlot,
  CalendarEvent,
  Constraint,
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  RFC3339DateTime,
} from '../../../shared/types/availabilityTypes.js'
import type { BusinessHoursConfig } from '../../../shared/types/availabilityTypes.js'
import { RANGE_CONSTRAINT_TYPES } from '../../../shared/constants/constraintConstants.js'
import { filterActiveConstraints, groupConstraintsByCategory } from '../../../shared/utils/constraintUtils.js'
import { buildDayBoundariesUTC } from '../../../shared/utils/businessHoursUtils.js'
import {
  generateSlotTimes,
  getUniqueDatesInRange,
} from '../utils/availabilities/availabilityPrimitives.js'
import { createLogger } from '../utils/logger.js'
import {
  type EventWithDrive,
  checkRangeConstraints,
  checkOverlapConstraints,
  checkCapacityConstraints,
  collectRangeViolationKeys,
  collectOverlapViolationKeys,
  collectCapacityViolationKeys,
} from './slotConstraintCheckers.js'

const logger = createLogger('SlotComputationService')

function generateSlotsForDay(
  dayStartUtc: Date,
  dayEndUtc: Date,
  durationMinutes: number,
  minuteIncrement: number,
  requestEndBoundary: Date
): Array<{ startTime: Date; endTime: Date }> {
  return generateSlotTimes(
    dayStartUtc,
    dayEndUtc,
    durationMinutes,
    minuteIncrement,
    requestEndBoundary
  )
}

/** Report of all violation keys for a slot (force-create; no short-circuit). */
interface ForceCreateViolationReport {
  violations: string[]
}

/**
 * Runs all constraint checks for a single slot without short-circuiting;
 * returns every violation key (range, overlap, capacity). Used for admin force-create.
 */
export function computeViolationsForSlot(
  slotStart: Date,
  slotEnd: Date,
  durationMinutes: number,
  rangeConstraints: RangeConstraint[],
  overlapConstraints: OverlapConstraint[],
  capacityConstraints: CapacityConstraint[],
  eventsWithDrive: EventWithDrive[],
  now: Date
): ForceCreateViolationReport {
  const rangeKeys = collectRangeViolationKeys(
    slotStart,
    slotEnd,
    rangeConstraints,
    now
  )
  const overlapKeys = collectOverlapViolationKeys(
    slotStart,
    slotEnd,
    eventsWithDrive
  )
  const capacityKeys = collectCapacityViolationKeys(
    slotStart,
    durationMinutes,
    capacityConstraints
  )
  return {
    violations: [...rangeKeys, ...overlapKeys, ...capacityKeys],
  }
}

function mapToEventWithDrive(
  event: CalendarEvent,
  source: 'event' | 'outOfOffice',
  driveTimesByPlaceId: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>,
  onlyOpaque: boolean,
  enforcement?: 'flexible' | 'hard'
): EventWithDrive | null {
  if (onlyOpaque && event.transparency === 'transparent') {
    return null
  }
  const driveTo = event.placeId
    ? driveTimesByPlaceId[event.placeId]?.driveToCandidate
    : undefined
  const driveFrom = event.placeId
    ? driveTimesByPlaceId[event.placeId]?.driveFromCandidate
    : undefined
  return {
    start: new Date(event.start),
    end: new Date(event.end),
    source,
    enforcement,
    placeId: event.placeId,
    driveToMinutes: source === 'event' ? driveTo : undefined,
    driveFromMinutes: source === 'event' ? driveFrom : undefined,
  }
}

export function attachDriveTimesToEvents(
  regularEvents: CalendarEvent[],
  outOfOfficeEvents: CalendarEvent[],
  driveTimesByPlaceId: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>,
  onlyOpaque: boolean,
  /** Enforcement level for out-of-office events (defaults to 'hard') */
  oooEnforcement: 'flexible' | 'hard' = 'hard'
): EventWithDrive[] {
  const regular = regularEvents
    .map((e) =>
      mapToEventWithDrive(e, 'event', driveTimesByPlaceId, onlyOpaque)
    )
    .filter((e): e is EventWithDrive => e != null)
  const ooo = outOfOfficeEvents
    .map((e) =>
      mapToEventWithDrive(
        e,
        'outOfOffice',
        driveTimesByPlaceId,
        onlyOpaque,
        oooEnforcement
      )
    )
    .filter((e): e is EventWithDrive => e != null)
  return [...regular, ...ooo]
}

/** Day config for slot computation: day key and UTC boundaries */
interface DayConfig {
  dayKey: string
  boundaries: { dayStartUtc: Date; dayEndUtc: Date }
}

function getDayConfigsInRange(
  requestStart: Date,
  requestEnd: Date,
  hoursMap: NonNullable<BusinessHoursConfig['hours']>
): DayConfig[] {
  const dateStrings = getUniqueDatesInRange(requestStart, requestEnd)
  return dateStrings
    .map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number)
      const year = y!
      const month = (m ?? 1) - 1
      const day = d ?? 1
      const dayOfWeek = new Date(
        Date.UTC(year, month, day, 12, 0, 0)
      ).getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
      const dayHours = hoursMap[dayOfWeek]
      if (!dayHours?.start || !dayHours?.end) return null
      const boundaries = buildDayBoundariesUTC(
        year,
        month,
        day,
        dayHours.start,
        dayHours.end
      )
      if (!boundaries) return null
      return {
        dayKey: dateStr,
        boundaries,
      }
    })
    .filter((c): c is DayConfig => c != null)
}

function withCandidateDriveLegs(
  slot: ComputedSlot,
  legs: { driveToCandidate: number; driveFromCandidate: number }
): ComputedSlot {
  return {
    ...slot,
    driveToCandidate: legs.driveToCandidate,
    driveFromCandidate: legs.driveFromCandidate,
  }
}

function computeSlotsForOneDay(
  dayConfig: DayConfig,
  durationMinutes: number,
  minuteIncrement: number,
  requestEnd: Date,
  minSlotStart: Date,
  rangeConstraints: RangeConstraint[],
  overlapConstraints: OverlapConstraint[],
  capacityConstraints: CapacityConstraint[],
  eventsWithDrive: EventWithDrive[],
  now: Date,
  candidateDriveLegs: { driveToCandidate: number; driveFromCandidate: number }
): ComputedSlot[] {
  const rawSlots = generateSlotsForDay(
    dayConfig.boundaries.dayStartUtc,
    dayConfig.boundaries.dayEndUtc,
    durationMinutes,
    minuteIncrement,
    requestEnd
  )
  const slotsFromMinStart = rawSlots.filter(
    ({ startTime }) => startTime >= minSlotStart
  )
  return slotsFromMinStart.map(({ startTime, endTime }) => {
    const rangeResult = checkRangeConstraints(
      startTime,
      endTime,
      rangeConstraints,
      now
    )
    if (!rangeResult.passes) {
      return withCandidateDriveLegs(
        {
          startTime: startTime.toISOString() as RFC3339DateTime,
          endTime: endTime.toISOString() as RFC3339DateTime,
          duration: durationMinutes,
          isAvailable: false,
          violations: [],
        },
        candidateDriveLegs
      )
    }
    const overlapResult = checkOverlapConstraints(
      startTime,
      endTime,
      eventsWithDrive,
      overlapConstraints
    )
    if (!overlapResult.passes) {
      return withCandidateDriveLegs(
        {
          startTime: startTime.toISOString() as RFC3339DateTime,
          endTime: endTime.toISOString() as RFC3339DateTime,
          duration: durationMinutes,
          isAvailable: false,
          violations: overlapResult.violations,
        },
        candidateDriveLegs
      )
    }
    const capacityResult = checkCapacityConstraints(
      startTime,
      durationMinutes,
      capacityConstraints
    )
    if (!capacityResult.passes) {
      return withCandidateDriveLegs(
        {
          startTime: startTime.toISOString() as RFC3339DateTime,
          endTime: endTime.toISOString() as RFC3339DateTime,
          duration: durationMinutes,
          isAvailable: false,
          violations: capacityResult.violations,
        },
        candidateDriveLegs
      )
    }
    const allViolations = [
      ...rangeResult.violations,
      ...overlapResult.violations,
      ...capacityResult.violations,
    ]
    return withCandidateDriveLegs(
      {
        startTime: startTime.toISOString() as RFC3339DateTime,
        endTime: endTime.toISOString() as RFC3339DateTime,
        duration: durationMinutes,
        isAvailable: allViolations.length === 0,
        violations: allViolations,
      },
      candidateDriveLegs
    )
  })
}

export function computeSlotsForDateRange(
  dateRange: { start: string; end: string },
  durationMinutes: number,
  minuteIncrement: number,
  constraints: Constraint[],
  regularEvents: CalendarEvent[],
  outOfOfficeEvents: CalendarEvent[],
  driveTimesByPlaceId: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>,
  businessHoursConfig: BusinessHoursConfig,
  _timezone: string, // Pass-through for client/UI; server uses UTC/RFC3339 only
  now: Date = new Date(),
  /** Enforcement level for out-of-office events (defaults to 'hard') */
  oooEnforcement: 'flexible' | 'hard' = 'hard',
  /** Default-location ↔ candidate drive legs (minutes) for fee context on every slot. */
  candidateDriveLegs: { driveToCandidate: number; driveFromCandidate: number } = {
    driveToCandidate: 0,
    driveFromCandidate: 0,
  }
): Record<string, ComputedSlot[]> {
  const active = filterActiveConstraints(constraints)
  const { range: rangeConstraints, overlap: overlapConstraints, capacity: capacityConstraints } =
    groupConstraintsByCategory(active)

  const hoursMap = businessHoursConfig?.hours
  if (!hoursMap) {
    logger.warn('No business hours config; returning empty slots per day')
    return {}
  }

  const requestStart = new Date(dateRange.start)
  const requestEnd = new Date(dateRange.end)
  const eventsWithDrive = attachDriveTimesToEvents(
    regularEvents,
    outOfOfficeEvents,
    driveTimesByPlaceId,
    true,
    oooEnforcement
  )

  const leadTimeConstraint = rangeConstraints.find(
    (c) => c.type === RANGE_CONSTRAINT_TYPES.LEAD_TIME
  )
  const leadMinutes =
    leadTimeConstraint?.config &&
    typeof (leadTimeConstraint.config as { minutes?: number }).minutes === 'number'
      ? (leadTimeConstraint.config as { minutes: number }).minutes
      : 0
  const minSlotStart = new Date(now.getTime() + leadMinutes * 60 * 1000)

  const dayConfigs = getDayConfigsInRange(requestStart, requestEnd, hoursMap)
  const slotsByDay = Object.fromEntries(
    dayConfigs.map((dayConfig) => [
      dayConfig.dayKey,
      computeSlotsForOneDay(
        dayConfig,
        durationMinutes,
        minuteIncrement,
        requestEnd,
        minSlotStart,
        rangeConstraints,
        overlapConstraints,
        capacityConstraints,
        eventsWithDrive,
        now,
        candidateDriveLegs
      ),
    ])
  )
  return slotsByDay
}
