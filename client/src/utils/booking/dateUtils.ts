/**
 * Date utilities for booking (UTC-only)
 *
 * LEARNING: parseUTCDate moved from slotPipeline for use after server-side slot computation
 * WHY: useAvailabilityLogic and others need UTC date parsing without slot pipeline dependency
 */

import { createLogger } from '@/utils/logger'

const logger = createLogger('dateUtils')

/**
 * Parse date string or Date in UTC
 * LEARNING: Parses dates in UTC timezone, not local
 * WHY: All business logic should use UTC to avoid timezone issues
 */
export function parseUTCDate(dateInput: string | Date): Date | null {
  let dateString: string
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      logger.warn('Invalid Date object passed to parseUTCDate:', dateInput)
      return null
    }
    const year = dateInput.getUTCFullYear()
    const month = String(dateInput.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dateInput.getUTCDate()).padStart(2, '0')
    dateString = `${year}-${month}-${day}`
  } else if (typeof dateInput === 'string') {
    dateString = dateInput
  } else {
    dateString = String(dateInput)
  }

  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    logger.warn('Invalid date string format:', datePart)
    return null
  }

  const [year, month, day] = datePart.split('-').map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    logger.warn('Invalid date components:', { year, month, day, datePart })
    return null
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    logger.warn('Invalid date component ranges:', { year, month, day, datePart })
    return null
  }

  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  if (isNaN(date.getTime())) {
    logger.warn('Invalid Date object created:', { year, month, day, datePart })
    return null
  }
  return date
}
