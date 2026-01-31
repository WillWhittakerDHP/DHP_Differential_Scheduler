/**
 * Entity Constants (Server-side)
 * 
 * LEARNING: Entity keys used in entity router and validation
 * WHY: Eliminates hardcoded entity key strings, enables type-safe entity key checks
 * PATTERN: Const object with entity key values
 */

/**
 * Entity key constants
 * LEARNING: Use these constants instead of hardcoded strings
 * WHY: Type-safe, maintainable, single source of truth
 * PATTERN: Const object with entity key values
 */
export const ENTITY_KEYS = {
  BLOCK_INSTANCE: 'blockInstance',
  BLOCK_SHAPE: 'blockShape',
  PART_INSTANCE: 'partInstance',
  PART_SHAPE: 'partShape',
  EVENT_SHAPE: 'eventShape',
  EVENT_INSTANCE: 'eventInstance',
  ANNOTATION_SHAPE: 'annotationShape',
  ANNOTATION_INSTANCE: 'annotationInstance',
} as const

/**
 * Entity key type
 * LEARNING: Derived from ENTITY_KEYS values
 * WHY: Type-safe entity key references
 * PATTERN: typeof pattern for type extraction
 */
export type EntityKey = typeof ENTITY_KEYS[keyof typeof ENTITY_KEYS]

/**
 * Array of all entity keys
 * LEARNING: Used for validation and config endpoints
 * WHY: Single source of truth for entity key list
 * PATTERN: Array derived from ENTITY_KEYS object
 */
export const ENTITY_KEYS_ARRAY: EntityKey[] = [
  ENTITY_KEYS.BLOCK_INSTANCE,
  ENTITY_KEYS.BLOCK_SHAPE,
  ENTITY_KEYS.PART_INSTANCE,
  ENTITY_KEYS.PART_SHAPE,
  ENTITY_KEYS.EVENT_SHAPE,
  ENTITY_KEYS.EVENT_INSTANCE,
  ENTITY_KEYS.ANNOTATION_SHAPE,
  ENTITY_KEYS.ANNOTATION_INSTANCE,
]
