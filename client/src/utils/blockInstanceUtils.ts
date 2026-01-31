/**
 * Block Instance Utilities
 * 
 * LEARNING: Generic utilities for working with block instances
 * WHY: Replaces hardcoded block shape name references with dynamic filtering
 * PATTERN: Generic functions that accept block shape IDs or filter by properties
 */

import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalEntity } from '@/types/entities'
import type { BookingBlockInstance, BookingData, BookingBlockShape } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import { findById } from '@/utils/collections/findById'

// Removed unused function: getBlockInstancesByShapeId
// LEARNING: Function was declared but never used
// WHY: Removes dead code to improve maintainability

// Removed unused function: getBlockInstancesByShapeIdFromBooking
// LEARNING: Function was declared but only used by other unused functions
// WHY: Removes dead code to improve maintainability

/**
 * Find block instance by ID and block shape ID
 * LEARNING: Validates block instance matches expected block shape
 * WHY: Prevents matching wrong block types (e.g., baseService ID in userTypeBlockId field)
 * 
 * @param bookingData - BookingData containing block instances
 * @param id - Block instance ID to find
 * @param blockShapeId - Expected block shape ID
 * @returns BookingBlockInstance if found and matches block shape, null otherwise
 */
export function findBlockInstanceByIdAndShapeId(
  bookingData: BookingData,
  id: string | null | undefined,
  blockShapeId: string | null | undefined
): BookingBlockInstance | null {
  if (!id || !bookingData || !blockShapeId) return null
  
  const blockInstance = findById(bookingData.blockInstances, id)
  if (!blockInstance) {
    return null
  }
  
  if (blockInstance.blockShapeRef !== blockShapeId) {
    return null
  }
  
  return blockInstance
}

/**
 * Get state control block shapes from BookingData
 * LEARNING: Filters block shapes by type === 'user' for explicit semantic typing
 * WHY: Type provides stable semantic identification independent of properties
 * PATTERN: Use type-based filtering for state control blocks (user type)
 * NOTE: Uses type-based filtering (type === 'user') for state control blocks
 * 
 * @param bookingData - BookingData containing block shapes
 * @returns Array of BookingBlockShape entities where type === 'user'
 */
function getStateControlBlockShapes(
  bookingData: BookingData
): BookingBlockShape[] {
  // LEARNING: Defensive read for tests/edge-cases where bookingData may be partially constructed.
  // WHY: Some transformers/tests intentionally pass "empty" booking data objects.
  const blockShapes = bookingData.blockShapes ?? []
  
  // LEARNING: Strict type-based filtering - no fallbacks
  // WHY: Fallbacks hide data configuration errors, making bugs hard to diagnose
  const filtered = blockShapes.filter(
    blockShape => {
      if (!blockShape.type) {
        console.error(
          `[getStateControlBlockShapes] Block shape "${blockShape.name}" (id: ${blockShape.id}) has no type defined. ` +
          `All block shapes must have a type ('user', 'service', 'property', 'option'). ` +
          `This block shape will be excluded from filtering.`
        )
        return false
      }
      return blockShape.type === 'user'
    }
  )
  
  return filtered
}

/**
 * Get state control block instances from BookingData
 * LEARNING: Gets all block instances that belong to state control block shapes
 * WHY: State control blocks are identified by property (isStateControl: true)
 * 
 * @param bookingData - BookingData containing block instances and block shapes
 * @returns Array of BookingBlockInstance entities that belong to state control block shapes
 */
export function getStateControlBlockInstances(
  bookingData: BookingData
): BookingBlockInstance[] {
  const stateControlBlockShapes = getStateControlBlockShapes(bookingData)
  const stateControlBlockShapeIds = new Set(stateControlBlockShapes.map(bs => bs.id))

  const blockInstances = bookingData.blockInstances ?? []
  
  const filtered = blockInstances.filter(
    instance => stateControlBlockShapeIds.has(instance.blockShapeRef) && instance.active
  )
  
  return filtered
}

/**
 * Get block shape ID by name from BookingData
 * LEARNING: Helper to find block shape ID by name (for migration/fallback)
 * WHY: Temporary bridge function until all code uses ID-based filtering
 * NOTE: Prefer using block shape IDs directly instead of name lookups
 * 
 * @param bookingData - BookingData containing block shapes
 * @param name - Block shape name to find
 * @returns Block shape ID if found, null otherwise
 */
