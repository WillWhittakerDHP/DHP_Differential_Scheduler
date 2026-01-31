/**
 * Event Constants
 * 
 * LEARNING: Event keys for configuration data (event shapes and instances)
 * WHY: Type-safe event key references, following ENTITY_KEYS pattern
 * PATTERN: Const array with event keys, matching ENTITY_KEYS structure
 * NOTE: Events are configuration data (like annotation shapes/instances), not core entities
 */
export const EVENT_KEY_EVENT_SHAPE = "eventShape" as const
export const EVENT_KEY_EVENT_INSTANCE = "eventInstance" as const

export const EVENT_KEYS = [
  EVENT_KEY_EVENT_SHAPE,
  EVENT_KEY_EVENT_INSTANCE
] as const

export type GlobalEventKey = (typeof EVENT_KEYS)[number]
