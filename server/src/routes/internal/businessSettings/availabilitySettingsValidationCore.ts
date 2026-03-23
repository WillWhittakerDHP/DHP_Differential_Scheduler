/**
 * WHY: Split from businessSettingsValidators so validateAvailabilitySettings stays under
 * function-complexity thresholds (nesting ≤3, branches ≤8, length ≤50 when branchy).
 */
import type { AvailabilitySettingsData } from '../../../../../shared/types/availabilitySettingsDocument.js'
import { ROLLING_WEEK_DIRECTION } from '../../../utils/availabilities/availabilityConstants.js'

const rollingWeekDirectionValues = new Set<string>(Object.values(ROLLING_WEEK_DIRECTION))

/** RFC3339 instant with Zulu suffix (shared across businessHours and rangeConstraints.config). */
export const RFC3339_ZULU_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/

const ENFORCEMENT = ['off', 'flexible', 'hard'] as const
const BUFFER_PLACEMENT = ['off', 'before', 'after', 'both'] as const
const CALENDAR_PROVIDERS = ['google', 'outlook', 'none'] as const
const ROUNDING_METHODS = ['roundUp', 'roundDown', 'roundNearest'] as const

function includesString(list: readonly string[], v: string): boolean {
  return list.includes(v)
}

function rejectDeprecatedAvailabilityFields(d: Record<string, unknown>): boolean {
  if (d.workHoursPerDay !== undefined || d.calendarWeekLimit !== undefined || d.rollingWeekLimit !== undefined) {
    return true
  }
  if (d.leadTime !== undefined || d.bufferMinutes !== undefined || d.bufferMode !== undefined) {
    return true
  }
  const buffers = d.buffers as Record<string, unknown> | undefined
  return buffers?.leadTime !== undefined
}

function validateRootBusinessHours(d: Record<string, unknown>): boolean {
  if (!d.businessHours || typeof d.businessHours !== 'object') {
    return false
  }
  const businessHours = d.businessHours as Record<number, { start?: string; end?: string }>
  for (let day = 0; day <= 6; day++) {
    const dayHours = businessHours[day]
    if (!dayHours || typeof dayHours !== 'object') {
      return false
    }
    if (typeof dayHours.start !== 'string' || typeof dayHours.end !== 'string') {
      return false
    }
    if (!RFC3339_ZULU_REGEX.test(dayHours.start) || !RFC3339_ZULU_REGEX.test(dayHours.end)) {
      return false
    }
  }
  return true
}

function validateMinuteIncrement(d: Record<string, unknown>): boolean {
  return typeof d.minuteIncrement === 'number' && d.minuteIncrement > 0
}

function validateBusinessHoursConstraintInner(constraint: Record<string, unknown>): boolean {
  const enforcement = constraint.enforcement
  if (
    typeof constraint !== 'object' ||
    constraint.type !== 'businessHours' ||
    typeof enforcement !== 'string' ||
    !includesString(ENFORCEMENT as unknown as string[], enforcement) ||
    !constraint.config ||
    typeof constraint.config !== 'object'
  ) {
    return false
  }
  const config = constraint.config as Record<string, unknown>
  const hours = config.hours
  if (typeof hours !== 'object') {
    return false
  }
  const hoursByDay = hours as Record<number, { start?: unknown; end?: unknown } | undefined>
  for (let day = 0; day <= 6; day++) {
    const dayHours = hoursByDay[day]
    if (!dayHours) continue
    const start = dayHours.start
    const end = dayHours.end
    if (
      typeof dayHours !== 'object' ||
      typeof start !== 'string' ||
      typeof end !== 'string' ||
      !RFC3339_ZULU_REGEX.test(start) ||
      !RFC3339_ZULU_REGEX.test(end)
    ) {
      return false
    }
  }
  return true
}

function validateLeadTimeConstraintInner(constraint: Record<string, unknown>): boolean {
  const enforcement = constraint.enforcement
  const config = constraint.config
  if (
    typeof constraint !== 'object' ||
    constraint.type !== 'leadTime' ||
    typeof enforcement !== 'string' ||
    !includesString(ENFORCEMENT as unknown as string[], enforcement) ||
    !config ||
    typeof config !== 'object'
  ) {
    return false
  }
  const configObj = config as Record<string, unknown>
  return typeof configObj.minutes === 'number' && configObj.minutes >= 0
}

