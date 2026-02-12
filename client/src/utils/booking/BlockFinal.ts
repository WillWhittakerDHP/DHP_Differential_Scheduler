/**
 * BlockFinal: Aggregated block instance representing a finalized block
 *
 * LEARNING: Represents a single block instance with its finalized parts and block-level totals
 * WHY: Block instance is the semantic unit - preserves block-level context (allowMultiple, block metadata)
 * PATTERN: Plain interface with utility functions for calculations, similar to PartFinal pattern
 *
 * This preserves block-level context that is lost when flattening blocks immediately.
 * Each BlockFinal contains the finalized parts within that block and block-level totals.
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockFinal } from './bookingFinalTypes'
import { createPartFinals } from './partFinalizer'

export type { BlockFinal } from './bookingFinalTypes'

/**
 * Create BlockFinal from a single block instance
 * LEARNING: Finalizes parts within the block and calculates block-level totals
 * WHY: Creates finalized representation of a block instance with its parts
 * PATTERN: Create finalized parts, then calculate block totals from those parts
 * 
 * @param blockInstance - Block instance to finalize
 * @returns BlockFinal with finalized parts and block totals
 */
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
    rateOverBaseTime: finalizedParts.reduce((sum, part) => sum + part.rateOverBaseTime, 0),
    rateOverBaseFee: finalizedParts.reduce((sum, part) => sum + part.rateOverBaseFee, 0)
  }
  
  return {
    blockInstanceId: blockInstance.id,
    blockName: blockInstance.name,
    blockShapeRef: blockInstance.blockShapeRef,
    allowMultiple: blockInstance.allowMultiple,
    finalizedParts,
    blockTotals,
    sourceBlockInstance: blockInstance
  }
}
