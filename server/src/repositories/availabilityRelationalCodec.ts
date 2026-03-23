/**
 * Assemble / disassemble AvailabilitySettingsData from relational rows (no JSONB).
 */
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import type {
  BufferPlacement,
  ConstraintEnforcement,
  DriveTimeApplyTo,
  IncomeCapacityFilter,
  RangeConstraint,
  RFC3339DateTime,
  DayHours,
  RollingWeekDirection,
  RollingWeekCapacityFilter,
  RollingWeekIncomeCapacityFilter,
  WorkCapacityFilter,
} from '../../../shared/types/availabilityTypes.js'
import type { AvailabilitySetting } from '../db/models/admin/availability_setting.js'
import type { AvailabilityBusinessHour } from '../db/models/admin/availability_business_hour.js'
import type { AvailabilityBufferEntry } from '../db/models/admin/availability_buffer_entry.js'
import type { AvailabilityRangeConstraint } from '../db/models/admin/availability_range_constraint.js'
import type { AvailabilityRangeConstraintHour } from '../db/models/admin/availability_range_constraint_hour.js'
import type { AvailabilityMaxWorkHour } from '../db/models/admin/availability_max_work_hour.js'
import type { AvailabilityMaxIncomeRow } from '../db/models/admin/availability_max_income_row.js'
import type { AvailabilityDifferentialAttendee } from '../db/models/admin/availability_differential_attendee.js'
import { defaultAvailabilitySettings } from '../routes/internal/businessSettings/businessSettingsConstants.js'
import { nilToEmptyArray, nilToEmptyString } from '../../../shared/utils/nilDefaults.js'
import { legacyDbLabelIsProbablyFormattedAddress } from '../../../shared/utils/defaultLocationHeuristics.js'

function iso(d: Date): string {
  return d.toISOString()
}

function scopeToApi(scope: string): 'day' | 'calendarWeek' | 'rollingWeek' {
  if (scope === 'calendar_week') return 'calendarWeek'
  if (scope === 'rolling_week') return 'rollingWeek'
  return 'day'
}

const BUFFER_KIND_DB_TO_API: Record<string, keyof NonNullable<AvailabilitySettingsData['buffers']>> = {
  appointment: 'appointment',
  drive_to_candidate: 'driveToCandidate',
  drive_from_candidate: 'driveFromCandidate',
  lunch: 'lunch',
}

function bufferKindToApi(kind: string): keyof NonNullable<AvailabilitySettingsData['buffers']> | null {
  return BUFFER_KIND_DB_TO_API[kind] ?? null
}

function hoursMapFromRows(
  rows: Array<{ dayOfWeek: number; startAt: Date; endAt: Date }>
): Record<string, { start: string; end: string }> {
  const hours: Record<string, { start: string; end: string }> = {}
  for (const r of rows) {
    hours[String(r.dayOfWeek)] = { start: iso(r.startAt), end: iso(r.endAt) }
  }
  return hours
}

function rangeConstraintBusinessHoursFromRow(
  rc: AvailabilityRangeConstraint,
  hourRows: AvailabilityRangeConstraintHour[]
): RangeConstraint | null {
  if (hourRows.length === 0) return null
  const enf = rc.enforcement as ConstraintEnforcement
  const h = hoursMapFromRows(hourRows)
  const configHours: Record<string, DayHours> = {}
  for (let d = 0; d <= 6; d++) {
    const key = String(d)
    if (h[key]) {
      configHours[key] = {
        start: h[key].start as RFC3339DateTime,
        end: h[key].end as RFC3339DateTime,
      } as DayHours
    }
  }
  return {
    category: 'range',
    type: 'businessHours',
    enforcement: enf,
    config: { hours: configHours },
  } as RangeConstraint
}

