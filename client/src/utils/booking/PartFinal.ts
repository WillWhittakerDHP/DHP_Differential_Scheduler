import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from '@/types/booking/partFinal'
import { applyPercentageOffToFeeComponent } from '@/utils/booking/pricingPercentageOff'

export type { PartFinal } from '@/types/booking/partFinal'

export function createPartFinal(
  partShape: string,
  parts: BookingPartInstance[]
): PartFinal {
  const baseTime = parts.reduce((sum, p) => sum + (p.baseTime ?? 0) * (p.baseMultiplier ?? 1), 0)
  const baseFee = parts.reduce(
    (sum, p) =>
      sum + applyPercentageOffToFeeComponent((p.baseFee ?? 0) * (p.baseMultiplier ?? 1), p.percentageOff),
    0
  )
  const feePerUnit = parts.reduce(
    (sum, p) =>
      sum + applyPercentageOffToFeeComponent((p.feePerUnit ?? 0) * (p.rateMultiplier ?? 1), p.percentageOff),
    0
  )
  const timePerUnit = parts.reduce((sum, p) => sum + (p.timePerUnit ?? 0) * (p.rateMultiplier ?? 1), 0)

  return {
    partShape,
    baseTime,
    baseFee,
    timePerUnit,
    baseMultiplier: parts.reduce((product, p) => product * (p.baseMultiplier ?? 1), 1),
    rateMultiplier: parts.reduce((product, p) => product * (p.rateMultiplier ?? 1), 1),
    feePerUnit,
    zeroOutPart: parts.some(p => p.zeroOutPart === true),
    sourcePartInstances: parts
  }
}
