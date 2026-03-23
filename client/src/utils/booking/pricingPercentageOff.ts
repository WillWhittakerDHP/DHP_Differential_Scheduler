/**
 * WHY: Part finalizer + confirmation pricing share one definition of "percentage off" and how it combines
 * with negative base fees (fixed discounts).
 */

/**
 * Normalize percentage off for fee math. Admin may store `10` (10%) or `0.1` (10% as a fraction).
 */
export function normalizePercentageOffForFee(raw: number | undefined | null): number {
  if (raw == null || Number.isNaN(raw)) return 0
  if (raw > 0 && raw <= 1) return raw * 100
  return raw
}

/**
 * Apply percentage reduction to a single fee component. Negative values are fixed discounts — do not
 * scale them by percentage (matches coupon discount line in confirmation pricing).
 */
export function applyPercentageOffToFeeComponent(
  value: number,
  percentageOffRaw: number | undefined | null
): number {
  const pct = normalizePercentageOffForFee(percentageOffRaw)
  if (pct <= 0 || value < 0) return value
  return value * (1 - pct / 100)
}
