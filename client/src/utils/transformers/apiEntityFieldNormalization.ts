/**
 */
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { resolveWizardPlacement, type WizardPlacement } from '@shared/constants/wizardPlacement'

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

/**
 * Coalesce the API value into a concrete placement. Accepts the new enum, and tolerates
 * the legacy boolean (`wizard_visible`) during the migration window.
 */
export function normalizeBlockInstanceWizardPlacementFromApi(raw: unknown): WizardPlacement {
  return resolveWizardPlacement(raw)
}
