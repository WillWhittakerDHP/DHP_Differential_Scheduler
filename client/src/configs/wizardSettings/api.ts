/**
 * API client for wizard_settings (GET /wizard-settings, PUT /wizard-settings).
 */
import apiClient from '@/utils/api'
import { CSRF_HEADER_NAME, readCsrfTokenFromDocumentCookie } from '@/utils/api/csrfClient'
import { createLogger } from '@/utils/logger'
import type { WizardSettingsData } from './types'

const logger = createLogger('wizardSettings')

const WIZARD_API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1/internal'

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

/**
 * POST multipart logo to `/wizard-settings/logo` (field `file`). Uses `fetch` so default JSON
 * Content-Type does not override multipart boundaries.
 */
export async function uploadWizardLogo(file: File): Promise<WizardSettingsData> {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const headers: Record<string, string> = {}
    const csrf = readCsrfTokenFromDocumentCookie()
    if (csrf !== null && csrf !== '') {
      headers[CSRF_HEADER_NAME] = csrf
    }
    const response = await fetch(`${WIZARD_API_BASE}/wizard-settings/logo`, {
      method: 'POST',
      headers,
      body: formData,
      // Align with axios apiClient `withCredentials` so session cookie is sent (incl. cross-origin API base).
      credentials: 'include',
    })
    if (!response.ok) {
      const text = await response.text()
      let detail = response.statusText
      try {
        const parsed = JSON.parse(text) as { error?: string; message?: string }
        if (parsed.error) {
          detail = parsed.error
        } else if (parsed.message) {
          detail = parsed.message
        }
      } catch (parseErr: unknown) {
        logger.debug('Logo upload error body was not JSON', { parseErr, textSnippet: text.slice(0, 200) })
        if (text) {
          detail = text
        }
      }
      logger.error('Wizard logo upload failed', { status: response.status, detail })
      throw new Error(`Logo upload failed: ${detail}`)
    }
    const json = (await response.json()) as { setting_value?: WizardSettingsData }
    const raw = json.setting_value
    if (!raw || typeof raw !== 'object') {
      logger.warn('Logo upload response missing setting_value')
      throw new Error('Logo upload returned invalid response')
    }
    return raw
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Logo upload')) {
      throw error
    }
    logger.error('Wizard logo upload request failed', { error })
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Logo upload failed: ${message}`)
  }
}
