
import { AVAILABILITY_SETTINGS_KEY } from '../../../constants/appConstants.js'
import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js'
import { ERROR_FETCH_BUSINESS_SETTINGS } from '../../../../../shared/constants/errorMessages.js'
import type { RFC3339DateTime, DayHours } from '../../../../../shared/types/availabilityTypes.js'
import type { CalendarConfig } from '../../../../../shared/types/calendarTypes.js'

export { AVAILABILITY_SETTINGS_KEY }

const DEFAULT_DAY_START = "2000-01-01T09:00:00Z" as RFC3339DateTime
const DEFAULT_DAY_END = "2000-01-01T19:00:00Z" as RFC3339DateTime

export const defaultAvailabilitySettings: AvailabilitySettingsData = {
  businessHours: {
    0: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Sunday
    1: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Monday
    2: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Tuesday
    3: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Wednesday
    4: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Thursday
    5: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Friday
    6: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Saturday
  },
  minuteIncrement: 15, // 15-minute intervals
  rangeConstraints: {
    businessHours: {
      category: 'range',
      type: 'businessHours',
      enforcement: 'hard',
      config: {
        hours: {
          0: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Sunday
          1: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Monday
          2: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Tuesday
          3: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Wednesday
          4: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Thursday
          5: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Friday
          6: { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END } as DayHours, // Saturday
        }
      }
    },
    leadTime: {
      category: 'range',
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
  },
  calendarConfig: {
    enabled: false,
    provider: 'none',
    calendars: [],
    holdDurationMinutes: 15
  } as CalendarConfig
}

export const ERROR_MESSAGES = {
  FETCH_SETTINGS: ERROR_FETCH_BUSINESS_SETTINGS,
  FETCH_SETTING: 'Failed to fetch business setting',
  SETTING_NOT_FOUND: 'Setting with key "{key}" not found',
  CREATE_SETTING: 'Failed to create business setting',
  UPDATE_SETTING: 'Failed to update business setting',
  PATCH_SETTING: 'Failed to patch business setting',
  DELETE_SETTING: 'Failed to delete business setting',
  
  SETTING_KEY_REQUIRED: 'setting_key is required and must be a string',
  SETTING_VALUE_REQUIRED: 'setting_value is required',
  INVALID_AVAILABILITY_SETTINGS: 'Invalid availability_settings structure',
  SETTING_ALREADY_EXISTS: 'Setting with key "{key}" already exists. Use PUT or PATCH to update.',
  SETTING_NOT_FOUND_FOR_PATCH: 'Setting with key "{key}" not found. Use POST to create.',
} as const
