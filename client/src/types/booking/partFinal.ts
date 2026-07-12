import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface PartFinal {
  partShape: string
  baseTime: number
  baseFee: number
  timePerUnit: number
  feePerUnit: number
  zeroOutPart: boolean
  sourcePartInstances: BookingPartInstance[]
}