function validateDateRangeConstraintInner(constraint: Record<string, unknown>): boolean {
  const enforcement = constraint.enforcement
  const config = constraint.config
  if (
    typeof constraint !== 'object' ||
    constraint.type !== 'dateRange' ||
    typeof enforcement !== 'string' ||
    !includesString(ENFORCEMENT as unknown as string[], enforcement) ||
    !config ||
    typeof config !== 'object'
  ) {
    return false
  }
  const configObj = config as Record<string, unknown>
  return typeof configObj.start === 'string' && typeof configObj.end === 'string'
}

function validateRangeConstraintsBlock(d: Record<string, unknown>): boolean {
  if (d.rangeConstraints === undefined) {
    return true
  }
  if (typeof d.rangeConstraints !== 'object') {
    return false
  }
  const rangeConstraints = d.rangeConstraints as Record<string, unknown>
  if (rangeConstraints.businessHours !== undefined) {
    const constraint = rangeConstraints.businessHours as Record<string, unknown>
    if (!validateBusinessHoursConstraintInner(constraint)) {
      return false
    }
  }
  if (rangeConstraints.leadTime !== undefined) {
    const constraint = rangeConstraints.leadTime as Record<string, unknown>
    if (!validateLeadTimeConstraintInner(constraint)) {
      return false
    }
  }
  if (rangeConstraints.dateRange !== undefined) {
    const constraint = rangeConstraints.dateRange as Record<string, unknown>
    if (!validateDateRangeConstraintInner(constraint)) {
      return false
    }
  }
  return true
}

function validateTypedBuffer(
  buf: Record<string, unknown>,
  expectedType: string
): boolean {
  const placement = buf.placement
  const enforcement = buf.enforcement
  return (
    typeof buf === 'object' &&
    buf.type === expectedType &&
    typeof buf.minutes === 'number' &&
    buf.minutes >= 0 &&
    typeof placement === 'string' &&
    includesString(BUFFER_PLACEMENT as unknown as string[], placement) &&
    typeof enforcement === 'string' &&
    includesString(ENFORCEMENT as unknown as string[], enforcement)
  )
}

function validateBuffersBlock(d: Record<string, unknown>): boolean {
  if (d.buffers === undefined) {
    return true
  }
  if (typeof d.buffers !== 'object') {
    return false
  }
  const buffersObj = d.buffers as Record<string, unknown>
  if (buffersObj.appointment !== undefined) {
    const b = buffersObj.appointment as Record<string, unknown>
    if (!validateTypedBuffer(b, 'appointment')) {
      return false
    }
  }
  if (buffersObj.driveTime !== undefined) {
    const b = buffersObj.driveTime as Record<string, unknown>
    if (!validateTypedBuffer(b, 'driveTime')) {
      return false
    }
  }
  if (buffersObj.lunch !== undefined) {
    const b = buffersObj.lunch as Record<string, unknown>
    if (!validateTypedBuffer(b, 'lunch')) {
      return false
    }
  }
  return true
}

function validateMaxFilterSection(
  filter: Record<string, unknown>,
  valueKey: 'maxHours' | 'maxIncome',
  requireDirection: boolean
): boolean {
  const enforcement = filter.enforcement as string
  const raw = filter[valueKey]
  if (
    typeof filter !== 'object' ||
    typeof raw !== 'number' ||
    !includesString(ENFORCEMENT as unknown as string[], enforcement)
  ) {
    return false
  }
  if (!requireDirection) {
    return true
  }
  const direction = filter.direction as string
  return rollingWeekDirectionValues.has(direction)
}

function validateMaxWorkHoursOptional(d: Record<string, unknown>): boolean {
  const maxWorkHours = d.maxWorkHours as Record<string, unknown> | undefined
  if (maxWorkHours === undefined) {
    return true
  }
  if (typeof maxWorkHours !== 'object') {
    return false
  }
  const dayFilter = maxWorkHours.day as Record<string, unknown> | undefined
  if (dayFilter !== undefined && !validateMaxFilterSection(dayFilter, 'maxHours', false)) {
    return false
  }
  const calendarWeekFilter = maxWorkHours.calendarWeek as Record<string, unknown> | undefined
  if (calendarWeekFilter !== undefined && !validateMaxFilterSection(calendarWeekFilter, 'maxHours', false)) {
    return false
  }
  const rollingWeekFilter = maxWorkHours.rollingWeek as Record<string, unknown> | undefined
  if (rollingWeekFilter !== undefined && !validateMaxFilterSection(rollingWeekFilter, 'maxHours', true)) {
    return false
  }
  return true
}

