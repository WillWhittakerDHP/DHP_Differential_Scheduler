/**
 * Order Index Utilities
 * 
 * LEARNING: Utility functions for managing orderIndex values during drag-and-drop
 * WHY: Encapsulates reordering logic and normalization for consistent behavior
 * PATTERN: Pure functions that don't mutate input arrays
 * COMPARISON: Similar to React version but adapted for Vue/TypeScript
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

/**
 * Normalize orderIndex values to be sequential (0, 1, 2, 3...)
 * Use this ONLY after user-initiated reordering operations
 * LEARNING: Ensures orderIndex values are always sequential after drag-and-drop
 * WHY: Prevents gaps in orderIndex values that could cause display issues
 * PATTERN: Map over entities and assign sequential indices
 */
export const normalizeOrderIndices = <GE extends GlobalEntityKey>(
  entities: GlobalEntity<GE>[]
): GlobalEntity<GE>[] => {
  return entities.map((entity, index) => ({
    ...entity,
    orderIndex: index
  }))
}

/**
 * Sort entities by their orderIndex for display purposes
 * Does not modify the orderIndex values
 * LEARNING: Pure function that returns sorted copy
 * WHY: Display order should match orderIndex, but we don't want to mutate original array
 * PATTERN: Spread array and sort, return new array
 */
export const sortByOrderIndex = <GE extends GlobalEntityKey>(
  entities: GlobalEntity<GE>[]
): GlobalEntity<GE>[] => {
  return [...entities].sort((a, b) => {
    const aOrder = a.orderIndex ?? 0
    const bOrder = b.orderIndex ?? 0
    return aOrder - bOrder
  })
}

/**
 * Update orderIndex values after drag/drop reordering
 * Call this when user completes a drag/drop operation
 * LEARNING: Reorders array and normalizes indices
 * WHY: After drag, we need to update the array order and ensure sequential indices
 * PATTERN: Splice to move item, then normalize all indices
 */
export const updateOrderAfterDragDrop = <GE extends GlobalEntityKey>(
  entities: GlobalEntity<GE>[],
  fromIndex: number,
  toIndex: number
): GlobalEntity<GE>[] => {
  const reordered = [...entities]
  const [movedItem] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, movedItem)
  
  // Normalize to sequential indices after reordering
  return normalizeOrderIndices(reordered)
}

