import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  Constraint,
  RollingWeekDirection,
  BusinessHoursConfig,
  RFC3339DateTime,
  DateRangeConfig,
} from '../../../shared/types/availabilityTypes.js'
import {
  RANGE_CONSTRAINT_TYPES,
  TIME_BASIS_TYPES,
} from '../../../shared/constants/constraintConstants.js'
import type {
  AvailabilitySettingsData,
  RangeConstraint as DbRangeConstraint,
} from '../../../shared/types/availabilitySettingsDocument.js'

/**
 * Require enforcement to be defined
 * 
 * @param enforcement - Enforcement value to validate
 * @param label - Label for error message (e.g., "appointment buffer", "driveToCandidate buffer", "daily constraint")
 */
function requireEnforcement(enforcement: unknown, label: string): void {
  if (enforcement === undefined) {
    throw new Error(`Enforcement is required for ${label}. Must be 'off', 'flexible', or 'hard'.`)
  }
}

/** Convert businessHours DB constraint to shared RangeConstraint (hours → RFC3339DateTime). */
function convertBusinessHoursConstraint(dbConstraint: DbRangeConstraint): RangeConstraint {
  const config = dbConstraint.config as BusinessHoursConfig
  const convertedHours = Object.fromEntries(
    Array.from({ length: 7 }, (_, day) => {
      const dayHours = config.hours[day as 0 | 1 | 2 | 3 | 4 | 5 | 6]
      return dayHours
        ? // @audit-allow:hardcoding:fieldMapping - BusinessHoursConfig.hours entry tuple; day index → {start, end} as RFC3339DateTime for Object.fromEntries
          [day, { start: dayHours.start as RFC3339DateTime, end: dayHours.end as RFC3339DateTime }] as const
        : null
    }).filter((entry): entry is readonly [number, { start: RFC3339DateTime; end: RFC3339DateTime }] => entry !== null)
  ) as BusinessHoursConfig['hours']
  return {
    category: 'range',
    type: dbConstraint.type,
    enforcement: dbConstraint.enforcement,
    config: { hours: convertedHours } as BusinessHoursConfig,
  }
}

/** Convert dateRange DB constraint to shared RangeConstraint (start/end → RFC3339DateTime). */
function convertDateRangeConstraint(dbConstraint: DbRangeConstraint): RangeConstraint {
  const config = dbConstraint.config as { start: string; end: string }
  return {
    category: 'range',
    type: dbConstraint.type,
    enforcement: dbConstraint.enforcement,
    config: {
      start: config.start as RFC3339DateTime,
      end: config.end as RFC3339DateTime,
    } as DateRangeConfig,
  }
}

/** LeadTime has no string conversion; pass through as shared RangeConstraint. */
function convertLeadTimeConstraint(dbConstraint: DbRangeConstraint): RangeConstraint {
  return { ...dbConstraint, category: 'range' }
}

const RANGE_CONVERTER_MAP: Record<
  DbRangeConstraint['type'],
  (dbConstraint: DbRangeConstraint) => RangeConstraint
> = {
  businessHours: convertBusinessHoursConstraint,
  dateRange: convertDateRangeConstraint,
  leadTime: convertLeadTimeConstraint,
}

function convertRangeConstraint(dbConstraint: DbRangeConstraint): RangeConstraint {
  return RANGE_CONVERTER_MAP[dbConstraint.type](dbConstraint)
}

function extractRangeConstraints(
  settings: AvailabilitySettingsData
): RangeConstraint[] {
  // Guard: required businessHours must be present (legacy top-level businessHours check removed 2026-02; use rangeConstraints.businessHours only)
  if (!settings.rangeConstraints?.[RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS]) {
    throw new Error(`Required rangeConstraints.${RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS} is missing. Business hours must be provided in structured format.`)
  }

  const rangeKeys = [
    RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS,
    RANGE_CONSTRAINT_TYPES.LEAD_TIME,
    RANGE_CONSTRAINT_TYPES.DATE_RANGE,
  ] as const
  return rangeKeys
    .map((key) => settings.rangeConstraints?.[key])
    .filter((c): c is DbRangeConstraint => c !== undefined)
    .map(convertRangeConstraint)
}

