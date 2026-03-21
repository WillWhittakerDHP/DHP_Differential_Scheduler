import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { TernaryBoolean } from '@/types/ternary'

export interface PartFinal {
  partShape: string
  baseTime: number
  baseFee: number
  rateOverBaseTime: number
  rateOverBaseFee: number
  major: TernaryBoolean
  minor: TernaryBoolean
  moveable: boolean
  zeroOutPart: boolean
  sourcePartInstances: BookingPartInstance[]
}
