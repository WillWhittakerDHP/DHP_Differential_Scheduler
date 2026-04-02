
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { BookingBlockInstance, BookingData, BookingBlockShape } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('blockInstanceUtils')

function getBlockShapes(bookingData: BookingData, context: string): BookingBlockShape[] {
  const raw = bookingData.blockShapes
  if (raw === undefined || raw === null) {
    logger.debug(`${context}: blockShapes missing, using []`)
    return []
  }
  return raw
}

function getBlockInstances(bookingData: BookingData, context: string): BookingBlockInstance[] {
  const raw = bookingData.blockInstances
  if (raw === undefined || raw === null) {
    logger.debug(`${context}: blockInstances missing, using []`)
    return []
  }
  return raw
}

/**
 * Canonical BlockShapeType first, then legacy DB/API enum values from before domain alignment.
 */
function blockShapeTypeLookupCandidates(type: BlockShapeType): readonly string[] {
  switch (type) {
    case BLOCK_SHAPE_TYPES.EVENT:
      return [BLOCK_SHAPE_TYPES.EVENT, 'option']
    case BLOCK_SHAPE_TYPES.TIME:
      return [BLOCK_SHAPE_TYPES.TIME, 'property']
    case BLOCK_SHAPE_TYPES.PRICE:
      return [BLOCK_SHAPE_TYPES.PRICE, 'coupon']
    default:
      return [type]
  }
}

function getUserTypeBlockShapes(bookingData: BookingData): BookingBlockShape[] {
  const blockShapes = getBlockShapes(bookingData, 'getUserTypeBlockShapes')
  return blockShapes.filter((blockShape) => blockShape.type === BLOCK_SHAPE_TYPES.USER)
}

export function getStateControlBlockInstances(bookingData: BookingData): BookingBlockInstance[] {
  const userBlockShapes = getUserTypeBlockShapes(bookingData)
  const userBlockShapeIds = new Set(userBlockShapes.map((bs) => bs.id))

  const blockInstances = getBlockInstances(bookingData, 'getStateControlBlockInstances')

  return blockInstances.filter(
    (instance) => userBlockShapeIds.has(toGlobalEntityId(instance.blockShapeRef)) && instance.active
  )
}

export function getBlockShapeIdByType(
  bookingData: BookingData,
  type: BlockShapeType
): string | null {
  const blockShapes = getBlockShapes(bookingData, 'getBlockShapeIdByType')
  for (const candidate of blockShapeTypeLookupCandidates(type)) {
    const blockShape = blockShapes.find((bs) => bs.type === candidate)
    if (blockShape !== undefined) {
      return blockShape.id !== undefined && blockShape.id !== null ? blockShape.id : null
    }
  }
  return null
}

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