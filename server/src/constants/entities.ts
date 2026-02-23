
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
PATTERN: typeof pattern for type extraction
 */
export type EntityKey = typeof ENTITY_KEYS[keyof typeof ENTITY_KEYS]

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
