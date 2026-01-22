/**
 * Constants for availability settings UI
 * WHY: Centralizes UI constants used in BusinessControlsTab
 * PATTERN: Export constants that are used across components
 */

/**
 * Day names for display
 * LEARNING: Array mapping day numbers (0-6) to day names
 * WHY: Provides user-friendly labels for business hours inputs
 */
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/**
 * Time increment options
 * LEARNING: Predefined options for time slot increments
 * WHY: Provides common increment values (15, 30, 60 minutes)
 */
export const TIME_INCREMENT_OPTIONS = [
  { title: '15 minutes', value: 15 },
  { title: '30 minutes', value: 30 },
  { title: '60 minutes (1 hour)', value: 60 },
] as const

/**
 * Timezone options for availability calculations
 * LEARNING: Common IANA timezone strings for US timezones
 * WHY: Provides admin with timezone selector dropdown
 * PATTERN: Array of objects with value and title for VSelect
 */
export const TIMEZONE_OPTIONS = [
  { title: 'Eastern Time (America/New_York)', value: 'America/New_York' },
  { title: 'Central Time (America/Chicago)', value: 'America/Chicago' },
  { title: 'Mountain Time (America/Denver)', value: 'America/Denver' },
  { title: 'Pacific Time (America/Los_Angeles)', value: 'America/Los_Angeles' },
  { title: 'Arizona Time (America/Phoenix)', value: 'America/Phoenix' },
  { title: 'Alaska Time (America/Anchorage)', value: 'America/Anchorage' },
  { title: 'Hawaii Time (Pacific/Honolulu)', value: 'Pacific/Honolulu' },
  { title: 'UTC', value: 'UTC' }
] as const

export type TimezoneOption = typeof TIMEZONE_OPTIONS[number]['value']
