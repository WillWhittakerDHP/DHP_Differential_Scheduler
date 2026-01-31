// Entity constants - separate file to avoid circular dependencies

// Individual entity key constants (for runtime use, avoiding hardcoded strings)
export const ENTITY_KEY_BLOCK_INSTANCE = "blockInstance" as const
export const ENTITY_KEY_BLOCK_SHAPE = "blockShape" as const
export const ENTITY_KEY_PART_INSTANCE = "partInstance" as const
export const ENTITY_KEY_PART_SHAPE = "partShape" as const

// Entity key constants for events and annotations
export const ENTITY_KEY_EVENT_SHAPE = "eventShape" as const
export const ENTITY_KEY_EVENT_INSTANCE = "eventInstance" as const
export const ENTITY_KEY_ANNOTATION_SHAPE = "annotationShape" as const
export const ENTITY_KEY_ANNOTATION_INSTANCE = "annotationInstance" as const

// Static entity keys (no longer dynamic since property management system was removed)
export const ENTITY_KEYS = [
  ENTITY_KEY_BLOCK_INSTANCE, 
  ENTITY_KEY_BLOCK_SHAPE, 
  ENTITY_KEY_PART_INSTANCE, 
  ENTITY_KEY_PART_SHAPE,
  ENTITY_KEY_EVENT_SHAPE,
  ENTITY_KEY_EVENT_INSTANCE,
  ENTITY_KEY_ANNOTATION_SHAPE,
  ENTITY_KEY_ANNOTATION_INSTANCE
] as const;

export type GlobalEntityKey = (typeof ENTITY_KEYS)[number];

// Booking mode enum for block instances
export const BOOKING_MODES = ['standalone', 'addOn', 'both'] as const;
export type BookingMode = typeof BOOKING_MODES[number];