/**
 * WHY: Shared Types and Utilities for Time Slot Management

WHY: Breaks circula...
 */
export type { BusyPeriodSource, BusyTimeRange } from '@shared/types/availabilityTypes'

/**
 * Check if two time ranges overlap
 * 
 * 
 * @param range1 - First time range
 * @param range2 - Second time range
 * @returns true if ranges overlap
 */
export function timeRangesOverlap(
  range1: { start: Date; end: Date },
  range2: { start: Date; end: Date }
): boolean {
  return (range1.start < range2.end && range1.end > range2.start)
}