function rangeConstraintFromRow(
  rc: AvailabilityRangeConstraint,
  hourRows: AvailabilityRangeConstraintHour[]
): RangeConstraint | null {
  const enf = rc.enforcement as ConstraintEnforcement
  if (rc.rangeType === 'businessHours') {
    return rangeConstraintBusinessHoursFromRow(rc, hourRows)
  }
  if (rc.rangeType === 'leadTime' && rc.leadTimeMinutes != null) {
    return {
      category: 'range',
      type: 'leadTime',
      enforcement: enf,
      config: { minutes: rc.leadTimeMinutes },
    } as RangeConstraint
  }
  if (rc.rangeType === 'dateRange' && rc.dateRangeStart && rc.dateRangeEnd) {
    return {
      category: 'range',
      type: 'dateRange',
      enforcement: enf,
      config: {
        start: iso(rc.dateRangeStart) as RFC3339DateTime,
        end: iso(rc.dateRangeEnd) as RFC3339DateTime,
      },
    } as RangeConstraint
  }
  return null
}

function buildBusinessHoursOutput(
  base: AvailabilitySettingsData,
  businessHours: AvailabilityBusinessHour[]
): AvailabilitySettingsData['businessHours'] {
  const bhOut: AvailabilitySettingsData['businessHours'] = { ...base.businessHours }
  for (const r of businessHours) {
    const k = r.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6
    bhOut[k] = { start: iso(r.startAt), end: iso(r.endAt) }
  }
  return bhOut
}

function buildBuffersOutput(buffers: AvailabilityBufferEntry[]): NonNullable<AvailabilitySettingsData['buffers']> {
  const buffersOut: NonNullable<AvailabilitySettingsData['buffers']> = {}
  for (const b of buffers) {
    const apiKey = bufferKindToApi(b.bufferKind)
    if (!apiKey || b.minutes == null || !b.enforcement) continue
    if (apiKey === 'driveToCandidate' || apiKey === 'driveFromCandidate') {
      buffersOut[apiKey] = {
        minutes: b.minutes,
        enforcement: b.enforcement as ConstraintEnforcement,
        applyTo: (b.applyTo ?? 'all') as DriveTimeApplyTo,
      }
      continue
    }
    if (!b.placement) continue
    buffersOut[apiKey] = {
      type: apiKey === 'lunch' ? 'lunch' : 'appointment',
      minutes: b.minutes,
      placement: b.placement as BufferPlacement,
      enforcement: b.enforcement as ConstraintEnforcement,
    }
  }
  return buffersOut
}

function indexRangeConstraintHours(
  rangeConstraintHours: AvailabilityRangeConstraintHour[]
): Map<string, AvailabilityRangeConstraintHour[]> {
  const hoursByRc = new Map<string, AvailabilityRangeConstraintHour[]>()
  for (const h of rangeConstraintHours) {
    const list = nilToEmptyArray(hoursByRc.get(h.rangeConstraintId))
    list.push(h)
    hoursByRc.set(h.rangeConstraintId, list)
  }
  return hoursByRc
}

function buildRangeConstraintsOutput(
  rangeConstraints: AvailabilityRangeConstraint[],
  hoursByRc: Map<string, AvailabilityRangeConstraintHour[]>
): NonNullable<AvailabilitySettingsData['rangeConstraints']> {
  const rcOut: NonNullable<AvailabilitySettingsData['rangeConstraints']> = {}
  for (const rc of rangeConstraints) {
    const hrs = nilToEmptyArray(hoursByRc.get(rc.id))
    const built = rangeConstraintFromRow(rc, hrs)
    if (!built) continue
    if (rc.rangeType === 'businessHours') rcOut.businessHours = built
    else if (rc.rangeType === 'leadTime') rcOut.leadTime = built
    else if (rc.rangeType === 'dateRange') rcOut.dateRange = built
  }
  return rcOut
}

function buildMaxWorkOutput(maxWork: AvailabilityMaxWorkHour[]): NonNullable<AvailabilitySettingsData['maxWorkHours']> {
  const mwOut: NonNullable<AvailabilitySettingsData['maxWorkHours']> = {}
  for (const r of maxWork) {
    const sk = scopeToApi(r.scope)
    const entry = {
      maxHours: r.maxHours,
      enforcement: r.enforcement as ConstraintEnforcement,
      ...(r.rollingDirection ? { direction: r.rollingDirection as RollingWeekDirection } : {}),
    }
    if (sk === 'rollingWeek') {
      mwOut.rollingWeek = entry as RollingWeekCapacityFilter
    } else if (sk === 'calendarWeek') {
      mwOut.calendarWeek = entry as WorkCapacityFilter
    } else {
      mwOut.day = entry as WorkCapacityFilter
    }
  }
  return mwOut
}

