/**
 * Entity Router Data Sanitization Utilities
 * 
 * LEARNING: Extracted data sanitization logic for entity operations
 * WHY: Improves code reusability, prevents database errors from empty enum values
 * PATTERN: Pure sanitization functions that return sanitized data
 */

import { DEFAULT_VALUES, FIELD_NAMES } from './entityConstants.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'

/**
 * Sanitize booking mode fields (both camelCase and snake_case)
 * LEARNING: Extracted booking mode sanitization logic
 * WHY: Prevents database errors from empty string enum values
 * PATTERN: Check for empty strings, replace with default value
 * 
 * @param data - Data object to sanitize
 * @returns Sanitized data object
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
 * Sanitize entity data for create operations
 * LEARNING: Extracted data sanitization for POST requests
 * WHY: Prevents database errors from invalid enum values
 * PATTERN: Sanitize known enum fields based on entity type
 * 
 * @param data - Data object to sanitize
 * @param entityType - Entity type (e.g., 'blockInstance')
 * @returns Sanitized data object
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
 * Sanitize entity data for update operations
 * LEARNING: Extracted data sanitization for PUT/PATCH requests
 * WHY: Prevents database errors from invalid enum values
 * PATTERN: Sanitize known enum fields based on entity type
 * 
 * @param data - Data object to sanitize
 * @param entityType - Entity type (e.g., 'blockInstance')
 * @returns Sanitized data object
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
