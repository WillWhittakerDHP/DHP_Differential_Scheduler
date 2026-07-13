/**
 */
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'

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