function validateMaxIncomeOptional(d: Record<string, unknown>): boolean {
  const maxIncome = d.maxIncome as Record<string, unknown> | undefined
  if (maxIncome === undefined) {
    return true
  }
  if (typeof maxIncome !== 'object') {
    return false
  }
  const day = maxIncome.day as Record<string, unknown> | undefined
  if (day !== undefined && !validateMaxFilterSection(day, 'maxIncome', false)) {
    return false
  }
  const calendarWeek = maxIncome.calendarWeek as Record<string, unknown> | undefined
  if (calendarWeek !== undefined && !validateMaxFilterSection(calendarWeek, 'maxIncome', false)) {
    return false
  }
  const rollingWeek = maxIncome.rollingWeek as Record<string, unknown> | undefined
  if (rollingWeek !== undefined && !validateMaxFilterSection(rollingWeek, 'maxIncome', true)) {
    return false
  }
  return true
}

function validateDurationRoundingOptional(d: Record<string, unknown>): boolean {
  const durationRounding = d.durationRounding as Record<string, unknown> | undefined
  if (durationRounding === undefined) {
    return true
  }
  if (typeof durationRounding !== 'object') {
    return false
  }
  if (typeof durationRounding.enabled !== 'boolean') {
    return false
  }
  if (durationRounding.increment !== undefined) {
    const inc = durationRounding.increment as number
    if (typeof durationRounding.increment !== 'number' || inc <= 0) {
      return false
    }
  }
  if (durationRounding.method !== undefined) {
    const m = durationRounding.method as string
    if (!includesString(ROUNDING_METHODS as unknown as string[], m)) {
      return false
    }
  }
  return true
}

function validateCalendarEntries(entries: unknown): boolean {
  if (!Array.isArray(entries)) {
    return false
  }
  for (const entry of entries as Array<Record<string, unknown>>) {
    if (
      typeof entry !== 'object' ||
      typeof entry.email !== 'string' ||
      typeof entry.readFrom !== 'boolean' ||
      typeof entry.writeTo !== 'boolean'
    ) {
      return false
    }
    if (entry.label !== undefined && typeof entry.label !== 'string') {
      return false
    }
  }
  return true
}

function validateCalendarConfigOptional(d: Record<string, unknown>): boolean {
  const calendarConfig = d.calendarConfig as Record<string, unknown> | undefined
  if (calendarConfig === undefined) {
    return true
  }
  if (typeof calendarConfig !== 'object') {
    return false
  }
  if (typeof calendarConfig.enabled !== 'boolean') {
    return false
  }
  const provider = calendarConfig.provider as string
  if (!includesString(CALENDAR_PROVIDERS as unknown as string[], provider)) {
    return false
  }
  if (calendarConfig.calendars === undefined) {
    return true
  }
  return validateCalendarEntries(calendarConfig.calendars)
}

function validateDriveTimeFeeOptional(d: Record<string, unknown>): boolean {
  const driveTimeFee = d.driveTimeFee as Record<string, unknown> | undefined
  if (driveTimeFee === undefined) {
    return true
  }
  if (typeof driveTimeFee !== 'object' || driveTimeFee === null) {
    return false
  }
  const c = driveTimeFee.complimentaryDriveMinutes
  const r = driveTimeFee.drivingRatePerHour
  const round = driveTimeFee.driveTimeRoundingMinutes
  if (typeof c !== 'number' || c < 0 || !Number.isFinite(c)) {
    return false
  }
  if (typeof r !== 'number' || r < 0 || !Number.isFinite(r)) {
    return false
  }
  if (typeof round !== 'number' || round <= 0 || !Number.isFinite(round)) {
    return false
  }
  return true
}

/**
 * Full availability document shape check (orchestrator only; steps keep branch count low).
 */
export function runAvailabilitySettingsValidation(data: unknown): data is AvailabilitySettingsData {
  if (!data || typeof data !== 'object') {
    return false
  }
  const d = data as Record<string, unknown>
  const steps: ReadonlyArray<(x: Record<string, unknown>) => boolean> = [
    (x) => !rejectDeprecatedAvailabilityFields(x),
    validateRootBusinessHours,
    validateMinuteIncrement,
    validateRangeConstraintsBlock,
    validateBuffersBlock,
    validateMaxWorkHoursOptional,
    validateMaxIncomeOptional,
    validateDurationRoundingOptional,
    validateCalendarConfigOptional,
    validateDriveTimeFeeOptional,
  ]
  for (const step of steps) {
    if (!step(d)) {
      return false
    }
  }
  return true
}
