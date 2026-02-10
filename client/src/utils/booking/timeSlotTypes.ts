/**
 * Shared Types and Utilities for Time Slot Management
 * 
 * LEARNING: Centralized types and utilities shared between slotPipeline and slotAvailabilityOrchestrator
 * WHY: Breaks circular dependency and provides single source of truth for shared types
 * PATTERN: Pure utility functions and type definitions - no side effects
 */

import type { RFC3339DateTime, DayOfWeek } from '@/types/datetime'
import type { BusyPeriodSource } from '@shared/types/availabilityTypes'

// Re-export types for backward compatibility
export type { BusyPeriodSource }

/**
 * Parsed busy time range with Date objects
 * LEARNING: Internal representation of busy periods with parsed Date objects
 * WHY: Avoids repeated parsing of RFC3339 strings during overlap checks
 * PATTERN: Pre-parsed Date objects for efficient comparisons
 * Busy periods represent opaque event time (and out-of-office); transparent events do not block.
 */
export interface ParsedBusyTimeRange {
  start: Date
  end: Date
  source?: BusyPeriodSource
  placeId?: string
  driveToCandidate?: number    // minutes (event -> candidate), stamped by server
  driveFromCandidate?: number  // minutes (candidate -> event), stamped by server
}

/**
 * Business hours configuration for a single day
 * LEARNING: Uses RFC3339 format internally (with reference date for time-of-day)
 * WHY: Consistent format throughout codebase, matches Google Calendar API
 * PATTERN: RFC3339 datetime using fixed reference date (2000-01-01)
 */
export interface DayBusinessHours {
  start: RFC3339DateTime  // RFC3339 format with reference date (e.g., "2000-01-01T08:00:00Z" for "08:00")
  end: RFC3339DateTime    // RFC3339 format with reference date (e.g., "2000-01-01T17:00:00Z" for "17:00")
}

/**
 * Business hours by day of week (0 = Sunday, 6 = Saturday)
 * 
 * LEARNING: Days can be omitted to represent closed days
 * WHY: Not all businesses operate 7 days per week
 * PATTERN: Partial record - missing keys indicate closed days
 * 
 * @example
 * // Open Monday-Friday only
 * const businessHours: BusinessHoursMap = {
 *   1: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   2: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   3: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   4: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   5: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" }
 *   // Saturday (6) and Sunday (0) omitted = closed
 * }
 */
export type BusinessHoursMap = Partial<Record<DayOfWeek, DayBusinessHours>>

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

