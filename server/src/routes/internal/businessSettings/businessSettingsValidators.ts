
import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js'
import type { ValidationResult } from '../../helpers/routerValidators.js'
import { ERROR_MESSAGES, AVAILABILITY_SETTINGS_KEY } from './businessSettingsConstants.js'

/**
 * Validate availability settings structure
 * 
 * @param data - Data to validate
 * @returns true if data is valid AvailabilitySettingsData, false otherwise
 */
export function validateAvailabilitySettings(data: unknown): data is AvailabilitySettingsData {
  if (!data || typeof data !== 'object') {
    return false
  }
  const d = data as Record<string, unknown>

  // Reject old structure - check for deprecated fields
  if (d.workHoursPerDay !== undefined || d.calendarWeekLimit !== undefined || d.rollingWeekLimit !== undefined) {
    return false // Old structure not allowed
  }

  // Reject old buffer structure - check for deprecated fields
  if (d.leadTime !== undefined || d.bufferMinutes !== undefined || d.bufferMode !== undefined) {
    return false // Old buffer structure not allowed - must use rangeConstraints.leadTime and buffers.appointment
  }

  // Reject old buffers.leadTime structure - leadTime moved to rangeConstraints.leadTime
  const buffers = d.buffers as Record<string, unknown> | undefined
  if (buffers?.leadTime !== undefined) {
    return false // buffers.leadTime deprecated - must use rangeConstraints.leadTime
  }

  if (!d.businessHours || typeof d.businessHours !== 'object') {
    return false
  }

  // Validate each day (0-6)
  const businessHours = d.businessHours as Record<number, { start?: string; end?: string }>
  for (let day = 0; day <= 6; day++) {
    const dayHours = businessHours[day]
    if (!dayHours || typeof dayHours !== 'object') {
      return false
    }
    if (typeof dayHours.start !== 'string' || typeof dayHours.end !== 'string') {
      return false
    }
    // Validate RFC3339 format with reference date (2000-01-01T00:00:00Z pattern)
    const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
    if (!rfc3339Regex.test(dayHours.start) || !rfc3339Regex.test(dayHours.end)) {
      return false
    }
  }

  // Validate minuteIncrement
  if (typeof d.minuteIncrement !== 'number' || d.minuteIncrement <= 0) {
    return false
  }

  // Validate rangeConstraints structure if present
  if (d.rangeConstraints !== undefined) {
    if (typeof d.rangeConstraints !== 'object') {
      return false
    }
    const rangeConstraints = d.rangeConstraints as Record<string, unknown>
    // Validate businessHours constraint if present
    if (rangeConstraints.businessHours !== undefined) {
      const constraint = rangeConstraints.businessHours as Record<string, unknown>
      const enforcement = constraint.enforcement
      if (typeof constraint !== 'object' ||
          constraint.type !== 'businessHours' ||
          typeof enforcement !== 'string' ||
          !['off', 'flexible', 'hard'].includes(enforcement) ||
          !constraint.config ||
          typeof constraint.config !== 'object') {
        return false
      }
      const config = constraint.config as Record<string, unknown>
      const hours = config.hours
      if (typeof hours !== 'object') {
        return false
      }
      const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
      const hoursByDay = hours as Record<number, { start?: unknown; end?: unknown } | undefined>
      for (let day = 0; day <= 6; day++) {
        const dayHours = hoursByDay[day]
        if (dayHours) {
          const start = dayHours.start
          const end = dayHours.end
          if (typeof dayHours !== 'object' ||
              typeof start !== 'string' ||
              typeof end !== 'string' ||
              !rfc3339Regex.test(start) ||
              !rfc3339Regex.test(end)) {
            return false
          }
        }
      }
    }
    
    // Validate leadTime constraint if present
    if (rangeConstraints.leadTime !== undefined) {
      const constraint = rangeConstraints.leadTime as Record<string, unknown>
      const enforcement = constraint.enforcement
      const config = constraint.config
      if (typeof constraint !== 'object' ||
          constraint.type !== 'leadTime' ||
          typeof enforcement !== 'string' ||
          !['off', 'flexible', 'hard'].includes(enforcement) ||
          !config ||
          typeof config !== 'object') {
        return false
      }
      const configObj = config as Record<string, unknown>
      if (typeof configObj.minutes !== 'number' || configObj.minutes < 0) {
        return false
      }
    }
    
    // Validate dateRange constraint if present
    if (rangeConstraints.dateRange !== undefined) {
      const constraint = rangeConstraints.dateRange as Record<string, unknown>
      const enforcement = constraint.enforcement
      const config = constraint.config
      if (typeof constraint !== 'object' ||
          constraint.type !== 'dateRange' ||
          typeof enforcement !== 'string' ||
          !['off', 'flexible', 'hard'].includes(enforcement) ||
          !config ||
          typeof config !== 'object') {
        return false
      }
      const configObj = config as Record<string, unknown>
      if (typeof configObj.start !== 'string' || typeof configObj.end !== 'string') {
        return false
      }
    }
  }

  // Validate buffers structure if present (leadTime moved to rangeConstraints)
  if (d.buffers !== undefined) {
    if (typeof d.buffers !== 'object') {
      return false
    }
    const buffersObj = d.buffers as Record<string, unknown>
    // Validate appointment buffer if present
    if (buffersObj.appointment !== undefined) {
      const appointmentBuffer = buffersObj.appointment as Record<string, unknown>
      const placement = appointmentBuffer.placement
      const enforcement = appointmentBuffer.enforcement
      if (typeof appointmentBuffer !== 'object' ||
          appointmentBuffer.type !== 'appointment' ||
          typeof appointmentBuffer.minutes !== 'number' ||
          appointmentBuffer.minutes < 0 ||
          typeof placement !== 'string' ||
          !['off', 'before', 'after', 'both'].includes(placement) ||
          typeof enforcement !== 'string' ||
          !['off', 'flexible', 'hard'].includes(enforcement)) {
        return false
      }
    }
    
    // Validate driveTime buffer if present
    if (buffersObj.driveTime !== undefined) {
      const driveTimeBuffer = buffersObj.driveTime as Record<string, unknown>
      const placement = driveTimeBuffer.placement
      const enforcement = driveTimeBuffer.enforcement
      if (typeof driveTimeBuffer !== 'object' ||
          driveTimeBuffer.type !== 'driveTime' ||
          typeof driveTimeBuffer.minutes !== 'number' ||
          driveTimeBuffer.minutes < 0 ||
          typeof placement !== 'string' ||
          !['off', 'before', 'after', 'both'].includes(placement) ||
          typeof enforcement !== 'string' ||
          !['off', 'flexible', 'hard'].includes(enforcement)) {
        return false
      }
    }
    
    // Validate lunch buffer if present
    if (buffersObj.lunch !== undefined) {
      const lunchBuffer = buffersObj.lunch as Record<string, unknown>
      const placement = lunchBuffer.placement
      const enforcement = lunchBuffer.enforcement
      if (typeof lunchBuffer !== 'object' ||
          lunchBuffer.type !== 'lunch' ||
          typeof lunchBuffer.minutes !== 'number' ||
          lunchBuffer.minutes < 0 ||
          typeof placement !== 'string' ||
          !['off', 'before', 'after', 'both'].includes(placement) ||
          typeof enforcement !== 'string' ||
          !['off', 'flexible', 'hard'].includes(enforcement)) {
        return false
      }
    }
  }

  // Validate maxWorkHours structure if present
  const maxWorkHours = d.maxWorkHours as Record<string, unknown> | undefined
  if (maxWorkHours !== undefined) {
    if (typeof maxWorkHours !== 'object') {
      return false
    }
    const dayFilter = maxWorkHours.day as Record<string, unknown> | undefined
    if (dayFilter !== undefined) {
      if (typeof dayFilter !== 'object' ||
          typeof (dayFilter as Record<string, unknown>).maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes((dayFilter as Record<string, unknown>).enforcement as string)) {
        return false
      }
    }
    const calendarWeekFilter = maxWorkHours.calendarWeek as Record<string, unknown> | undefined
    if (calendarWeekFilter !== undefined) {
      if (typeof calendarWeekFilter !== 'object' ||
          typeof (calendarWeekFilter as Record<string, unknown>).maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes((calendarWeekFilter as Record<string, unknown>).enforcement as string)) {
        return false
      }
    }
    const rollingWeekFilter = maxWorkHours.rollingWeek as Record<string, unknown> | undefined
    if (rollingWeekFilter !== undefined) {
      if (typeof rollingWeekFilter !== 'object' ||
          typeof (rollingWeekFilter as Record<string, unknown>).maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes((rollingWeekFilter as Record<string, unknown>).enforcement as string) ||
          !['past', 'centered', 'future'].includes((rollingWeekFilter as Record<string, unknown>).direction as string)) {
        return false
      }
    }
  }

  // Validate maxIncome structure if present (same shape as maxWorkHours but maxIncome field)
  const maxIncome = d.maxIncome as Record<string, unknown> | undefined
  if (maxIncome !== undefined) {
    if (typeof maxIncome !== 'object') {
      return false
    }
    const maxIncomeDay = maxIncome.day as Record<string, unknown> | undefined
    if (maxIncomeDay !== undefined) {
      if (typeof maxIncomeDay !== 'object' ||
          typeof (maxIncomeDay as Record<string, unknown>).maxIncome !== 'number' ||
          !['off', 'flexible', 'hard'].includes((maxIncomeDay as Record<string, unknown>).enforcement as string)) {
        return false
      }
    }
    const maxIncomeCalendarWeek = maxIncome.calendarWeek as Record<string, unknown> | undefined
    if (maxIncomeCalendarWeek !== undefined) {
      if (typeof maxIncomeCalendarWeek !== 'object' ||
          typeof (maxIncomeCalendarWeek as Record<string, unknown>).maxIncome !== 'number' ||
          !['off', 'flexible', 'hard'].includes((maxIncomeCalendarWeek as Record<string, unknown>).enforcement as string)) {
        return false
      }
    }
    const maxIncomeRollingWeek = maxIncome.rollingWeek as Record<string, unknown> | undefined
    if (maxIncomeRollingWeek !== undefined) {
      if (typeof maxIncomeRollingWeek !== 'object' ||
          typeof (maxIncomeRollingWeek as Record<string, unknown>).maxIncome !== 'number' ||
          !['off', 'flexible', 'hard'].includes((maxIncomeRollingWeek as Record<string, unknown>).enforcement as string) ||
          !['past', 'centered', 'future'].includes((maxIncomeRollingWeek as Record<string, unknown>).direction as string)) {
        return false
      }
    }
  }

  // Validate durationRounding structure if present
  const durationRounding = d.durationRounding as Record<string, unknown> | undefined
  if (durationRounding !== undefined) {
    if (typeof durationRounding !== 'object') {
      return false
    }
    if (typeof durationRounding.enabled !== 'boolean') {
      return false
    }
    if (durationRounding.increment !== undefined) {
      if (typeof durationRounding.increment !== 'number' || (durationRounding.increment as number) <= 0) {
        return false
      }
    }
    if (durationRounding.method !== undefined) {
      if (!['roundUp', 'roundDown', 'roundNearest'].includes(durationRounding.method as string)) {
        return false
      }
    }
  }

  // Validate calendarConfig structure if present
  const calendarConfig = d.calendarConfig as Record<string, unknown> | undefined
  if (calendarConfig !== undefined) {
    if (typeof calendarConfig !== 'object') {
      return false
    }
    if (typeof calendarConfig.enabled !== 'boolean') {
      return false
    }
    if (!['google', 'outlook', 'none'].includes(calendarConfig.provider as string)) {
      return false
    }
    // Validate calendars array (required, must be array)
    if (calendarConfig.calendars !== undefined) {
      if (!Array.isArray(calendarConfig.calendars)) {
        return false // Must be array format
      }
      for (const entry of calendarConfig.calendars as Array<Record<string, unknown>>) {
        if (typeof entry !== 'object' ||
            typeof entry.email !== 'string' ||
            typeof entry.readFrom !== 'boolean' ||
            typeof entry.writeTo !== 'boolean') {
          return false
        }
        if (entry.label !== undefined && typeof entry.label !== 'string') {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Validate setting key
 * 
 * @param settingKey - Setting key to validate
 * @returns ValidationResult indicating if setting key is valid
 */
export function validateSettingKey(settingKey: unknown): ValidationResult {
  if (!settingKey || typeof settingKey !== 'string') {
    return {
      valid: false,
      error: ERROR_MESSAGES.SETTING_KEY_REQUIRED,
    }
  }
  
  return { valid: true }
}

/**
 * Validate setting value
 * 
 * @param settingValue - Setting value to validate
 * @returns ValidationResult indicating if setting value is valid
 */
export function validateSettingValue(settingValue: unknown): ValidationResult {
  if (!settingValue) {
    return {
      valid: false,
      error: ERROR_MESSAGES.SETTING_VALUE_REQUIRED,
    }
  }
  
  return { valid: true }
}

/**
 * Validate availability settings with detailed error message
 * 
 * @param settingKey - Setting key
 * @param settingValue - Setting value to validate
 * @returns ValidationResult indicating if availability settings are valid
 */
export function validateAvailabilitySettingsWithDetails(
  settingKey: string,
  settingValue: unknown
): ValidationResult {
  if (settingKey === AVAILABILITY_SETTINGS_KEY) {
    if (!validateAvailabilitySettings(settingValue)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_AVAILABILITY_SETTINGS,
        details: {
          message: 'Expected: { businessHours: { 0-6: { start, end } }, minuteIncrement: number, buffers?: { leadTime?: BufferConfig, appointment?: BufferConfig, driveTime?: BufferConfig } }. Old fields (leadTime, bufferMinutes, bufferMode) are not allowed.',
        }
      }
    }
  }
  
  return { valid: true }
}
