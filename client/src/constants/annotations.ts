/**
 * Annotation Constants
 * 
 * LEARNING: Annotation keys for configuration data (annotation shapes and instances)
 * WHY: Type-safe annotation key references, following ENTITY_KEYS pattern
 * PATTERN: Const array with annotation keys, matching ENTITY_KEYS structure
 * NOTE: Annotations are configuration data (like event shapes/instances), not core entities
 */
export const ANNOTATION_SHAPE_KEY = "annotationShape" as const
export const ANNOTATION_INSTANCE_KEY = "annotationInstance" as const

export const ANNOTATION_KEYS = [
  ANNOTATION_SHAPE_KEY,
  ANNOTATION_INSTANCE_KEY
] as const

export type GlobalAnnotationKey = (typeof ANNOTATION_KEYS)[number]


