/**
 * Shared part pricing fields (base + rate over base for time and fee).
 */
export interface PartPricingFields {
  baseFee?: number | null
  baseTime?: number | null
  rateOverBaseFee?: number | null
  rateOverBaseTime?: number | null
}
