/**
 * Business Settings Router Helper Functions
 * 
 * LEARNING: Extracted helper functions for business settings operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure functions for complex logic
 */

import { BusinessSettings } from '../../../config/app.js'
import { AVAILABILITY_SETTINGS_KEY, defaultAvailabilitySettings } from './businessSettingsConstants.js'

/**
 * Transform setting to response format
 * LEARNING: Transforms BusinessSettings model to API response format
 * WHY: Provides consistent format for settings responses
 * PATTERN: Map model to response format
 * 
 * @param setting - BusinessSettings model instance
 * @returns Response format object
 */
export function transformSettingToResponse(setting: any): { setting_key: string; setting_value: unknown } {
  return {
    setting_key: setting.settingKey,
    setting_value: setting.settingValue,
  }
}

/**
 * Get setting with default fallback for availability settings
 * LEARNING: Gets setting or returns default for availability settings
 * WHY: Provides default values when availability settings don't exist
 * PATTERN: Check if setting exists, return default if not
 * 
 * @param setting - BusinessSettings model instance or null
 * @param key - Setting key
 * @returns Setting response or default for availability settings
 */
export function getSettingWithDefault(
  setting: any | null,
  key: string
): { setting_key: string; setting_value: unknown } {
  if (!setting) {
    if (key === AVAILABILITY_SETTINGS_KEY) {
      return {
        setting_key: AVAILABILITY_SETTINGS_KEY,
        setting_value: defaultAvailabilitySettings,
      }
    }
    return null as any
  }
  
  return transformSettingToResponse(setting)
}

/**
 * Merge setting values for PATCH operation
 * LEARNING: Merges existing setting value with new value
 * WHY: Enables partial updates for settings
 * PATTERN: Spread existing value, then new value
 * 
 * @param existingValue - Existing setting value
 * @param newValue - New setting value to merge
 * @returns Merged setting value
 */
export function mergeSettingValues(existingValue: unknown, newValue: unknown): unknown {
  return {
    ...existingValue as any,
    ...newValue as any,
  }
}
