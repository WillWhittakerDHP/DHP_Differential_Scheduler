/**
 * Transformer Primitives
 *
 * LEARNING: Typed safe-extraction at the API boundary.
 * WHY: Replaces scattered ?? '' / ?? 0 / ?? [] fallbacks with explicit, observable behavior.
 * PATTERN: Accept unknown, use type guards, optional context for debug logging when fallback is used.
 */

import { createLogger } from '@/utils/logger'
import type { TernaryBoolean } from '@/types/ternary'

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

/**
 * Extract optional number; log at warn when falling back.
 */
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

/**
 * Extract optional boolean; log at warn when falling back.
 */
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

/**
 * Safely extract a string value.
 * Returns '' for null, undefined, or non-string types.
 */
export function safeString(value: unknown, context?: string): string {
  if (typeof value === 'string') return value
  usedFallback(context, value, '')
  return ''
}

/**
 * Safely extract a number value.
 * Returns 0 for null, undefined, NaN, or non-number types.
 */
export function safeNumber(value: unknown, context?: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  usedFallback(context, value, 0)
  return 0
}

/**
 * Safely extract a boolean value.
 * Returns false for null, undefined, or non-boolean types.
 */
export function safeBoolean(value: unknown, context?: string): boolean {
  if (typeof value === 'boolean') return value
  usedFallback(context, value, false)
  return false
}

/**
 * Safely extract an array. Ensures result is a mutable array.
 * Returns [] for null, undefined, or non-array types.
 * Accepts readonly arrays (e.g. from as const) and returns a mutable copy.
 */
export function safeArray<ItemType>(value: readonly ItemType[] | ItemType[] | null | undefined): ItemType[] {
  if (Array.isArray(value)) return [...value]
  return []
}

/**
 * Convert boolean or TernaryBoolean to TernaryBoolean (canonical for transformers).
 * LEARNING: Backward compatibility for legacy boolean values from API/versions.
 */
export function convertToTernaryBoolean(
  value: TernaryBoolean | boolean | undefined,
  defaultValue: TernaryBoolean = 'false'
): TernaryBoolean {
  if (value === true) return 'true'
  if (value === false) return 'false'
  if (value === 'true' || value === 'false' || value === 'override') return value
  return defaultValue
}

/**
 * Safely extract an ID string (non-empty) or null.
 * Returns null for null, undefined, empty string, or non-string types.
 */
export function safeId(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

/**
 * Normalize a primitive value before save: trim strings, empty string to undefined, normalize numbers.
 * Used at the single save choke point (saveRegularField) so all primitive field values are scrubbed in one place.
 * WHY: Avoids persisting leading/trailing spaces; normalizes numeric strings from inputs.
 */
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
