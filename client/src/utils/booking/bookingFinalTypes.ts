/**
 * Booking final types (shared to break BlockFinal <-> partFinalizer circular dependency).
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'

/**
 * BlockFinal: Aggregated block instance representing a finalized block
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
