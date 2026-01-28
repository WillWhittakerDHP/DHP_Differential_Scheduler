// Entity constants - separate file to avoid circular dependencies

// Individual entity key constants (for runtime use, avoiding hardcoded strings)
export const ENTITY_KEY_BLOCK_INSTANCE = "blockInstance" as const
export const ENTITY_KEY_BLOCK_SHAPE = "blockShape" as const
export const ENTITY_KEY_PART_INSTANCE = "partInstance" as const
export const ENTITY_KEY_PART_SHAPE = "partShape" as const

// Static entity keys (no longer dynamic since property management system was removed)
export const ENTITY_KEYS = [
  ENTITY_KEY_BLOCK_INSTANCE, 
  ENTITY_KEY_BLOCK_SHAPE, 
  ENTITY_KEY_PART_INSTANCE, 
  ENTITY_KEY_PART_SHAPE
  // Note: "description" is intentionally NOT included as a core entity
  // Descriptions are part of the annotation system (see constants/annotations.ts)
  // and are handled separately from entities to maintain type safety
] as const;

export type GlobalEntityKey = (typeof ENTITY_KEYS)[number];

// Booking mode enum for block instances
export const BOOKING_MODES = ['standalone', 'addOn', 'both'] as const;
export type BookingMode = typeof BOOKING_MODES[number];
