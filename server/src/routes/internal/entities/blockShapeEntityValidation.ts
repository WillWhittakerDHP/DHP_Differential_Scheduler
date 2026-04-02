import { ENTITY_KEYS } from '../../../constants/entities.js'

/** Matches Sequelize `block_shapes.type` ENUM and client `BLOCK_SHAPE_TYPES`. */
const CANONICAL_BLOCK_SHAPE_TYPES = ['user', 'service', 'time', 'event', 'price'] as const
type CanonicalBlockShapeType = (typeof CANONICAL_BLOCK_SHAPE_TYPES)[number]

function isCanonicalBlockShapeType(value: string): value is CanonicalBlockShapeType {
  return (CANONICAL_BLOCK_SHAPE_TYPES as readonly string[]).includes(value)
}

const LEGACY_BLOCK_SHAPE_TYPE_HINTS: Record<string, string> = {
  property:
    'Legacy value "property" is not allowed; use "time" for duration and property-linked scheduling.',
  option: 'Legacy value "option" is not allowed; use "event" for segment and option scheduling.',
  coupon: 'Legacy value "coupon" is not allowed; use "price" for fee and coupon scheduling.',
}

export function isBlockShapeEntityType(entityType: string): boolean {
  return entityType === ENTITY_KEYS.BLOCK_SHAPE || entityType === 'blockShape'
}

/**
 * @returns `null` when `raw` is a valid canonical block shape type; otherwise a single-line client message.
 */
export function validateBlockShapeTypeValue(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return 'Block shape type must be a non-empty string (user, service, time, event, or price).'
  }
  const trimmed = raw.trim()
  if (trimmed === '') {
    return 'Block shape type must be a non-empty string (user, service, time, event, or price).'
  }
  if (isCanonicalBlockShapeType(trimmed)) {
    return null
  }
  const allowed = CANONICAL_BLOCK_SHAPE_TYPES.join(', ')
  const legacyHint = LEGACY_BLOCK_SHAPE_TYPE_HINTS[trimmed]
  if (legacyHint !== undefined) {
    return `Invalid block shape type "${trimmed}". ${legacyHint} Allowed values: ${allowed}.`
  }
  return `Invalid block shape type "${trimmed}". Allowed values: ${allowed}.`
}

export function validateBlockShapeCreateBody(body: Record<string, unknown>): string | null {
  if (!('type' in body)) {
    return 'Block shape create requires type (user, service, time, event, or price).'
  }
  return validateBlockShapeTypeValue(body.type)
}

/** Validates `type` when present (PUT full body or PATCH partial / { key, value }). */
export function validateBlockShapeUpdateBody(body: Record<string, unknown>): string | null {
  if (!('type' in body)) {
    return null
  }
  return validateBlockShapeTypeValue(body.type)
}
