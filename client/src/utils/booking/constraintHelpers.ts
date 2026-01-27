/**
 * Constraint Helper Functions
 * 
 * LEARNING: Centralized helper functions for constraint management
 * WHY: DRY principle - eliminates duplication across composables
 * PATTERN: Pure functions that transform settings objects
 */

import type { AvailabilitySettings, RangeConstraint } from '@/configs/availabilitySettings'
import type { OverlapConstraint, CapacityConstraint } from './constraintExtractors'
import { extractRangeConstraints, extractOverlapConstraints, extractCapacityConstraints } from './constraintExtractors'

/**
 * Ensure dateRange is set in rangeConstraints before extraction
 * LEARNING: Centralizes dateRange setup logic to eliminate duplication
 * WHY: DRY principle - single source of truth for dateRange constraint setup
 * PATTERN: Pure function that adds dateRange if missing
 * 
 * @param settings - Availability settings
 * @param dateRange - Date range to set in rangeConstraints
 * @returns Settings with dateRange in rangeConstraints
 */
export function ensureDateRangeInSettings(
  settings: AvailabilitySettings,
  dateRange: { start: string; end: string }
): AvailabilitySettings {
  return {
    ...settings,
    rangeConstraints: {
      ...settings.rangeConstraints,
      dateRange: settings.rangeConstraints?.dateRange || {
        type: 'dateRange',
        enforcement: 'hard',
        config: { start: dateRange.start, end: dateRange.end }
      }
    }
  }
}

/**
 * Extract all constraints from availability settings
 * LEARNING: Centralizes constraint extraction logic to eliminate duplication
 * WHY: DRY principle - single source of truth for extracting all constraint types
 * PATTERN: Pure function that extracts range, overlap, and capacity constraints
 * 
 * @param settings - Availability settings
 * @returns Object with rangeConstraints, overlapConstraints, and capacityConstraints arrays
 */
export function extractAllConstraints(
  settings: AvailabilitySettings
): {
  rangeConstraints: RangeConstraint[]
  overlapConstraints: OverlapConstraint[]
  capacityConstraints: CapacityConstraint[]
} {
  return {
    rangeConstraints: extractRangeConstraints(settings),
    overlapConstraints: extractOverlapConstraints(settings),
    capacityConstraints: extractCapacityConstraints(settings)
  }
}
