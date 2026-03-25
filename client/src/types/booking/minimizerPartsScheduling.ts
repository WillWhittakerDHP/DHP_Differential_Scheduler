import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

export interface ComputeMinimizerSlotsParams {
  innerBoundary: RFC3339DateTime
  outerBoundary: RFC3339DateTime
  duration: number
  minuteIncrement: number
  formatDayLabel: (iso: RFC3339DateTime) => string
  formatTimeLabel: (start: RFC3339DateTime, end: RFC3339DateTime) => string
}