export function getBlockShapeIdByName(
  bookingData: BookingData,
  name: string
): string | null {
  const blockShapes = bookingData.blockShapes ?? []
  const blockShape = blockShapes.find(
    bs => bs.name === name
  )
  return blockShape?.id ?? null
}

// Removed unused function: getBlockInstancesByShapeName
// LEARNING: Function was declared but never used
// WHY: Removes dead code to improve maintainability

/**
 * Get block shape ID by type from BookingData
 * LEARNING: Stable type-based lookup for block shape ID
 * WHY: Type is immutable semantic identifier, independent of display name
 * PATTERN: Use type instead of name for reliable filtering
 * 
 * @param bookingData - BookingData containing block shapes
 * @param type - Block shape type to find ('user', 'service', 'property', 'option')
 * @returns Block shape ID if found, null otherwise
 */
export function getBlockShapeIdByType(
  bookingData: BookingData,
  type: BlockShapeType
): string | null {
  const blockShapes = bookingData.blockShapes ?? []
  const blockShape = blockShapes.find(
    bs => bs.type === type
  )
  return blockShape?.id ?? null
}

// Removed unused function: getBlockInstancesByType
// LEARNING: Function was declared but never used
// WHY: Removes dead code to improve maintainability

/**
 * Get state control block instance options for select components
 * LEARNING: Generates options array from state control block instances
 * WHY: Provides formatted options for UI components (selects, dropdowns)
 * PATTERN: Map entities to option format with title and value
 * 
 * @param globalData - GlobalData containing all entities
 * @returns Array of state control block instance options with title and value
 */
export function getStateControlBlockInstanceOptions(
  globalData: GlobalData
): Array<{ title: string; value: string | null }> {
  const blockShapes = (globalData.entities.blockShape || []) as GlobalEntity<'blockShape'>[]
  const stateControlBlockShapes = blockShapes.filter(bs => bs.isStateControl === true)
  const stateControlBlockShapeIds = new Set(stateControlBlockShapes.map(bs => bs.id))
  
  const blockInstances = (globalData.entities.blockInstance || []) as GlobalEntity<'blockInstance'>[]
  const stateControlBlockInstances = blockInstances.filter(
    instance => stateControlBlockShapeIds.has(instance.blockShapeRef) && instance.active
  )
  
  return [
    { title: 'Generic', value: null },
    ...stateControlBlockInstances.map(blockInstance => ({
      title: blockInstance.name.charAt(0).toUpperCase() + blockInstance.name.slice(1), // Capitalize first letter
      value: blockInstance.id
    }))
  ]
}

/**
 * LEARNING: Generate incremented name for duplicated block instance
 * WHY: Ensures unique names when duplicating instances
 * PATTERN: Extract base name, check for number suffix, find next available number
 * 
 * @param currentName - Current name of the source entity
 * @param blockShapeRef - BlockShape ID to filter instances
 * @param getEntitiesByKey - Function to get all block instances
 * @returns Incremented name like "Name 1", "Name 2", etc.
 */
export function generateIncrementedName(
  currentName: string,
  blockShapeRef: string,
  getEntitiesByKey: (entityKey: 'blockInstance') => GlobalEntity<'blockInstance'>[]
): string {
  // Get all instances with same blockShapeRef
  const allBlockInstances = getEntitiesByKey('blockInstance')
  const instancesWithSameShape = allBlockInstances.filter(
    (instance) => instance.blockShapeRef === blockShapeRef
  )

  // Check if name ends with a number pattern (e.g., "Name 1", "Name 2")
  const numberPattern = /\s+(\d+)$/
  const match = currentName.match(numberPattern)
  
  let baseName: string
  let startNumber: number
  
  if (match) {
    // Name ends with a number - extract base name and increment
    baseName = currentName.substring(0, match.index).trim()
    startNumber = parseInt(match[1], 10) + 1
  } else {
    // Name doesn't end with a number - use full name as base and start from 1
    baseName = currentName
    startNumber = 1
  }

  // Find the next available number
  let newNumber = startNumber
  while (
    instancesWithSameShape.some(
      (instance) => instance.name === `${baseName} ${newNumber}`
    )
  ) {
    newNumber++
  }

  return `${baseName} ${newNumber}`
}