/**
 * Shared part pricing fields (base + per-unit values for time and fee).
 */
export interface PartPricingFields {
  baseFee?: number | null
  baseTime?: number | null
  feePerUnit?: number | null
  timePerUnit?: number | null
  baseMultiplier?: number | null
  rateMultiplier?: number | null
}
