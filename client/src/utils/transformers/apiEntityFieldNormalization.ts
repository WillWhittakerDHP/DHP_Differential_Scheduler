/**
 * WHY: Coerce API payloads into global entity storage shapes (ternary_boolean strings, etc.).
 */
import { createLogger } from '@/utils/logger'
import { bookingModeToTernary, isTernaryBoolean } from '@shared/utils/ternaryAliasUtils'
import type { TernaryBoolean } from '@/types/ternary'
import { parseDifferentialRole } from '@shared/utils/differentialRoleUtils'
import type { DifferentialRole } from '@shared/types/differentialRole'

const logger = createLogger('apiEntityFieldNormalization')

const DEFAULT_TERNARY: TernaryBoolean = 'false'

function normalizeTernaryBooleanField(
  raw: unknown,
  fieldName: string,
  defaultValue: TernaryBoolean = DEFAULT_TERNARY
): TernaryBoolean {
  if (isTernaryBoolean(raw)) {
    return raw
  }
  if (raw === true) {
    logger.warn(`[apiEntity] coerced boolean to ternary for ${fieldName}`, { received: raw })
    return 'true'
  }
  if (raw === false) {
    logger.warn(`[apiEntity] coerced boolean to ternary for ${fieldName}`, { received: raw })
    return 'false'
  }
  if (raw === undefined || raw === null || raw === '') {
    return defaultValue
  }
  if (typeof raw === 'string') {
    if (raw === 'standalone' || raw === 'addOn' || raw === 'both') {
      const t = bookingModeToTernary(raw)
      logger.warn(`[apiEntity] coerced domain bookingMode string to ternary for ${fieldName}`, {
        received: raw,
        result: t,
      })
      return t
    }
    if (isTernaryBoolean(raw)) {
      return raw
    }
    logger.warn(`[apiEntity] unknown string for ${fieldName}, using default`, {
      received: raw,
      defaultValue,
    })
    return defaultValue
  }
  logger.warn(`[apiEntity] invalid value for ${fieldName}, using default`, {
    received: raw,
    defaultValue,
  })
  return defaultValue
}

/** bookingMode on global blockInstance: always TernaryBoolean after hydration. */
export function normalizeBlockInstanceBookingModeFromApi(raw: unknown): TernaryBoolean {
  return normalizeTernaryBooleanField(raw, 'bookingMode', DEFAULT_TERNARY)
}

export function normalizeBlockInstanceAgentPermissionsFromApi(raw: unknown): TernaryBoolean {
  return normalizeTernaryBooleanField(raw, 'agentPermissions', DEFAULT_TERNARY)
}

export function normalizeBlockInstanceDifferentialFromApi(raw: unknown): TernaryBoolean {
  return normalizeTernaryBooleanField(raw, 'differential', DEFAULT_TERNARY)
}

/** eventShape.differentialRole: DifferentialRole (none when API sent null/omit). */
export function normalizeEventShapeDifferentialRoleFromApi(raw: unknown): DifferentialRole {
  const parsed = parseDifferentialRole(raw)
  if (
    raw !== undefined &&
    raw !== null &&
    raw !== '' &&
    !isDifferentialRoleStorageLoose(raw) &&
    parsed === 'none'
  ) {
    logger.warn('[apiEntity] invalid differentialRole from API, using none', { received: raw })
  }
  return parsed
}

function isDifferentialRoleStorageLoose(raw: unknown): boolean {
  return raw === 'major' || raw === 'minor' || raw === 'moveable'
}
