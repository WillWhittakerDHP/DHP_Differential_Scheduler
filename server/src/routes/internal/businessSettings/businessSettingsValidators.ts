import type { ValidationResult } from '../../helpers/routerValidators.js'
import { ERROR_MESSAGES, AVAILABILITY_SETTINGS_KEY } from './businessSettingsConstants.js'
import { runAvailabilitySettingsValidation } from './availabilitySettingsValidationCore.js'

export { RFC3339_ZULU_REGEX } from './availabilitySettingsValidationCore.js'

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

const AVAILABILITY_SETTINGS_EXPECTED_MESSAGE =
  'Expected: { businessHours: { 0-6: { start, end } }, minuteIncrement: number, buffers?: { leadTime?: BufferConfig, appointment?: BufferConfig, driveTime?: BufferConfig } }. Old fields (leadTime, bufferMinutes, bufferMode) are not allowed.'

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
  if (settingKey !== AVAILABILITY_SETTINGS_KEY) {
    return { valid: true }
  }
  if (runAvailabilitySettingsValidation(settingValue)) {
    return { valid: true }
  }
  return {
    valid: false,
    error: ERROR_MESSAGES.INVALID_AVAILABILITY_SETTINGS,
    details: { message: AVAILABILITY_SETTINGS_EXPECTED_MESSAGE },
  }
}
