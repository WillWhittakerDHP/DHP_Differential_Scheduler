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
