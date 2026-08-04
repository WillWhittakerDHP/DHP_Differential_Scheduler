import type { FeeEntryBase } from '@shared/types/appointmentFeeTypes'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import { filterZeroedParts } from './partFinalizer'
import { createBlockFinal } from './BlockFinal'
import { getEffectivePartsForFee } from './pricingCascadeResolver'

/** Extends shared FeeEntryBase for single source of truth. */
export type BlockInstanceFeeResult = FeeEntryBase

export function calculateBlockInstanceFee(
  blockInstance: BookingBlockInstance,
  squareFootage: number | null,
  aduCount?: number | null,
  allPartInstances?: BookingPartInstance[] | null
): BlockInstanceFeeResult {
  const rawParts: BookingPartInstance[] =
    blockInstance.partInstances != null ? blockInstance.partInstances : []
  const effectiveParts: BookingPartInstance[] =
    allPartInstances != null && allPartInstances.length > 0
      ? getEffectivePartsForFee(rawParts, allPartInstances)
      : rawParts
  const blockForFinal =
    effectiveParts === rawParts
      ? blockInstance
      : { ...blockInstance, partInstances: effectiveParts }
  const blockFinal = createBlockFinal(blockForFinal)
  const nonZeroedFinalizedParts = filterZeroedParts(blockFinal.finalizedParts)

  const blockTotals = nonZeroedFinalizedParts.reduce(
    (acc, part) => ({
      baseFee: acc.baseFee + part.baseFee,
      feePerUnit: acc.feePerUnit + part.feePerUnit
    }),
    { baseFee: 0, feePerUnit: 0 }
  )
  const baseFee = blockTotals.baseFee
  const sqft = squareFootage ?? 0
  const overageFee = blockTotals.feePerUnit * sqft

  const totalFeeBeforeMultiplier = baseFee + overageFee

  if (blockInstance.allowMultiple === true) {
    const multiplier = aduCount ?? 1
    return {
      baseFee: baseFee * multiplier,
      overageFee: overageFee * multiplier,
      totalFee: totalFeeBeforeMultiplier * multiplier
    }
  }

  return {
    baseFee,
    overageFee,
    totalFee: totalFeeBeforeMultiplier
  }
}
