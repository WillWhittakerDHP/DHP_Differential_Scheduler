// Entity constants - separate file to avoid circular dependencies

// Static entity keys (no longer dynamic since property management system was removed)
export const ENTITY_KEYS = [
  "blockInstance", 
  "blockShape", 
  "partInstance", 
  "partShape"
  // Note: "description" is intentionally NOT included as a core entity
  // Descriptions are part of the annotation system (see constants/annotations.ts)
  // and are handled separately from entities to maintain type safety
] as const;

export type GlobalEntityKey = (typeof ENTITY_KEYS)[number];

