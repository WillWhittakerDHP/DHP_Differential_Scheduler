/**
 * API client for wizard_settings (GET /wizard-settings, PUT /wizard-settings).
 */
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type { WizardSettingsData } from './types'

const logger = createLogger('wizardSettings')

export async function getWizardSettings(): Promise<WizardSettingsData> {
  try {
    const response = await apiClient.get('/wizard-settings')
    const raw = response.data?.setting_value
    if (!raw || typeof raw !== 'object') {
      return {}
    }
    return raw as WizardSettingsData
  } catch (error) {
    logger.error('Failed to fetch wizard settings', { error })
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to fetch wizard settings: ${message}`)
  }
}

export function buildWizardPayload(data: WizardSettingsData): { setting_value: WizardSettingsData } {
  return { setting_value: data }
}
