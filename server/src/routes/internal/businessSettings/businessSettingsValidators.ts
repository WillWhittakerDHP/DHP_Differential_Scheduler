/**
 * Business Settings Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for business settings operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js'
import type { ValidationResult } from '../../helpers/routerValidators.js'
import { ERROR_MESSAGES, AVAILABILITY_SETTINGS_KEY } from './businessSettingsConstants.js'

/**
 * Validate availability settings structure
 * LEARNING: Complex validation function for availability settings
 * WHY: Ensures availability settings conform to expected structure and rejects deprecated fields
 * PATTERN: Type guard function that validates all aspects of availability settings
 * 
 * @param data - Data to validate
 * @returns true if data is valid AvailabilitySettingsData, false otherwise
 */
export function validateAvailabilitySettings(data: any): data is AvailabilitySettingsData {
  if (!data || typeof data !== 'object') {
    return false
  }

  // Reject old structure - check for deprecated fields
  if (data.workHoursPerDay !== undefined || data.calendarWeekLimit !== undefined || data.rollingWeekLimit !== undefined) {
    return false // Old structure not allowed
  }

  // Reject old buffer structure - check for deprecated fields
  if (data.leadTime !== undefined || data.bufferMinutes !== undefined || data.bufferMode !== undefined) {
    return false // Old buffer structure not allowed - must use rangeConstraints.leadTime and buffers.appointment
  }

  // Reject old buffers.leadTime structure - leadTime moved to rangeConstraints.leadTime
  if (data.buffers?.leadTime !== undefined) {
    return false // buffers.leadTime deprecated - must use rangeConstraints.leadTime
  }

  if (!data.businessHours || typeof data.businessHours !== 'object') {
    return false
  }

  // Validate each day (0-6)
  for (let day = 0; day <= 6; day++) {
    const dayHours = data.businessHours[day]
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
  if (typeof data.minuteIncrement !== 'number' || data.minuteIncrement <= 0) {
    return false
  }

  // Validate rangeConstraints structure if present
  if (data.rangeConstraints !== undefined) {
    if (typeof data.rangeConstraints !== 'object') {
      return false
    }
    
    // Validate businessHours constraint if present
    if (data.rangeConstraints.businessHours !== undefined) {
      const constraint = data.rangeConstraints.businessHours
      if (typeof constraint !== 'object' ||
          constraint.type !== 'businessHours' ||
          !['off', 'flexible', 'hard'].includes(constraint.enforcement) ||
          !constraint.config ||
          typeof constraint.config !== 'object' ||
          !constraint.config.hours) {
        return false
      }
      // Validate businessHours.config.hours format (RFC3339)
      const hours = constraint.config.hours
      if (typeof hours !== 'object') {
        return false
      }
      const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
      for (let day = 0; day <= 6; day++) {
        const dayHours = hours[day]
        if (dayHours) {
          if (typeof dayHours !== 'object' ||
              typeof dayHours.start !== 'string' ||
              typeof dayHours.end !== 'string' ||
              !rfc3339Regex.test(dayHours.start) ||
              !rfc3339Regex.test(dayHours.end)) {
            return false
          }
        }
      }
    }
    
    // Validate leadTime constraint if present
    if (data.rangeConstraints.leadTime !== undefined) {
      const constraint = data.rangeConstraints.leadTime
      if (typeof constraint !== 'object' ||
          constraint.type !== 'leadTime' ||
          !['off', 'flexible', 'hard'].includes(constraint.enforcement) ||
          !constraint.config ||
          typeof constraint.config !== 'object' ||
          typeof constraint.config.minutes !== 'number' ||
          constraint.config.minutes < 0) {
        return false
      }
    }
    
    // Validate dateRange constraint if present
    if (data.rangeConstraints.dateRange !== undefined) {
      const constraint = data.rangeConstraints.dateRange
      if (typeof constraint !== 'object' ||
          constraint.type !== 'dateRange' ||
          !['off', 'flexible', 'hard'].includes(constraint.enforcement) ||
          !constraint.config ||
          typeof constraint.config !== 'object' ||
          typeof constraint.config.start !== 'string' ||
          typeof constraint.config.end !== 'string') {
        return false
      }
    }
  }

  // Validate buffers structure if present (leadTime moved to rangeConstraints)
  if (data.buffers !== undefined) {
    if (typeof data.buffers !== 'object') {
      return false
    }
    
    // Validate appointment buffer if present
    if (data.buffers.appointment !== undefined) {
      const appointmentBuffer = data.buffers.appointment
      if (typeof appointmentBuffer !== 'object' ||
          appointmentBuffer.type !== 'appointment' ||
          typeof appointmentBuffer.minutes !== 'number' ||
          appointmentBuffer.minutes < 0 ||
          !['off', 'before', 'after', 'both'].includes(appointmentBuffer.placement) ||
          !['off', 'flexible', 'hard'].includes(appointmentBuffer.enforcement)) {
        return false
      }
    }
    
    // Validate driveTime buffer if present
    if (data.buffers.driveTime !== undefined) {
      const driveTimeBuffer = data.buffers.driveTime
      if (typeof driveTimeBuffer !== 'object' ||
          driveTimeBuffer.type !== 'driveTime' ||
          typeof driveTimeBuffer.minutes !== 'number' ||
          driveTimeBuffer.minutes < 0 ||
          !['off', 'before', 'after', 'both'].includes(driveTimeBuffer.placement) ||
          !['off', 'flexible', 'hard'].includes(driveTimeBuffer.enforcement)) {
        return false
      }
    }
    
    // Validate lunch buffer if present
    if (data.buffers.lunch !== undefined) {
      const lunchBuffer = data.buffers.lunch
      if (typeof lunchBuffer !== 'object' ||
          lunchBuffer.type !== 'lunch' ||
          typeof lunchBuffer.minutes !== 'number' ||
          lunchBuffer.minutes < 0 ||
          !['off', 'before', 'after', 'both'].includes(lunchBuffer.placement) ||
          !['off', 'flexible', 'hard'].includes(lunchBuffer.enforcement)) {
        return false
      }
    }
  }

  // Validate maxWorkHours structure if present
  if (data.maxWorkHours !== undefined) {
    if (typeof data.maxWorkHours !== 'object') {
      return false
    }
    // Validate day filter if present
    if (data.maxWorkHours.day !== undefined) {
      if (typeof data.maxWorkHours.day !== 'object' ||
          typeof data.maxWorkHours.day.maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxWorkHours.day.enforcement)) {
        return false
      }
    }
    // Validate calendarWeek filter if present
    if (data.maxWorkHours.calendarWeek !== undefined) {
      if (typeof data.maxWorkHours.calendarWeek !== 'object' ||
          typeof data.maxWorkHours.calendarWeek.maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxWorkHours.calendarWeek.enforcement)) {
        return false
      }
    }
    // Validate rollingWeek filter if present
    if (data.maxWorkHours.rollingWeek !== undefined) {
      if (typeof data.maxWorkHours.rollingWeek !== 'object' ||
          typeof data.maxWorkHours.rollingWeek.maxHours !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxWorkHours.rollingWeek.enforcement) ||
          !['past', 'centered', 'future'].includes(data.maxWorkHours.rollingWeek.direction)) {
        return false
      }
    }
  }

  // Validate maxIncome structure if present (same shape as maxWorkHours but maxIncome field)
  if (data.maxIncome !== undefined) {
    if (typeof data.maxIncome !== 'object') {
      return false
    }
    if (data.maxIncome.day !== undefined) {
      if (typeof data.maxIncome.day !== 'object' ||
          typeof data.maxIncome.day.maxIncome !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxIncome.day.enforcement)) {
        return false
      }
    }
    if (data.maxIncome.calendarWeek !== undefined) {
      if (typeof data.maxIncome.calendarWeek !== 'object' ||
          typeof data.maxIncome.calendarWeek.maxIncome !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxIncome.calendarWeek.enforcement)) {
        return false
      }
    }
    if (data.maxIncome.rollingWeek !== undefined) {
      if (typeof data.maxIncome.rollingWeek !== 'object' ||
          typeof data.maxIncome.rollingWeek.maxIncome !== 'number' ||
          !['off', 'flexible', 'hard'].includes(data.maxIncome.rollingWeek.enforcement) ||
          !['past', 'centered', 'future'].includes(data.maxIncome.rollingWeek.direction)) {
        return false
      }
    }
  }

  // Validate durationRounding structure if present
  if (data.durationRounding !== undefined) {
    if (typeof data.durationRounding !== 'object') {
      return false
    }
    if (typeof data.durationRounding.enabled !== 'boolean') {
      return false
    }
    if (data.durationRounding.increment !== undefined) {
      if (typeof data.durationRounding.increment !== 'number' || data.durationRounding.increment <= 0) {
        return false
      }
    }
    if (data.durationRounding.method !== undefined) {
      if (!['roundUp', 'roundDown', 'roundNearest'].includes(data.durationRounding.method)) {
        return false
      }
    }
  }

  // Validate calendarConfig structure if present
  if (data.calendarConfig !== undefined) {
    if (typeof data.calendarConfig !== 'object') {
      return false
    }
    if (typeof data.calendarConfig.enabled !== 'boolean') {
      return false
    }
    if (!['google', 'outlook', 'none'].includes(data.calendarConfig.provider)) {
      return false
    }
    // Validate calendars array (required, must be array)
    if (data.calendarConfig.calendars !== undefined) {
      if (!Array.isArray(data.calendarConfig.calendars)) {
        return false // Must be array format
      }
      // Validate array entries
      for (const entry of data.calendarConfig.calendars) {
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
 * LEARNING: Extracted setting key validation logic
 * WHY: Reusable validation for business settings operations
 * PATTERN: Check setting key, return validation result
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
 * LEARNING: Extracted setting value validation logic
 * WHY: Reusable validation for business settings operations
 * PATTERN: Check setting value, return validation result
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
 * LEARNING: Wrapper around validateAvailabilitySettings with detailed error message
 * WHY: Provides detailed validation error for availability settings
 * PATTERN: Check validation, return validation result with details
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
