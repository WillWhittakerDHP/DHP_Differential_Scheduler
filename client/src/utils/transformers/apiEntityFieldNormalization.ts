/**
 */
import { createLogger } from '@/utils/logger'
import { bookingModeToTernary, isTernaryBoolean } from '@shared/utils/ternaryAliasUtils'
import type { TernaryBoolean } from '@/types/ternary'
import { DEFAULT_VALUES, FIELD_NAMES } from '@/constants/entityFieldConstants'

const logger = createLogger('apiEntityFieldNormalization')

const DEFAULT_TERNARY: TernaryBoolean = 'false'

function normalizeTernaryStringValue(
  raw: string,
  fieldName: string,
  defaultValue: TernaryBoolean
): TernaryBoolean {
  const bookingAliases = ['standalone', 'addOn', 'both'] as const
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

function normalizeBooleanFieldWithDefault(raw: unknown, defaultValue: boolean): boolean {
  if (raw === true || raw === 'true') {
    return true
  }
  if (raw === false || raw === 'false') {
    return false
  }
  return defaultValue
}

export function normalizeBlockInstanceOrchestratorFromApi(raw: unknown): boolean {
  return normalizeBooleanFieldWithDefault(raw, DEFAULT_VALUES.ORCHESTRATOR)
}

export function normalizeBlockInstanceWizardVisibleFromApi(raw: unknown): boolean {
  return normalizeBooleanFieldWithDefault(raw, DEFAULT_VALUES.WIZARD_VISIBLE)
}

export function normalizeBlockInstanceAgentPermissionsFromApi(raw: unknown): TernaryBoolean {
  return normalizeTernaryBooleanField(raw, FIELD_NAMES.AGENT_PERMISSIONS, DEFAULT_TERNARY)
}
