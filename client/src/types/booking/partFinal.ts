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
  /**
   * Minimizer placement (née moveable boolean): plain major/minor timeline (`false`),
   * separate minimizer scheduling segment (`true`), margin / pre-major anchor (`override`).
   * See `phases/phase-6.16-guide.md`.
   */
  minimizer: TernaryBoolean
  zeroOutPart: boolean
  sourcePartInstances: BookingPartInstance[]
}
