/**
 * Appointment Router Constants
 * 
 * LEARNING: Centralized constants for appointment router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

import { AVAILABILITY_SETTINGS_KEY } from '../../../constants/appConstants.js'
import {
  APPOINTMENT_NOT_FOUND,
  ERROR_CREATE_APPOINTMENT,
  ERROR_UPDATE_APPOINTMENT,
} from '../../../../../shared/constants/errorMessages.js'

export { AVAILABILITY_SETTINGS_KEY }

/**
 * Error messages for appointment operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Appointment CRUD operations
  FETCH_APPOINTMENTS: 'Failed to fetch appointments',
  FETCH_APPOINTMENT: 'Error fetching appointment',
  APPOINTMENT_NOT_FOUND,
  CREATE_APPOINTMENT: ERROR_CREATE_APPOINTMENT,
  UPDATE_APPOINTMENT: ERROR_UPDATE_APPOINTMENT,
  PATCH_APPOINTMENT: 'Failed to patch appointment',
  DELETE_APPOINTMENT: 'Failed to delete appointment',
  FETCH_APPOINTMENT_VERSIONS: 'Error fetching appointment versions',
  
  // Validation errors
  INVALID_SNAPSHOT_IDS: 'One or more snapshot IDs are invalid',
} as const

/**
 * Default calendar email
 * LEARNING: Fallback calendar email when writeTo calendar is not configured
 * WHY: Provides default calendar for appointment creation
 * PATTERN: Const string for default value
 */
export const DEFAULT_CALENDAR_EMAIL = 'scheduling@districthomepro.com'

/**
 * Appointment statuses that trigger calendar event creation
 * LEARNING: Statuses that require calendar event creation
 * WHY: Only create calendar events for submitted/confirmed appointments
 * PATTERN: Const array with status values
 */
export const STATUSES_REQUIRING_CALENDAR_EVENT = ['submitted', 'confirmed'] as const
export type AppointmentStatusRequiringCalendarEvent = (typeof STATUSES_REQUIRING_CALENDAR_EVENT)[number]
