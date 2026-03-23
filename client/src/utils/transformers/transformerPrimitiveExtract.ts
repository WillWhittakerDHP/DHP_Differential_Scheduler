
import { createLogger } from '@/utils/logger'

const logger = createLogger('transformerPrimitives')

/**
 * Extract optional string; log at warn when falling back so data quality issues are visible.
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
