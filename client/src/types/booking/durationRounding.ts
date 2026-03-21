import type { ComputedRef } from 'vue'

export type RoundingMethod = 'roundUp' | 'roundDown' | 'roundNearest'

export interface DurationRoundingConfig {
  enabled: boolean
  increment: number
  method: RoundingMethod
}

export interface UseDurationRoundingReturn {
  roundDuration: (duration: number) => number
  isRoundingEnabled: ComputedRef<boolean>
  roundingConfig: ComputedRef<DurationRoundingConfig | null>
}
