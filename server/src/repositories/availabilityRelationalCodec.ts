/**
 * Assemble / disassemble AvailabilitySettingsData from relational rows (no JSONB).
 */
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import type {
  ConstraintEnforcement,
  RangeConstraint,
  RFC3339DateTime,
  DayHours,
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

function iso(d: Date): string {
  return d.toISOString()
}

function scopeToApi(scope: string): 'day' | 'calendarWeek' | 'rollingWeek' {
  if (scope === 'calendar_week') return 'calendarWeek'
  if (scope === 'rolling_week') return 'rollingWeek'
  return 'day'
}

function bufferKindToApi(kind: string): keyof NonNullable<AvailabilitySettingsData['buffers']> | null {
  if (kind === 'appointment') return 'appointment'
  if (kind === 'drive_to_candidate') return 'driveToCandidate'
  if (kind === 'drive_from_candidate') return 'driveFromCandidate'
  if (kind === 'lunch') return 'lunch'
  return null
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

function rangeConstraintFromRow(
  rc: AvailabilityRangeConstraint,
  hourRows: AvailabilityRangeConstraintHour[]
): RangeConstraint | null {
  const enf = rc.enforcement as ConstraintEnforcement
  if (rc.rangeType === 'businessHours') {
    if (hourRows.length === 0) return null
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

export function assembleAvailabilityDocument(
  root: AvailabilitySetting,
  businessHours: AvailabilityBusinessHour[],
  buffers: AvailabilityBufferEntry[],
  rangeConstraints: AvailabilityRangeConstraint[],
  rangeConstraintHours: AvailabilityRangeConstraintHour[],
  maxWork: AvailabilityMaxWorkHour[],
  maxIncome: AvailabilityMaxIncomeRow[],
  differential: AvailabilityDifferentialAttendee[]
): AvailabilitySettingsData {
  const base = defaultAvailabilitySettings
  const bhOut: AvailabilitySettingsData['businessHours'] = { ...base.businessHours }
  for (const r of businessHours) {
    const k = r.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6
    bhOut[k] = { start: iso(r.startAt), end: iso(r.endAt) }
  }

  const buffersOut: NonNullable<AvailabilitySettingsData['buffers']> = {}
  for (const b of buffers) {
    const apiKey = bufferKindToApi(b.bufferKind)
    if (!apiKey || b.minutes == null || !b.enforcement) continue
    if (apiKey === 'driveToCandidate' || apiKey === 'driveFromCandidate') {
      buffersOut[apiKey] = {
        minutes: b.minutes,
        enforcement: b.enforcement as ConstraintEnforcement,
        applyTo: (b.applyTo ?? 'all') as import('../../../shared/types/availabilityTypes.js').DriveTimeApplyTo,
      }
      continue
    }
    if (!b.placement) continue
    buffersOut[apiKey] = {
      type: apiKey === 'lunch' ? 'lunch' : 'appointment',
      minutes: b.minutes,
      placement: b.placement as import('../../../shared/types/availabilityTypes.js').BufferPlacement,
      enforcement: b.enforcement as ConstraintEnforcement,
    }
  }

  const hoursByRc = new Map<string, AvailabilityRangeConstraintHour[]>()
  for (const h of rangeConstraintHours) {
    const list = hoursByRc.get(h.rangeConstraintId) ?? []
    list.push(h)
    hoursByRc.set(h.rangeConstraintId, list)
  }

  const rcOut: NonNullable<AvailabilitySettingsData['rangeConstraints']> = {}
  for (const rc of rangeConstraints) {
    const hrs = hoursByRc.get(rc.id) ?? []
    const built = rangeConstraintFromRow(rc, hrs)
    if (!built) continue
    if (rc.rangeType === 'businessHours') rcOut.businessHours = built
    else if (rc.rangeType === 'leadTime') rcOut.leadTime = built
    else if (rc.rangeType === 'dateRange') rcOut.dateRange = built
  }

  const mwOut: NonNullable<AvailabilitySettingsData['maxWorkHours']> = {}
  for (const r of maxWork) {
    const sk = scopeToApi(r.scope)
    const entry = {
      maxHours: r.maxHours,
      enforcement: r.enforcement as ConstraintEnforcement,
      ...(r.rollingDirection ? { direction: r.rollingDirection as import('../../../shared/types/availabilityTypes.js').RollingWeekDirection } : {}),
    }
    if (sk === 'rollingWeek') {
      mwOut.rollingWeek = entry as import('../../../shared/types/availabilityTypes.js').RollingWeekCapacityFilter
    } else if (sk === 'calendarWeek') {
      mwOut.calendarWeek = entry as import('../../../shared/types/availabilityTypes.js').WorkCapacityFilter
    } else {
      mwOut.day = entry as import('../../../shared/types/availabilityTypes.js').WorkCapacityFilter
    }
  }

  const miOut: NonNullable<AvailabilitySettingsData['maxIncome']> = {}
  for (const r of maxIncome) {
    const sk = scopeToApi(r.scope)
    const entry = {
      maxIncome: r.maxIncome,
      enforcement: r.enforcement as ConstraintEnforcement,
      ...(r.rollingDirection ? { direction: r.rollingDirection as import('../../../shared/types/availabilityTypes.js').RollingWeekDirection } : {}),
    }
    if (sk === 'rollingWeek') {
      miOut.rollingWeek = entry as import('../../../shared/types/availabilityTypes.js').RollingWeekIncomeCapacityFilter
    } else if (sk === 'calendarWeek') {
      miOut.calendarWeek = entry as import('../../../shared/types/availabilityTypes.js').IncomeCapacityFilter
    } else {
      miOut.day = entry as import('../../../shared/types/availabilityTypes.js').IncomeCapacityFilter
    }
  }

  let overlapSources: AvailabilitySettingsData['overlapSources']
  if (root.overlapOutOfOfficeEnforcement) {
    overlapSources = {
      outOfOffice: { enforcement: root.overlapOutOfOfficeEnforcement as ConstraintEnforcement },
    }
  }

  let defaultLocation: AvailabilitySettingsData['defaultLocation']
  if (root.defaultLocationPlaceId || root.defaultLocationLat != null) {
    defaultLocation = {
      placeId: root.defaultLocationPlaceId ?? '',
      ...(root.defaultLocationLabel ? { label: root.defaultLocationLabel } : {}),
      ...(root.defaultLocationLat != null && root.defaultLocationLng != null
        ? { coordinates: { lat: root.defaultLocationLat, lng: root.defaultLocationLng } }
        : {}),
    }
  }

  const majors = differential.filter((d) => d.role === 'major').sort((a, b) => a.sortOrder - b.sortOrder)
  const minors = differential.filter((d) => d.role === 'minor').sort((a, b) => a.sortOrder - b.sortOrder)
  let differentialPerspectives: AvailabilitySettingsData['differentialPerspectives']
  if (majors.length || minors.length) {
    differentialPerspectives = {
      ...(majors.length ? { majorAttendees: majors.map((x) => x.value) } : {}),
      ...(minors.length ? { minorAttendees: minors.map((x) => x.value) } : {}),
    }
  }

  return {
    businessHours: bhOut,
    minuteIncrement: root.minuteIncrement,
    ...(Object.keys(rcOut).length ? { rangeConstraints: rcOut } : {}),
    ...(Object.keys(buffersOut).length ? { buffers: buffersOut } : {}),
    ...(Object.keys(mwOut).length ? { maxWorkHours: mwOut } : {}),
    ...(Object.keys(miOut).length ? { maxIncome: miOut } : {}),
    ...(overlapSources ? { overlapSources } : {}),
    ...(root.timezone ? { timezone: root.timezone } : {}),
    durationRounding: {
      enabled: root.durationRoundingEnabled,
      ...(root.durationRoundingIncrement != null ? { increment: root.durationRoundingIncrement } : {}),
      ...(root.durationRoundingMethod
        ? { method: root.durationRoundingMethod as 'roundUp' | 'roundDown' | 'roundNearest' }
        : {}),
    },
    ...(differentialPerspectives ? { differentialPerspectives } : {}),
    ...(defaultLocation ? { defaultLocation } : {}),
  }
}

export function apiBufferKind(
  key: keyof NonNullable<AvailabilitySettingsData['buffers']>
): string {
  if (key === 'driveToCandidate') return 'drive_to_candidate'
  if (key === 'driveFromCandidate') return 'drive_from_candidate'
  return key
}

export function apiScopeToDb(scope: 'day' | 'calendarWeek' | 'rollingWeek'): string {
  if (scope === 'calendarWeek') return 'calendar_week'
  if (scope === 'rollingWeek') return 'rolling_week'
  return 'day'
}
