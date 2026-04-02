import {
  sanitizeEventAnchorEdgeInput,
  sanitizeEventPlacementKindInput,
} from '../../../../../shared/utils/eventPlacementUtils.js'
import { DEFAULT_VALUES, FIELD_NAMES } from './entityConstants.js'
import {
  EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_CAMEL,
  EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_SNAKE,
} from './eventShapeLegacyDifferentialRoleKeys.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'

function sanitizeBlockInstancePrimitiveFields(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }

  if (sanitized[FIELD_NAMES.AGENT_PERMISSIONS] === '') {
    sanitized[FIELD_NAMES.AGENT_PERMISSIONS] = DEFAULT_VALUES.BOOKING_MODE_STORAGE
  }

  if (sanitized[FIELD_NAMES.AGENT_PERMISSIONS_SNAKE] === '') {
    sanitized[FIELD_NAMES.AGENT_PERMISSIONS_SNAKE] = DEFAULT_VALUES.BOOKING_MODE_STORAGE
  }

  return sanitized
}

function sanitizeEventShapeFields(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  if (FIELD_NAMES.PLACEMENT_KIND in sanitized) {
    sanitized[FIELD_NAMES.PLACEMENT_KIND] = sanitizeEventPlacementKindInput(
      sanitized[FIELD_NAMES.PLACEMENT_KIND]
    )
  }
  if (FIELD_NAMES.PLACEMENT_KIND_SNAKE in sanitized) {
    sanitized[FIELD_NAMES.PLACEMENT_KIND_SNAKE] = sanitizeEventPlacementKindInput(
      sanitized[FIELD_NAMES.PLACEMENT_KIND_SNAKE]
    )
  }
  if (FIELD_NAMES.ANCHOR_EDGE in sanitized) {
    sanitized[FIELD_NAMES.ANCHOR_EDGE] = sanitizeEventAnchorEdgeInput(sanitized[FIELD_NAMES.ANCHOR_EDGE])
  }
  if (FIELD_NAMES.ANCHOR_EDGE_SNAKE in sanitized) {
    sanitized[FIELD_NAMES.ANCHOR_EDGE_SNAKE] = sanitizeEventAnchorEdgeInput(
      sanitized[FIELD_NAMES.ANCHOR_EDGE_SNAKE]
    )
  }
  delete sanitized[EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_CAMEL]
  delete sanitized[EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_SNAKE]
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
  
  if (entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance') {
    return sanitizeBlockInstancePrimitiveFields(sanitized)
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
  
  if (entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance') {
    return sanitizeBlockInstancePrimitiveFields(sanitized)
  }
  if (entityType === ENTITY_KEYS.EVENT_SHAPE || entityType === 'eventShape') {
    return sanitizeEventShapeFields(sanitized)
  }
  
  return sanitized
}
