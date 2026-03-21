
import { createLogger } from '@/utils/logger'
import { ternaryToBookingMode, bookingModeToTernary } from '@shared/utils/ternaryAliasUtils'
import type { TernaryBoolean } from '@/types/ternary'
import type { BookingMode } from '@/constants/bookingMode'

const logger = createLogger('transformerPrimitives')

function usedFallback(context: string | undefined, value: unknown, fallback: unknown): void {
  if (context !== undefined) {
    logger.debug(`[transformerPrimitives] fallback used`, { context, received: value, fallback })
  }
}

/**
 * Extract optional string; log at warn when falling back so data quality issues are visible.
 * Use at API boundary (e.g. appointmentToWizardTransformer) for explicit extraction with validation.
 */
export function extractOptionalString(
  value: unknown,
  fieldName: string,
  defaultVal: string = ''
): string {
  if (typeof value === 'string') return value
  logger.warn(`[transformer] Missing or invalid string for ${fieldName}, using default`, {
    fieldName,
    received: value,
    default: defaultVal
  })
  return defaultVal
}

export function extractOptionalNumber(
  value: unknown,
  fieldName: string,
  defaultVal: number = 0
): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  logger.warn(`[transformer] Missing or invalid number for ${fieldName}, using default`, {
    fieldName,
    received: value,
    default: defaultVal
  })
  return defaultVal
}

export function extractOptionalBoolean(
  value: unknown,
  fieldName: string,
  defaultVal: boolean = false
): boolean {
  if (typeof value === 'boolean') return value
  logger.warn(`[transformer] Missing or invalid boolean for ${fieldName}, using default`, {
    fieldName,
    received: value,
    default: defaultVal
  })
  return defaultVal
}

export function safeString(value: unknown, context?: string): string {
  if (typeof value === 'string') return value
  usedFallback(context, value, '')
  return ''
}

export function safeNumber(value: unknown, context?: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  usedFallback(context, value, 0)
  return 0
}

export function safeBoolean(value: unknown, context?: string): boolean {
  if (typeof value === 'boolean') return value
  usedFallback(context, value, false)
  return false
}

export function safeArray<ItemType>(value: readonly ItemType[] | ItemType[] | null | undefined): ItemType[] {
  if (Array.isArray(value)) return [...value]
  return []
}

export function convertToTernaryBoolean(
  value: TernaryBoolean | undefined | null,
  defaultValue: TernaryBoolean = 'false'
): TernaryBoolean {
  if (value === 'true' || value === 'false' || value === 'override') return value
  return defaultValue
}

/** Maps stored `booking_mode` (ternary) to domain `BookingMode` for booking transforms. */
export function convertTernaryToBookingMode(
  value: TernaryBoolean | undefined | null,
  defaultVal: BookingMode = 'standalone'
): BookingMode {
  return ternaryToBookingMode(value ?? undefined, defaultVal)
}

export function convertBookingModeToTernary(value: BookingMode | undefined | null): TernaryBoolean {
  return bookingModeToTernary(value)
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
