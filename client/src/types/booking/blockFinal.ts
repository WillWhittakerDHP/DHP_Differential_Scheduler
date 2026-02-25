import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from '@/types/booking/partFinal'

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
