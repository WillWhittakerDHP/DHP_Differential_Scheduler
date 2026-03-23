/**
 * WHY: VDatePicker emits Date or string — normalize to ISO8601 date (YYYY-MM-DD).
 */

import type { ISO8601Date } from '@shared/types/primitiveBrands'

export function iso8601DateFromPickerValue(value: ISO8601Date | Date | null): ISO8601Date | null {
  if (!value) {
    return null
  }
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] as ISO8601Date
  }
  if (typeof value === 'string') {
    return (value.includes('T') ? value.split('T')[0] : value) as ISO8601Date
  }
  return null
}
