/**

PATTERN: Pure functions for block finalization, similar...
 */
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockFinal } from './BlockFinal'
import { createBlockFinal } from './BlockFinal'
import { filterZeroedParts } from './partFinalizer'

export function createBlockFinals(
  blockInstances: BookingBlockInstance[]
): BlockFinal[] {
  return blockInstances.map(blockInstance =>
    createBlockFinal(blockInstance)
  )
}

export function filterZeroedBlocks(
  blockFinals: BlockFinal[]
): BlockFinal[] {
  return blockFinals.filter(blockFinal => {
    // PATTERN: Filter out blocks where all parts are zeroed
    const nonZeroedParts = filterZeroedParts(blockFinal.finalizedParts)
    return nonZeroedParts.length > 0
  })
}
