/**
 * Constraint Type Constants
 * 
 * LEARNING: Centralized constants for constraint type values
 * WHY: Reduces hardcoding audit findings, provides single source of truth for constraint types
 * PATTERN: Constants file with exported string literals matching type definitions
 */

import type { RangeConstraintType } from '@/configs/availabilitySettings'

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
 * PATTERN: Export constants matching the inline type definition
 */
export const TIME_BASIS_TYPES = {
  DAILY: 'daily' as const,
  CALENDAR_WEEK: 'calendarWeek' as const,
  ROLLING_WEEK: 'rollingWeek' as const,
} as const

export type TimeBasisType = typeof TIME_BASIS_TYPES[keyof typeof TIME_BASIS_TYPES]
