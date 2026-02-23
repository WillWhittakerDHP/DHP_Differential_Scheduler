/**
 * WHY: Entity Router Data Sanitization Utilities

WHY: Improves code reusabilit...
 */
import { DEFAULT_VALUES, FIELD_NAMES } from './entityConstants.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'

/**
 * WHY: Sanitize booking mode fields (both camelCase and snake_case)
WHY: Preven...
 */
export function sanitizeBookingModeFields(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  
  if (sanitized[FIELD_NAMES.BOOKING_MODE] === '') {
    sanitized[FIELD_NAMES.BOOKING_MODE] = DEFAULT_VALUES.BOOKING_MODE
  }
  
  if (sanitized[FIELD_NAMES.BOOKING_MODE_SNAKE] === '') {
    sanitized[FIELD_NAMES.BOOKING_MODE_SNAKE] = DEFAULT_VALUES.BOOKING_MODE
  }
  
  return sanitized
}

/**
 * WHY: Sanitize entity data for create operations
WHY: Prevents database errors...
 */
export function sanitizeEntityDataForCreate(
  data: Record<string, unknown>,
  entityType: string
): Record<string, unknown> {
  const sanitized = { ...data }
  
  // Sanitize booking mode for block instances
  if (entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance') {
    return sanitizeBookingModeFields(sanitized)
  }
  
  return sanitized
}

/**
 * WHY: Sanitize entity data for update operations
WHY: Prevents database errors...
 */
export function sanitizeEntityDataForUpdate(
  data: Record<string, unknown>,
  entityType: string
): Record<string, unknown> {
  const sanitized = { ...data }
  
  // Sanitize booking mode for block instances
  if (entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance') {
    return sanitizeBookingModeFields(sanitized)
  }
  
  return sanitized
}
