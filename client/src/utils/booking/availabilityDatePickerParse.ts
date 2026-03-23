import { toISO8601Date } from '@/utils/datetime'
import type { ISO8601Date } from '@shared/types/primitiveBrands'

export function parseVDatePickerValueToIso(value: string | Date | string[] | Date[] | null): ISO8601Date | null {
  if (!value) {
    return null
  }
  if (Array.isArray(value)) {
    const firstValue = value[0]
    if (firstValue instanceof Date) {
      return toISO8601Date(firstValue.toISOString().split('T')[0])
    }
    if (typeof firstValue === 'string') {
      return toISO8601Date(firstValue.includes('T') ? firstValue.split('T')[0] : firstValue)
    }
    return null
  }
  if (value instanceof Date) {
    return toISO8601Date(value.toISOString().split('T')[0])
  }
  if (typeof value === 'string') {
    return toISO8601Date(value.includes('T') ? value.split('T')[0] : value)
  }
  return null
}