function buildMaxIncomeOutput(maxIncome: AvailabilityMaxIncomeRow[]): NonNullable<AvailabilitySettingsData['maxIncome']> {
  const miOut: NonNullable<AvailabilitySettingsData['maxIncome']> = {}
  for (const r of maxIncome) {
    const sk = scopeToApi(r.scope)
    const entry = {
      maxIncome: r.maxIncome,
      enforcement: r.enforcement as ConstraintEnforcement,
      ...(r.rollingDirection ? { direction: r.rollingDirection as RollingWeekDirection } : {}),
    }
    if (sk === 'rollingWeek') {
      miOut.rollingWeek = entry as RollingWeekIncomeCapacityFilter
    } else if (sk === 'calendarWeek') {
      miOut.calendarWeek = entry as IncomeCapacityFilter
    } else {
      miOut.day = entry as IncomeCapacityFilter
    }
  }
  return miOut
}

function buildDefaultLocationOutput(
  root: AvailabilitySetting
): AvailabilitySettingsData['defaultLocation'] | undefined {
  const dbAddr = root.defaultLocationAddress?.trim()
  const dbLbl = root.defaultLocationLabel?.trim()
  const hasDefaultLocationRow =
    !!root.defaultLocationPlaceId?.trim() ||
    !!dbAddr ||
    !!dbLbl ||
    root.defaultLocationLat != null
  if (!hasDefaultLocationRow) {
    return undefined
  }
  const addressFromLegacyLabel = dbLbl && legacyDbLabelIsProbablyFormattedAddress(dbLbl) ? dbLbl : undefined
  const addressForApi = dbAddr || addressFromLegacyLabel
  let labelForApi: string | undefined
  if (dbLbl) {
    labelForApi = addressForApi && dbLbl === addressForApi ? undefined : dbLbl
  }
  return {
    placeId: nilToEmptyString(root.defaultLocationPlaceId),
    ...(addressForApi ? { address: addressForApi } : {}),
    ...(labelForApi ? { label: labelForApi } : {}),
    ...(root.defaultLocationLat != null && root.defaultLocationLng != null
      ? { coordinates: { lat: root.defaultLocationLat, lng: root.defaultLocationLng } }
      : {}),
  }
}

function buildDifferentialPerspectivesOutput(
  differential: AvailabilityDifferentialAttendee[],
  allowedStateControlBlockInstanceIds?: ReadonlySet<string>
): AvailabilitySettingsData['differentialPerspectives'] | undefined {
  const majorAll = differential.filter((d) => d.role === 'major').sort((a, b) => a.sortOrder - b.sortOrder)
  const minorAll = differential.filter((d) => d.role === 'minor').sort((a, b) => a.sortOrder - b.sortOrder)
  const majors =
    allowedStateControlBlockInstanceIds == null
      ? majorAll
      : majorAll.filter((d) => allowedStateControlBlockInstanceIds.has(d.value))
  const minors =
    allowedStateControlBlockInstanceIds == null
      ? minorAll
      : minorAll.filter((d) => allowedStateControlBlockInstanceIds.has(d.value))
  if (!majors.length && !minors.length) {
    return undefined
  }
  return {
    ...(majors.length ? { majorAttendees: majors.map((x) => x.value) } : {}),
    ...(minors.length ? { minorAttendees: minors.map((x) => x.value) } : {}),
  }
}

function optionalKeyedSection<K extends keyof AvailabilitySettingsData>(
  key: K,
  value: object
): Pick<AvailabilitySettingsData, K> | Record<string, never> {
  return Object.keys(value).length > 0 ? { [key]: value } as Pick<AvailabilitySettingsData, K> : {}
}

function buildOverlapSourcesFromRoot(
  root: AvailabilitySetting
): AvailabilitySettingsData['overlapSources'] | undefined {
  return root.overlapOutOfOfficeEnforcement
    ? { outOfOffice: { enforcement: root.overlapOutOfOfficeEnforcement as ConstraintEnforcement } }
    : undefined
}

