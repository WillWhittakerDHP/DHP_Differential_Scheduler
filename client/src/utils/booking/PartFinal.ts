import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from '@/types/booking/partFinal'

export type { PartFinal } from '@/types/booking/partFinal'





/** Placeholder values until eventAssignments-derived major/minor/moveable are wired. */
const PART_FINAL_DEFAULT_MAJOR = 'false' as const
const PART_FINAL_DEFAULT_MINOR = 'false' as const
const PART_FINAL_DEFAULT_MOVEABLE = false

/**
 * Apply percentage off to a single fee value (e.g. baseFee or rateOverBaseFee).
 * Allows negative values (fixed discount); percentage is applied to the raw value.
 */
function applyPercentageOff(value: number, percentageOff: number | undefined | null): number {
  const pct = percentageOff ?? 0
  if (pct <= 0) return value
  return value * (1 - pct / 100)
}

export function createPartFinal(
  partShape: string,
  parts: BookingPartInstance[]
): PartFinal {
  const baseTime = parts.reduce((sum, p) => sum + (p.baseTime ?? 0), 0)
  const baseFee = parts.reduce(
    (sum, p) => sum + applyPercentageOff(p.baseFee ?? 0, p.percentageOff),
    0
  )
  const rateOverBaseFee = parts.reduce(
    (sum, p) => sum + applyPercentageOff(p.rateOverBaseFee ?? 0, p.percentageOff),
    0
  )

  return {
    partShape,
    baseTime,
    baseFee,
    rateOverBaseTime: parts.reduce((sum, p) => sum + (p.rateOverBaseTime ?? 0), 0),
    rateOverBaseFee,
    major: PART_FINAL_DEFAULT_MAJOR,
    minor: PART_FINAL_DEFAULT_MINOR,
    moveable: PART_FINAL_DEFAULT_MOVEABLE,
    zeroOutPart: parts.some(p => p.zeroOutPart === true),
    sourcePartInstances: parts
  }
}
