
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import type { BookingBlockInstance, BookingData, BookingBlockShape } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
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

function getStateControlBlockShapes(
  bookingData: BookingData
): BookingBlockShape[] {
  const blockShapes = getBlockShapes(bookingData, 'getStateControlBlockShapes')

  const filtered = blockShapes.filter(
    blockShape => {
      if (!blockShape.type) {
        logger.error('Block shape has no type defined', {
          blockShapeName: blockShape.name,
          blockShapeId: blockShape.id
        })
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

  const blockInstances = getBlockInstances(bookingData, 'getStateControlBlockInstances')

  const filtered = blockInstances.filter(
    instance => stateControlBlockShapeIds.has(toGlobalEntityId(instance.blockShapeRef)) && instance.active
  )
  
  return filtered
}

export function getBlockShapeIdByType(
  bookingData: BookingData,
  type: BlockShapeType
): string | null {
  const blockShapes = getBlockShapes(bookingData, 'getBlockShapeIdByType')
  const blockShape = blockShapes.find((bs) => bs.type === type)
  if (blockShape === undefined) return null
  return blockShape.id !== undefined && blockShape.id !== null ? blockShape.id : null
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