/**
 */
import { createLogger } from '@/utils/logger'
import { bookingModeToTernary, isTernaryBoolean } from '@shared/utils/ternaryAliasUtils'
import type { TernaryBoolean } from '@/types/ternary'
import { parseDifferentialRole, sanitizeDifferentialEventRoleOverridesInput } from '@shared/utils/differentialRoleUtils'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { DEFAULT_VALUES, FIELD_NAMES } from '@/constants/entityFieldConstants'

const logger = createLogger('apiEntityFieldNormalization')

const DEFAULT_TERNARY: TernaryBoolean = 'false'

function normalizeTernaryStringValue(
  raw: string,
  fieldName: string,
  defaultValue: TernaryBoolean
): TernaryBoolean {
  const bookingAliases = [DEFAULT_VALUES.BOOKING_MODE, 'addOn', 'both'] as const
  if ((bookingAliases as readonly string[]).includes(raw)) {
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
    return normalizeTernaryStringValue(raw, fieldName, defaultValue)
  }
  logger.warn(`[apiEntity] invalid value for ${fieldName}, using default`, {
    received: raw,
    defaultValue,
  })
  return defaultValue
}

/** bookingMode on global blockInstance: always TernaryBoolean after hydration. */
export function normalizeBlockInstanceBookingModeFromApi(raw: unknown): TernaryBoolean {
  return normalizeTernaryBooleanField(raw, FIELD_NAMES.BOOKING_MODE, DEFAULT_TERNARY)
}

export function normalizeBlockInstanceAgentPermissionsFromApi(raw: unknown): TernaryBoolean {
  return normalizeTernaryBooleanField(raw, FIELD_NAMES.AGENT_PERMISSIONS, DEFAULT_TERNARY)
}

export function normalizeBlockInstanceDifferentialFromApi(raw: unknown): TernaryBoolean {
  return normalizeTernaryBooleanField(raw, 'differential', DEFAULT_TERNARY)
}

/** blockInstance.differentialEventRoleOverrides: map eventShape id → role. */
export function normalizeBlockInstanceDifferentialEventRoleOverridesFromApi(
  raw: unknown
): Record<string, DifferentialRole> {
  return sanitizeDifferentialEventRoleOverridesInput(raw)
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
