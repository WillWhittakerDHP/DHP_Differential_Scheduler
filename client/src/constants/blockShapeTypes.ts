/**
 * Block Shape Type Constants
 * 
 * LEARNING: Immutable semantic identifiers for block shape types
 * WHY: Provides stable type-based filtering independent of display names
 * PATTERN: Enum-like constants with TypeScript type union
 */

export const BLOCK_SHAPE_TYPES = {
  USER: 'user',
  SERVICE: 'service',
  PROPERTY: 'property',
  OPTION: 'option'
} as const

export type BlockShapeType = typeof BLOCK_SHAPE_TYPES[keyof typeof BLOCK_SHAPE_TYPES]
