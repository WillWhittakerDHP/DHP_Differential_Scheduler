
interface PartWithTotals {
  baseFee?: number | null
  baseTime?: number | null
  rateOverBaseFee?: number | null
  rateOverBaseTime?: number | null
}

interface PartsTotalsResult {
  totalBaseFee: number
  totalBaseTime: number
  totalRateOverBaseFee: number
  totalRateOverBaseTime: number
}

/**
PATTERN: Reduce to sum each prop...
 */
export function calculatePartsTotals(parts: PartWithTotals[]): PartsTotalsResult {
  // LEARNING: Sum each property using reduce, treating null/undefined as 0
  // PATTERN: Use reduce with fallback to 0 for null/undefined values
  const totalBaseFee = parts.reduce((sum, part) => sum + (part.baseFee ?? 0), 0)
  const totalBaseTime = parts.reduce((sum, part) => sum + (part.baseTime ?? 0), 0)
  const totalRateOverBaseFee = parts.reduce((sum, part) => sum + (part.rateOverBaseFee ?? 0), 0)
  const totalRateOverBaseTime = parts.reduce((sum, part) => sum + (part.rateOverBaseTime ?? 0), 0)

  return {
    totalBaseFee,
    totalBaseTime,
    totalRateOverBaseFee,
    totalRateOverBaseTime
  }
}
