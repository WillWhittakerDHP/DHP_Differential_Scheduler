/**
 * Shared part pricing fields (base + rate over base for time and fee).
 * WHY: PartInstanceBulkEditData and PartWithTotals share this shape; single source of truth.
 */
export interface PartPricingFields {
  baseFee?: number | null
  baseTime?: number | null
  rateOverBaseFee?: number | null
  rateOverBaseTime?: number | null
}
