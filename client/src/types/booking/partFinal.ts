import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface PartFinal {
  partShape: string
  baseTime: number
  baseFee: number
  rateOverBaseTime: number
  rateOverBaseFee: number
  zeroOutPart: boolean
  sourcePartInstances: BookingPartInstance[]
}
