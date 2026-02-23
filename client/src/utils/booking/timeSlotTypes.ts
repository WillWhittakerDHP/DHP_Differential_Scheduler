export type { BusyPeriodSource, BusyTimeRange } from '@shared/types/availabilityTypes'

export function timeRangesOverlap(
  range1: { start: Date; end: Date },
  range2: { start: Date; end: Date }
): boolean {
  return (range1.start < range2.end && range1.end > range2.start)
}

