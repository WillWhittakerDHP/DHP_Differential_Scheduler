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

function getStateControlBlockShapes(
  bookingData: BookingData
): BookingBlockShape[] {
  // WHY: Some transformers/tests intentionally pass "empty" booking data objects.
  const blockShapes = bookingData.blockShapes ?? []
  
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
  const allBlockInstances = getEntitiesByKey('blockInstance')
  const instancesWithSameShape = allBlockInstances.filter(
    (instance) => instance.blockShapeRef === blockShapeRef
  )

  const numberPattern = /\s+(\d+)$/
  const match = currentName.match(numberPattern)
  
  let baseName: string
  let startNumber: number
  
  if (match) {
    baseName = currentName.substring(0, match.index).trim()
    startNumber = parseInt(match[1], 10) + 1
  } else {
    baseName = currentName
    startNumber = 1
  }

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