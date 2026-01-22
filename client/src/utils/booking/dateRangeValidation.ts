/**
 * Date Range Validation Utility
 * 
 * LEARNING: Shared utility for validating date ranges across the codebase
 * WHY: Eliminates duplicate validation logic and ensures consistent validation
 * PATTERN: Pure validation functions that return validated date ranges or null
 * 
 * P2-3: Created to consolidate date range validation from multiple locations
 */

import type { RFC3339DateTime } from '@/types/datetime'
import { createLogger } from '@/utils/logger'

const logger = createLogger('dateRangeValidation')

/**
 * Validate date range and return normalized RFC3339 datetime range
 * LEARNING: Validates date range structure and returns normalized UTC datetime strings
 * WHY: Ensures consistent date range validation across all composables
 * PATTERN: Validate structure → Parse dates → Validate dates → Return normalized range
 * 
 * @param dateRange - Date range with start and end (can be null)
 * @returns Normalized RFC3339 datetime range or null if invalid
 */
export function validateDateRange(
  dateRange: { start: string | null; end: string | null } | null
): { start: RFC3339DateTime; end: RFC3339DateTime } | null {
  // Check if dateRange exists and has required fields
  if (!dateRange?.start || !dateRange?.end) {
    return null
  }

  // Parse dates
  const start = new Date(dateRange.start)
  const end = new Date(dateRange.end)

  // Validate Date objects are valid (not NaN)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    logger.warn('Invalid date range (NaN)', { dateRange })
    return null
  }

  // Validate start < end
  if (start >= end) {
    logger.warn('start must be before end', { start, end, dateRange })
    return null
  }

  // Return normalized RFC3339 datetime range
  return {
    start: start.toISOString() as RFC3339DateTime,
    end: end.toISOString() as RFC3339DateTime
  }
}

/**
 * Check if date range is valid (basic structure check)
 * LEARNING: Quick validation check without parsing dates
 * WHY: Useful for early returns before expensive date parsing
 * PATTERN: Check structure only, don't parse dates
 * 
 * @param dateRange - Date range to check
 * @returns true if dateRange has valid structure, false otherwise
 */
export function hasValidDateRangeStructure(
  dateRange: { start: string | null; end: string | null } | null
): boolean {
  return !!(dateRange?.start && dateRange?.end)
}
