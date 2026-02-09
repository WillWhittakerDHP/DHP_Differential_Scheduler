/**
 * Business Settings Router Constants
 * 
 * LEARNING: Centralized constants for business settings router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js'

/**
 * Availability settings key
 * LEARNING: Key for availability settings in BusinessSettings
 * WHY: Single source of truth for settings key
 * PATTERN: Const string for settings key
 */
export const AVAILABILITY_SETTINGS_KEY = 'availability_settings'

/**
 * Default availability settings
 * LEARNING: Default availability settings structure
 * WHY: Provides default values when availability settings don't exist
 * PATTERN: Const object with default settings
 */
export const defaultAvailabilitySettings: AvailabilitySettingsData = {
  businessHours: {
    0: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Sunday
    1: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Monday
    2: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Tuesday
    3: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Wednesday
    4: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Thursday
    5: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Friday
    6: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Saturday
  },
  minuteIncrement: 15, // 15-minute intervals
  rangeConstraints: {
    businessHours: {
      type: 'businessHours',
      enforcement: 'hard',
      config: {
        hours: {
          0: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Sunday
          1: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Monday
          2: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Tuesday
          3: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Wednesday
          4: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Thursday
          5: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Friday
          6: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T19:00:00Z" }, // Saturday
        }
      }
    },
    leadTime: {
      type: 'leadTime',
      enforcement: 'hard',
      config: {
        minutes: 60 // 1 hour lead time
      }
    }
  },
  durationRounding: {
    enabled: false, // Default disabled for testing
    increment: 15,
    method: 'roundUp'
  }
}

/**
 * Error messages for business settings operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Business settings CRUD operations
  FETCH_SETTINGS: 'Failed to fetch business settings',
  FETCH_SETTING: 'Failed to fetch business setting',
  SETTING_NOT_FOUND: 'Setting with key "{key}" not found',
  CREATE_SETTING: 'Failed to create business setting',
  UPDATE_SETTING: 'Failed to update business setting',
  PATCH_SETTING: 'Failed to patch business setting',
  DELETE_SETTING: 'Failed to delete business setting',
  
  // Validation errors
  SETTING_KEY_REQUIRED: 'setting_key is required and must be a string',
  SETTING_VALUE_REQUIRED: 'setting_value is required',
  INVALID_AVAILABILITY_SETTINGS: 'Invalid availability_settings structure',
  SETTING_ALREADY_EXISTS: 'Setting with key "{key}" already exists. Use PUT or PATCH to update.',
  SETTING_NOT_FOUND_FOR_PATCH: 'Setting with key "{key}" not found. Use POST to create.',
} as const