function buildDriveTimeFeeFromRoot(root: AvailabilitySetting): NonNullable<AvailabilitySettingsData['driveTimeFee']> {
  return {
    complimentaryDriveMinutes: root.driveTimeFeeComplimentaryMinutes,
    drivingRatePerHour: root.driveTimeFeeRatePerHour,
    driveTimeRoundingMinutes: root.driveTimeFeeRoundingMinutes,
  }
}

function buildDurationRoundingFromRoot(root: AvailabilitySetting): AvailabilitySettingsData['durationRounding'] {
  return {
    enabled: root.durationRoundingEnabled,
    ...(root.durationRoundingIncrement != null ? { increment: root.durationRoundingIncrement } : {}),
    ...(root.durationRoundingMethod
      ? { method: root.durationRoundingMethod as 'roundUp' | 'roundDown' | 'roundNearest' }
      : {}),
  }
}

export function assembleAvailabilityDocument(
  root: AvailabilitySetting,
  businessHours: AvailabilityBusinessHour[],
  buffers: AvailabilityBufferEntry[],
  rangeConstraints: AvailabilityRangeConstraint[],
  rangeConstraintHours: AvailabilityRangeConstraintHour[],
  maxWork: AvailabilityMaxWorkHour[],
  maxIncome: AvailabilityMaxIncomeRow[],
  differential: AvailabilityDifferentialAttendee[],
  /** When set, major/minor attendee values must be these block_instance ids (see stateControlUserTypeBlockInstanceIds). */
  allowedStateControlBlockInstanceIds?: ReadonlySet<string>
): AvailabilitySettingsData {
  const base = defaultAvailabilitySettings
  const bhOut = buildBusinessHoursOutput(base, businessHours)
  const buffersOut = buildBuffersOutput(buffers)
  const hoursByRc = indexRangeConstraintHours(rangeConstraintHours)
  const rcOut = buildRangeConstraintsOutput(rangeConstraints, hoursByRc)
  const mwOut = buildMaxWorkOutput(maxWork)
  const miOut = buildMaxIncomeOutput(maxIncome)

  const overlapSources = buildOverlapSourcesFromRoot(root)
  const defaultLocation = buildDefaultLocationOutput(root)
  const driveTimeFee = buildDriveTimeFeeFromRoot(root)
  const durationRounding = buildDurationRoundingFromRoot(root)

  const differentialPerspectives = buildDifferentialPerspectivesOutput(
    differential,
    allowedStateControlBlockInstanceIds
  )

  return {
    businessHours: bhOut,
    minuteIncrement: root.minuteIncrement,
    ...optionalKeyedSection('rangeConstraints', rcOut),
    ...optionalKeyedSection('buffers', buffersOut),
    ...optionalKeyedSection('maxWorkHours', mwOut),
    ...optionalKeyedSection('maxIncome', miOut),
    ...(overlapSources ? { overlapSources } : {}),
    ...(root.timezone ? { timezone: root.timezone } : {}),
    durationRounding,
    ...(differentialPerspectives ? { differentialPerspectives } : {}),
    ...(defaultLocation ? { defaultLocation } : {}),
    driveTimeFee,
  }
}

/** DB buffer_kind values for drive-time buffer API keys (avoids fieldEqualsString hardcoding noise). */
const DRIVE_BUFFER_API_TO_DB: Record<'driveToCandidate' | 'driveFromCandidate', string> = {
  driveToCandidate: 'drive_to_candidate',
  driveFromCandidate: 'drive_from_candidate',
}

type DriveBufferApiKey = keyof typeof DRIVE_BUFFER_API_TO_DB

export function isDriveBufferApiKey(
  key: keyof NonNullable<AvailabilitySettingsData['buffers']>
): key is DriveBufferApiKey {
  return Object.hasOwn(DRIVE_BUFFER_API_TO_DB, key)
}

export function apiBufferKind(
  key: keyof NonNullable<AvailabilitySettingsData['buffers']>
): string {
  if (isDriveBufferApiKey(key)) {
    return DRIVE_BUFFER_API_TO_DB[key]
  }
  return key
}

export function apiScopeToDb(scope: 'day' | 'calendarWeek' | 'rollingWeek'): string {
  if (scope === 'calendarWeek') return 'calendar_week'
  if (scope === 'rollingWeek') return 'rolling_week'
  return 'day'
}
