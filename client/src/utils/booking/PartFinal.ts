import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from '@/types/booking/partFinal'
import { applyPercentageOffToFeeComponent } from '@/utils/booking/pricingPercentageOff'

export type { PartFinal } from '@/types/booking/partFinal'

export function createPartFinal(
  partShape: string,
  parts: BookingPartInstance[]
): PartFinal {
  const baseTime = parts.reduce((sum, p) => sum + (p.baseTime ?? 0), 0)
  const baseFee = parts.reduce(
    (sum, p) => sum + applyPercentageOffToFeeComponent(p.baseFee ?? 0, p.percentageOff),
    0
  )
  const feePerUnit = parts.reduce(
    (sum, p) => sum + applyPercentageOffToFeeComponent(p.feePerUnit ?? 0, p.percentageOff),
    0
  )

  return {
    partShape,
    baseTime,
    baseFee,
    timePerUnit: parts.reduce((sum, p) => sum + (p.timePerUnit ?? 0), 0),
    feePerUnit,
    zeroOutPart: parts.some(p => p.zeroOutPart === true),
    sourcePartInstances: parts
  }
}
