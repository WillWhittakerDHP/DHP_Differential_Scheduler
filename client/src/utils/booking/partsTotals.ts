import type { PartPricingFields } from '@/types/admin/partPricing'

type PartWithTotals = PartPricingFields

interface PartsTotalsResult {
  totalBaseFee: number
  totalBaseTime: number
  totalFeePerUnit: number
  totalTimePerUnit: number
  totalBaseMultiplier: number
  totalRateMultiplier: number
}

/**
PATTERN: Reduce to sum each prop...
 */
export function calculatePartsTotals(parts: PartWithTotals[]): PartsTotalsResult {
  // PATTERN: Use reduce with fallback to 0 for null/undefined values
  const totalBaseFee = parts.reduce((sum, part) => sum + (part.baseFee ?? 0), 0)
  const totalBaseTime = parts.reduce((sum, part) => sum + (part.baseTime ?? 0), 0)
  const totalFeePerUnit = parts.reduce((sum, part) => sum + (part.feePerUnit ?? 0), 0)
  const totalTimePerUnit = parts.reduce((sum, part) => sum + (part.timePerUnit ?? 0), 0)
  const totalBaseMultiplier = parts.reduce((product, part) => product * (part.baseMultiplier ?? 1), 1)
  const totalRateMultiplier = parts.reduce((product, part) => product * (part.rateMultiplier ?? 1), 1)

  return {
    totalBaseFee,
    totalBaseTime,
    totalFeePerUnit,
    totalTimePerUnit,
    totalBaseMultiplier,
    totalRateMultiplier
  }
}
