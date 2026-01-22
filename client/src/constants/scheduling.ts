/**
 * Scheduling Constants
 * 
 * LEARNING: Centralized constants for scheduling-related magic numbers
 * WHY: Eliminates magic numbers throughout codebase, improves maintainability
 * PATTERN: Exported constants with descriptive names
 * 
 * P3-1: Created to replace magic number defaults
 */

/**
 * Default appointment duration in minutes
 * LEARNING: Fallback duration when no block instances are selected
 * WHY: Provides sensible default for appointment scheduling
 * PATTERN: Constant for default duration (90 minutes = 1.5 hours)
 */
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 90

/**
 * Default minute increment for time slots
 * LEARNING: Standard interval between available time slots
 * WHY: Controls granularity of appointment times
 * PATTERN: Constant for default increment (15 minutes)
 */
export const DEFAULT_MINUTE_INCREMENT = 15

/**
 * Default lead time in minutes
 * LEARNING: Minimum advance notice required for appointments
 * WHY: Prevents booking appointments too close to current time
 * PATTERN: Constant for default lead time (60 minutes = 1 hour)
 */
export const DEFAULT_LEAD_TIME_MINUTES = 60
