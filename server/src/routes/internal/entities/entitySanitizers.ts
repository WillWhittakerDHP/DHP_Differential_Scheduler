import {
  sanitizeEventAnchorEdgeInput,
  sanitizeEventPlacementKindInput,
} from '../../../../../shared/utils/eventPlacementUtils.js'
import { DEFAULT_VALUES, FIELD_NAMES } from './entityConstants.js'
import {
  EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_CAMEL,
  EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_SNAKE,
} from './eventShapePayloadGuards.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'

/** WHY: block_shapes table: name, semantic_type, order_index, timestamps; client sends entityKey, active, relationships. */
const BLOCK_SHAPE_DB_KEYS = new Set([
  'name',
  'semanticType',
  'semantic_type',
  'orderIndex',
  'order_index',
  'createdAt',
  'updatedAt',
  'created_at',
  'updated_at',
])

const BLOCK_SHAPE_CREATE_KEYS = new Set([...BLOCK_SHAPE_DB_KEYS, 'id'])

function pickBlockShapeFields(
  data: Record<string, unknown>,
  allowed: Set<string>
): Record<string, unknown> {
  const normalized = { ...data }
  if (
    normalized.semanticType === undefined &&
    normalized.semantic_type === undefined &&
    Object.prototype.hasOwnProperty.call(normalized, 'type') &&
    normalized.type !== undefined
  ) {
    normalized.semanticType = normalized.type
    delete normalized.type
  }
  const out: Record<string, unknown> = {}
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(normalized, key) && normalized[key] !== undefined) {
      out[key] = normalized[key]
    }
  }
  return out
}

function sanitizeBlockShapeFields(data: Record<string, unknown>): Record<string, unknown> {
  return pickBlockShapeFields(data, BLOCK_SHAPE_DB_KEYS)
}

function sanitizeBlockShapeCreate(data: Record<string, unknown>): Record<string, unknown> {
  return pickBlockShapeFields(data, BLOCK_SHAPE_CREATE_KEYS)
}

function sanitizeBlockInstancePrimitiveFields(data: Record<string, unknown>): Record<string, unknown> {
  return { ...data }
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
  delete sanitized[EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_CAMEL]
  delete sanitized[EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_SNAKE]
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

  if (entityType === ENTITY_KEYS.BLOCK_SHAPE || entityType === 'blockShape') {
    return sanitizeBlockShapeCreate(sanitized)
  }
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

  if (entityType === ENTITY_KEYS.BLOCK_SHAPE || entityType === 'blockShape') {
    return sanitizeBlockShapeFields(sanitized)
  }
  if (entityType === ENTITY_KEYS.BLOCK_INSTANCE || entityType === 'blockInstance') {
    return sanitizeBlockInstancePrimitiveFields(sanitized)
  }
  if (entityType === ENTITY_KEYS.EVENT_SHAPE || entityType === 'eventShape') {
    return sanitizeEventShapeFields(sanitized)
  }
  
  return sanitized
}
