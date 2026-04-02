
import { ternaryToBookingMode } from '@shared/utils/ternaryAliasUtils'
import type { TernaryBoolean } from '@/types/ternary'
import type { BookingMode } from '@/constants/bookingMode'

export function convertToTernaryBoolean(
  value: TernaryBoolean | undefined | null,
  defaultValue: TernaryBoolean = 'false'
): TernaryBoolean {
  if (value === 'true' || value === 'false' || value === 'override') return value
  return defaultValue
}

/** Maps stored ternary aliases to domain `BookingMode` (legacy helpers; block instances use booleans). */
export function convertTernaryToBookingMode(
  value: TernaryBoolean | undefined | null,
  defaultVal: BookingMode = 'standalone'
): BookingMode {
  return ternaryToBookingMode(value ?? undefined, defaultVal)
}

export function safeId(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

export function normalizePrimitiveForSave(
  value: unknown
): string | number | boolean | undefined {
  if (value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const asNumber = Number(trimmed)
    if (Number.isFinite(asNumber)) return asNumber
    return trimmed
  }
  return value as string | number | boolean | undefined
}
