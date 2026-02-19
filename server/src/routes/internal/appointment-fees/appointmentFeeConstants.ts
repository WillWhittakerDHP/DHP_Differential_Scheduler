/**
 * Appointment Fee Summary Router Constants
 *
 * LEARNING: Error messages for read-only appointment fee summary routes
 * WHY: Follows CrudErrorMessages for createCrudRouter; mutations disabled but messages required by interface
 * PATTERN: Const object with FETCH_* / NOT_FOUND / CREATE / UPDATE / DELETE
 */

export const FEE_ERROR_MESSAGES = {
  FETCH_ALL: 'Failed to fetch appointment fee summaries',
  FETCH_ONE: 'Failed to fetch appointment fee summary',
  NOT_FOUND: 'Appointment fee summary not found',
  CREATE: 'Appointment fee summaries are created with appointments only',
  UPDATE: 'Appointment fee summaries are immutable',
  PATCH: 'Appointment fee summaries are immutable',
  DELETE: 'Appointment fee summaries are immutable',
} as const
