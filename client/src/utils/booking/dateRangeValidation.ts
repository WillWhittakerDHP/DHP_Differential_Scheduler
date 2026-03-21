
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'

const logger = createLogger('dateRangeValidation')

/**
 * WHY: Validate date range and return normalized RFC3339 datetime range
 */
export function validateDateRange(
  dateRange: { start: string | null; end: string | null } | null
): { start: RFC3339DateTime; end: RFC3339DateTime } | null {
  if (!dateRange?.start || !dateRange?.end) {
    return null
  }

  const start = new Date(dateRange.start)
  const end = new Date(dateRange.end)

  // Validate Date objects are valid (not NaN)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    logger.warn('Invalid date range (NaN)', { dateRange })
    return null
  }

  if (start >= end) {
    logger.warn('start must be before end', { start, end, dateRange })
    return null
  }

  return {
    start: start.toISOString() as RFC3339DateTime,
    end: end.toISOString() as RFC3339DateTime
  }
}

export function hasValidDateRangeStructure(
  dateRange: { start: string | null; end: string | null } | null
): boolean {
  return !!(dateRange?.start && dateRange?.end)
}
