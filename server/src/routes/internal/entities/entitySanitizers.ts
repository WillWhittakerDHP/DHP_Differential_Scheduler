import {
  sanitizeDifferentialRoleInput,
  sanitizeDifferentialEventRoleOverridesInput,
} from '../../../../../shared/utils/differentialRoleUtils.js'
import { DEFAULT_VALUES, FIELD_NAMES } from './entityConstants.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'

export function sanitizeBookingModeFields(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  
  if (sanitized[FIELD_NAMES.BOOKING_MODE] === '') {
    sanitized[FIELD_NAMES.BOOKING_MODE] = DEFAULT_VALUES.BOOKING_MODE_STORAGE
  }

  if (sanitized[FIELD_NAMES.BOOKING_MODE_SNAKE] === '') {
    sanitized[FIELD_NAMES.BOOKING_MODE_SNAKE] = DEFAULT_VALUES.BOOKING_MODE_STORAGE
  }

  if (sanitized[FIELD_NAMES.AGENT_PERMISSIONS] === '') {
    sanitized[FIELD_NAMES.AGENT_PERMISSIONS] = DEFAULT_VALUES.BOOKING_MODE_STORAGE
  }

  if (sanitized[FIELD_NAMES.AGENT_PERMISSIONS_SNAKE] === '') {
    sanitized[FIELD_NAMES.AGENT_PERMISSIONS_SNAKE] = DEFAULT_VALUES.BOOKING_MODE_STORAGE
  }

  if (FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES in sanitized) {
    sanitized[FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES] = sanitizeDifferentialEventRoleOverridesInput(
      sanitized[FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES]
    )
  }
  if (FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES_SNAKE in sanitized) {
    sanitized[FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES_SNAKE] = sanitizeDifferentialEventRoleOverridesInput(
      sanitized[FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES_SNAKE]
    )
  }

  return sanitized
}

const TERNARY_DEFAULT_ALLOWED = new Set(['true', 'false', 'override'])

/**
 * DB check_ternary_default_valid: NULL or one of true/false/override — never ''.
 */
function sanitizeEventShapeTernaryDefault(raw: unknown): string | null {
  if (raw === undefined || raw === null) {
    return null
  }
  if (typeof raw !== 'string') {
    return null
  }
  const t = raw.trim()
  if (t === '' || t === 'null') {
    return null
  }
  if (TERNARY_DEFAULT_ALLOWED.has(t)) {
    return t
  }
  return null
}

export function sanitizeEventShapeFields(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  if ('ternaryDefault' in sanitized) {
    sanitized.ternaryDefault = sanitizeEventShapeTernaryDefault(sanitized.ternaryDefault)
  }
  if ('ternary_default' in sanitized) {
    sanitized.ternary_default = sanitizeEventShapeTernaryDefault(sanitized.ternary_default)
  }
  if (FIELD_NAMES.DIFFERENTIAL_ROLE in sanitized) {
    sanitized[FIELD_NAMES.DIFFERENTIAL_ROLE] = sanitizeDifferentialRoleInput(
      sanitized[FIELD_NAMES.DIFFERENTIAL_ROLE]
    )
  }
  if (FIELD_NAMES.DIFFERENTIAL_ROLE_SNAKE in sanitized) {
    sanitized[FIELD_NAMES.DIFFERENTIAL_ROLE_SNAKE] = sanitizeDifferentialRoleInput(
      sanitized[FIELD_NAMES.DIFFERENTIAL_ROLE_SNAKE]
    )
  }
  return sanitized
}

/**
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
  if (entityType === ENTITY_KEYS.EVENT_SHAPE || entityType === 'eventShape') {
    return sanitizeEventShapeFields(sanitized)
  }
  
  return sanitized
}

/**
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
  if (entityType === ENTITY_KEYS.EVENT_SHAPE || entityType === 'eventShape') {
    return sanitizeEventShapeFields(sanitized)
  }
  
  return sanitized
}
