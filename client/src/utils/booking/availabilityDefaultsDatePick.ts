/**
 * WHY: Default / restore date selection for availability step (pure).
 */

import type { ISO8601Date } from '@shared/types/primitiveBrands'

export function initialAvailabilityDateRangeFromRestore(
  candidateDate: { start?: string | null; end?: string | null } | undefined,
  fallbackToday: ISO8601Date
): { start: ISO8601Date | null; end: ISO8601Date | null } {
  const restored = candidateDate
  if (restored?.start) {
    const start = restored.start.includes('T') ? restored.start.split('T')[0] : restored.start
    return { start: start as ISO8601Date, end: (restored.end as ISO8601Date | null) ?? null }
  }
  return { start: fallbackToday, end: null }
}

export function resolveAvailabilityDateWhenNoneSelected(
  firstAvailabilityIso: ISO8601Date,
  todayIso: ISO8601Date
): { start: ISO8601Date; end: null } {
  const todayDate = new Date(todayIso)
  const firstDateObj = new Date(firstAvailabilityIso)
  if (firstDateObj >= todayDate) {
    return { start: firstAvailabilityIso, end: null }
  }
  return { start: todayIso, end: null }
}
