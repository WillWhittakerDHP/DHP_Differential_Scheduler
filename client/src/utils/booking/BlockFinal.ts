import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockFinal } from './bookingFinalTypes'
import { createPartFinals } from './partFinalizer'

export type { BlockFinal } from './bookingFinalTypes'

export function createBlockFinal(
  blockInstance: BookingBlockInstance
): BlockFinal {
  const raw = blockInstance.partInstances
  const partInstances = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
  
  // PATTERN: Create finalized parts for this block's parts
  const finalizedParts = createPartFinals(partInstances)
  
  // PATTERN: Calculate block totals from finalized parts
  const blockTotals = {
    baseTime: finalizedParts.reduce((sum, part) => sum + part.baseTime, 0),
    baseFee: finalizedParts.reduce((sum, part) => sum + part.baseFee, 0),
    timePerUnit: finalizedParts.reduce((sum, part) => sum + part.timePerUnit, 0),
    feePerUnit: finalizedParts.reduce((sum, part) => sum + part.feePerUnit, 0)
  }
  
  return {
    blockInstanceId: blockInstance.id,
    blockName: blockInstance.name,
    blockShapeRef: blockInstance.blockShapeRef,
    allowMultiple: blockInstance.allowMultiple ?? false,
    finalizedParts,
    blockTotals,
    sourceBlockInstance: blockInstance
  }
}
