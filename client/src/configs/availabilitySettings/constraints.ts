/**
 * Range constraint normalization for API responses.
 */
import type { AvailabilitySettings, RangeConstraint, RawAvailabilitySettings } from './types'

/** API may omit category; normalize to shared RangeConstraint (category: 'range') when reading. */
export function ensureRangeConstraintCategory(
  rc: RawAvailabilitySettings['rangeConstraints']
): AvailabilitySettings['rangeConstraints'] {
  if (!rc) return undefined
  const withCategory = (
    c: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })
  ): RangeConstraint =>
    ('category' in c && c.category === 'range'
      ? c
      : { ...c, category: 'range' as const }) as RangeConstraint
  return {
    businessHours: rc.businessHours ? withCategory(rc.businessHours) : undefined,
    leadTime: rc.leadTime ? withCategory(rc.leadTime) : undefined,
    dateRange: rc.dateRange ? withCategory(rc.dateRange) : undefined,
  }
}