function extractDriveTimeConstraint(
  settings: AvailabilitySettingsData,
  type: 'driveToCandidate' | 'driveFromCandidate',
  placement: 'before' | 'after'
): OverlapConstraint | null {
  const driveTime = settings.buffers?.[type]
  if (!driveTime || driveTime.applyTo === 'none' || driveTime.minutes <= 0) {
    return null
  }
  
  // PATTERN: Check undefined BEFORE checking value to catch missing enforcement
  requireEnforcement(driveTime.enforcement, `${type} buffer`)
  
  return {
    category: 'overlap',
    type,
    placement,  // Implicit - driveToCandidate is always 'before', driveFromCandidate is always 'after'
    enforcement: driveTime.enforcement,
    minutes: driveTime.minutes,
    applyTo: driveTime.applyTo
  }
}

function extractOverlapConstraints(
  settings: AvailabilitySettingsData
): OverlapConstraint[] {
  const standardBufferTypes: Array<'appointment' | 'lunch'> = ['appointment', 'lunch']
  const standardConstraints = standardBufferTypes.flatMap((bufferType) => {
    const buffer = settings.buffers?.[bufferType]
    if (!buffer || buffer.placement === 'off' || buffer.minutes <= 0) return []
    requireEnforcement(buffer.enforcement, `${bufferType} buffer`)
    return [{
      category: 'overlap' as const,
      type: bufferType,
      placement: buffer.placement as 'before' | 'after' | 'both',
      enforcement: buffer.enforcement,
      minutes: buffer.minutes,
    }]
  })

  const driveTimeConfigs: Array<{ type: 'driveToCandidate' | 'driveFromCandidate'; placement: 'before' | 'after' }> = [
    { type: 'driveToCandidate', placement: 'before' },
    { type: 'driveFromCandidate', placement: 'after' },
  ]
  const driveConstraints = driveTimeConfigs.flatMap(({ type, placement }) => {
    const constraint = extractDriveTimeConstraint(settings, type, placement)
    return constraint ? [constraint] : []
  })

  return [...standardConstraints, ...driveConstraints]
}

/**
 * Extract capacity constraints from availability settings
 */
function extractCapacityConstraints(
  settings: AvailabilitySettingsData
): CapacityConstraint[] {
  const capacityTypeMap: Array<{
    type: CapacityConstraint['type']
    settingsKey: 'day' | 'calendarWeek' | 'rollingWeek'
  }> = [
    { type: TIME_BASIS_TYPES.DAILY, settingsKey: 'day' },
    { type: TIME_BASIS_TYPES.CALENDAR_WEEK, settingsKey: 'calendarWeek' },
    { type: TIME_BASIS_TYPES.ROLLING_WEEK, settingsKey: 'rollingWeek' }
  ]

  return capacityTypeMap
    .map(({ type, settingsKey }) => {
      const hoursFilter = settings.maxWorkHours?.[settingsKey]
      const incomeFilter = settings.maxIncome?.[settingsKey]
      const enforcement = hoursFilter?.enforcement ?? incomeFilter?.enforcement
      if (enforcement === undefined) {
        return null
      }
      requireEnforcement(enforcement, `${type} constraint`)
      if (enforcement === 'off') {
        return null
      }
      const hasHours = hoursFilter != null && hoursFilter.enforcement !== 'off'
      const hasIncome = incomeFilter != null && incomeFilter.enforcement !== 'off'
      if (!hasHours && !hasIncome) {
        return null
      }
      const base: CapacityConstraint = {
        category: 'capacity',
        type,
        enforcement,
        maxHours: hasHours ? (hoursFilter as { maxHours: number }).maxHours : Number.POSITIVE_INFINITY,
        ...(hasIncome ? { maxIncome: (incomeFilter as { maxIncome: number }).maxIncome } : {}),
        ...(type === TIME_BASIS_TYPES.ROLLING_WEEK && settingsKey === 'rollingWeek' && (hoursFilter ?? incomeFilter) && 'direction' in (hoursFilter ?? incomeFilter!)
          ? { direction: ((hoursFilter ?? incomeFilter) as { direction?: RollingWeekDirection }).direction }
          : {}),
      }
      return base
    })
    .filter((constraint): constraint is CapacityConstraint => constraint !== null)
}

/**
 * Extract all constraints from availability settings
 * 
 * @param settings - Availability settings data
 * @returns Unified array of all constraints
 */
export function extractConstraints(settings: AvailabilitySettingsData): Constraint[] {
  return [
    ...extractRangeConstraints(settings),
    ...extractOverlapConstraints(settings),
    ...extractCapacityConstraints(settings)
  ]
}
