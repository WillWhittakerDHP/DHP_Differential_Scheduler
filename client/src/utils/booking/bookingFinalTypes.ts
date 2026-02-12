/**
 * Booking final types (shared to break BlockFinal <-> partFinalizer circular dependency).
 * WHY: partFinalizer imports BlockFinal type from BlockFinal.ts, which imports createPartFinals from partFinalizer.
 * PATTERN: BlockFinal interface lives here; BlockFinal.ts and partFinalizer import from this file only.
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'

/**
 * BlockFinal: Aggregated block instance representing a finalized block
 * LEARNING: Represents a single block instance with its finalized parts and block-level totals
 * WHY: Block instance is the semantic unit - preserves block-level context
 * PATTERN: Plain interface with finalized parts and block totals
 */
export interface BlockFinal {
  blockInstanceId: string
  blockName: string
  blockShapeRef: string
  allowMultiple: boolean

  finalizedParts: PartFinal[]

  blockTotals: {
    baseTime: number
    baseFee: number
    rateOverBaseTime: number
    rateOverBaseFee: number
  }

  sourceBlockInstance: BookingBlockInstance
}
