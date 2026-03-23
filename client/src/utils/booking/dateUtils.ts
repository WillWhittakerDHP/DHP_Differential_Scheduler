/**
 * WHY: Date utilities for booking (UTC-only)
WHY: useAvailabilityLogic and othe...
 */
import { createLogger } from '@/utils/logger'

const logger = createLogger('dateUtils')

function dateInputToYmdString(dateInput: string | Date): string {
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      logger.warn('Invalid Date object passed to parseUTCDate:', dateInput)
      return ''
    }
    const y = dateInput.getUTCFullYear()
    const m = String(dateInput.getUTCMonth() + 1).padStart(2, '0')
    const d = String(dateInput.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof dateInput === 'string') {
    return dateInput
  }
  return String(dateInput)
}

function utcDateFromYmdParts(year: number, month: number, day: number, datePart: string): Date | null {
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

/**
 * WHY: Parse date string or Date in UTC
 */
export function parseUTCDate(dateInput: string | Date): Date | null {
  const dateString = dateInputToYmdString(dateInput)
  if (dateString === '') {
    return null
  }
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    logger.warn('Invalid date string format:', datePart)
    return null
  }
  const [year, month, day] = datePart.split('-').map(Number)
  return utcDateFromYmdParts(year, month, day, datePart)
}
