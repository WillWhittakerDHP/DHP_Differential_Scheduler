import type { ComputedRef } from 'vue'

export interface UsePartsTotalsReturn {
  canHaveParts: ComputedRef<boolean>
  totalBaseFee: ComputedRef<number>
  totalBaseTime: ComputedRef<number>
  totalRateOverBaseFee: ComputedRef<number>
  totalRateOverBaseTime: ComputedRef<number>
}
