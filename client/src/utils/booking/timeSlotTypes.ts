/**
 * Shared Types and Utilities for Time Slot Management
 * 
 * LEARNING: Centralized types and utilities shared between slotPipeline and slotAvailabilityOrchestrator
 * WHY: Breaks circular dependency and provides single source of truth for shared types
 * PATTERN: Pure utility functions and type definitions - no side effects
 */

import type { BusyPeriodSource, RFC3339DateTime } from '@shared/types/availabilityTypes'

// Re-export types for backward compatibility
export type { BusyPeriodSource }

/**
 * Busy time range from calendar or user input
 * LEARNING: Represents a time period when the calendar is busy
 * WHY: Used for blocking slots that overlap with existing appointments or events
 * PATTERN: RFC3339 datetime strings with optional metadata
 */
export interface BusyTimeRange {
  start: RFC3339DateTime  // RFC3339 datetime string (ISO 8601 with timezone)
  end: RFC3339DateTime    // RFC3339 datetime string (ISO 8601 with timezone)
  placeId?: string        // Optional Google Place ID for drive time calculations (primary location identifier)
  source?: BusyPeriodSource  // Optional data-origin tag (e.g., 'event' from Events API, 'outOfOffice' from Events API)
}

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

