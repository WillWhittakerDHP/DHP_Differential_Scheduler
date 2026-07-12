import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockFinal } from './bookingFinalTypes'
import { createPartFinals, filterZeroedParts } from './partFinalizer'

export type { BlockFinal } from './bookingFinalTypes'

export function createBlockFinal(
  blockInstance: BookingBlockInstance
): BlockFinal {
  const raw = blockInstance.partInstances
  const partInstances = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []

  const finalizedParts = createPartFinals(partInstances)

  // WHY: Principles §4.8 — zeroed-out parts are excluded from booking rollups (zero-out
  // is the last per-part step and wins over all prior math). finalizedParts keeps every
  // part for provenance; only the totals exclude zeroed contributions.
  const rollupParts = filterZeroedParts(finalizedParts)
  const blockTotals = {
    baseTime: rollupParts.reduce((sum, part) => sum + part.baseTime, 0),
    baseFee: rollupParts.reduce((sum, part) => sum + part.baseFee, 0),
    timePerUnit: rollupParts.reduce((sum, part) => sum + part.timePerUnit, 0),
    feePerUnit: rollupParts.reduce((sum, part) => sum + part.feePerUnit, 0)
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
