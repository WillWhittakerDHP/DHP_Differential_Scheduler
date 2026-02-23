/**
 * Shared Types and Utilities for Time Slot Management
 * 
 * LEARNING: Centralized types and utilities shared between slotPipeline and slotAvailabilityOrchestrator
 * WHY: Breaks circular dependency and provides single source of truth for shared types
 * PATTERN: Pure utility functions and type definitions - no side effects
 */

// Re-export types for backward compatibility; TYPE_SIMILARITY: single source of truth for BusyTimeRange
export type { BusyPeriodSource, BusyTimeRange } from '@shared/types/availabilityTypes'

/**
 * Check if two time ranges overlap
 * 
 * LEARNING: Extracted overlap detection for reuse
 * WHY: Used by fitTimeSlots and potentially other utilities
 * PATTERN: Two ranges overlap if one starts before the other ends
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

