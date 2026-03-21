import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

export interface SlotGenerationParamsBase {
  duration: number
  minuteIncrement: number
  startBoundary: RFC3339DateTime
  endBoundary: RFC3339DateTime
}

export type SlotGenerationParams = SlotGenerationParamsBase
