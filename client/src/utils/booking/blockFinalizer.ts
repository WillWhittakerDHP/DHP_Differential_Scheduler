/**
 * PATTERN: Block Finalizer

PATTERN: Pure functions for block finalization, similar...
 */
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockFinal } from './BlockFinal'
import { createBlockFinal } from './BlockFinal'
import { filterZeroedParts } from './partFinalizer'

/**
 * Create BlockFinal instances from block instances
 * 
 * @param blockInstances - Array of BookingBlockInstance objects
 * @returns Array of BlockFinal instances
 */
export function createBlockFinals(
  blockInstances: BookingBlockInstance[]
): BlockFinal[] {
  return blockInstances.map(blockInstance =>
    createBlockFinal(blockInstance)
  )
}

/**
 * Filter out BlockFinal instances that have all zeroed parts
 * 
 * @param blockFinals - Array of BlockFinal instances
 * @returns Array of BlockFinal instances excluding blocks with all zeroed parts
 */
export function filterZeroedBlocks(
  blockFinals: BlockFinal[]
): BlockFinal[] {
  return blockFinals.filter(blockFinal => {
    // PATTERN: Filter out blocks where all parts are zeroed
    const nonZeroedParts = filterZeroedParts(blockFinal.finalizedParts)
    return nonZeroedParts.length > 0
  })
}
