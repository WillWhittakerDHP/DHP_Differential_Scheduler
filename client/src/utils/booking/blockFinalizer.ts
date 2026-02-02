/**
 * Block Finalizer
 * 
 * LEARNING: Creates BlockFinal instances from block instances
 * WHY: Preserves block-level context and creates clear pipeline: Blocks → BlockFinals → SlotShape
 * PATTERN: Pure functions for block finalization, similar to partFinalizer pattern
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockFinal } from './BlockFinal'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { createBlockFinal } from './BlockFinal'
import { filterZeroedParts } from './partFinalizer'

/**
 * Create BlockFinal instances from block instances
 * LEARNING: Finalizes each block instance individually, preserving block-level context
 * WHY: Block instance is the semantic unit - each block is finalized independently
 * PATTERN: Map over block instances, create BlockFinal for each
 * 
 * @param blockInstances - Array of BookingBlockInstance objects
 * @param settings - Optional availability settings for rounding configuration
 * @returns Array of BlockFinal instances
 */
export function createBlockFinals(
  blockInstances: BookingBlockInstance[],
  settings?: AvailabilitySettings | null
): BlockFinal[] {
  return blockInstances.map(blockInstance =>
    createBlockFinal(blockInstance, settings || null)
  )
}

/**
 * Filter out BlockFinal instances that have all zeroed parts
 * LEARNING: Removes BlockFinal instances where all parts are zeroed out
 * WHY: Blocks with all zeroed parts should not contribute to calculations
 * PATTERN: Filter based on whether block has any non-zeroed parts
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
