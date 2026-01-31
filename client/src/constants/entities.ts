// Entity constants - separate file to avoid circular dependencies

// Individual entity key constants (for runtime use, avoiding hardcoded strings)
export const ENTITY_KEY_BLOCK_INSTANCE = "blockInstance" as const
export const ENTITY_KEY_BLOCK_SHAPE = "blockShape" as const
export const ENTITY_KEY_PART_INSTANCE = "partInstance" as const
export const ENTITY_KEY_PART_SHAPE = "partShape" as const

// Configuration data constants (NOT core entities - kept for string literal use)
// LEARNING: EventShapes and EventInstances are configuration data (like AnnotationTypes),
// not core entities with orderIndex/active properties
// WHY: They are stored separately in globalData.eventShapes and globalData.eventInstances
// NOTE: These constants remain defined for use as string literals in relationship configurations,
// but they are NOT included in ENTITY_KEYS because they are not core entities
export const ENTITY_KEY_EVENT_SHAPE = "eventShape" as const
export const ENTITY_KEY_EVENT_INSTANCE = "eventInstance" as const

// Static entity keys (no longer dynamic since property management system was removed)
export const ENTITY_KEYS = [
  ENTITY_KEY_BLOCK_INSTANCE, 
  ENTITY_KEY_BLOCK_SHAPE, 
  ENTITY_KEY_PART_INSTANCE, 
  ENTITY_KEY_PART_SHAPE
  // Note: "description" is intentionally NOT included as a core entity
  // Descriptions are part of the annotation system (see constants/annotations.ts)
  // and are handled separately from entities to maintain type safety
  // Note: "eventShape" and "eventInstance" are NOT included as core entities
  // EventShapes and EventInstances are configuration data (like AnnotationTypes),
  // not entities with orderIndex/active properties. They are stored separately
  // in globalData.eventShapes and globalData.eventInstances.
] as const;

export type GlobalEntityKey = (typeof ENTITY_KEYS)[number];

// Booking mode enum for block instances
export const BOOKING_MODES = ['standalone', 'addOn', 'both'] as const;
export type BookingMode = typeof BOOKING_MODES[number];