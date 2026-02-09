/**
 * Shared Constraint Type Constants
 * 
 * LEARNING: Single source of truth for constraint type constants shared between client and server
 * WHY: Prevents duplication and ensures consistency across codebase
 * PATTERN: Shared constants alongside shared types
 * 
 * Phase: Constraint DRY Refactor
 * - Moved from client/src/constants/constraintTypes.ts
 * - Moved from server/src/services/constraintExtractor.ts
 * - Moved from server/src/services/capacityComputer.ts
 */

import type { RangeConstraintType } from '../types/availabilityTypes.js'

/**
 * Range constraint type values
 * LEARNING: Constants matching RangeConstraintType union type
 * WHY: Allows using constants in switch statements instead of string literals
 * PATTERN: Export constants that match the type definition
 */
export const RANGE_CONSTRAINT_TYPES = {
  BUSINESS_HOURS: 'businessHours' as const satisfies RangeConstraintType,
  LEAD_TIME: 'leadTime' as const satisfies RangeConstraintType,
  DATE_RANGE: 'dateRange' as const satisfies RangeConstraintType,
} as const

/**
 * Time basis type values for capacity filters
 * LEARNING: Constants for capacity filter time basis types
 * WHY: Allows using constants in switch statements instead of string literals
 * PATTERN: Export constants matching the type definition
 */
export const TIME_BASIS_TYPES = {
  DAILY: 'daily' as const,
  CALENDAR_WEEK: 'calendarWeek' as const,
  ROLLING_WEEK: 'rollingWeek' as const,
} as const

export type TimeBasisType = typeof TIME_BASIS_TYPES[keyof typeof TIME_BASIS_TYPES]
