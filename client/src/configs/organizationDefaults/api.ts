/**
 * API client for organization_defaults (GET/PUT /organization-defaults).
 */
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type { OrganizationDefaults } from '@shared/types/organizationDefaults'

const logger = createLogger('organizationDefaultsApi')

export async function getOrganizationDefaults(): Promise<OrganizationDefaults> {
  try {
    const response = await apiClient.get('/organization-defaults')
    const raw = response.data?.setting_value
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid API response: missing setting_value')
    }
    return raw as OrganizationDefaults
  } catch (error) {
    logger.error('Failed to fetch organization defaults', { error })
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to fetch organization defaults: ${message}`)
  }
}

export function buildOrganizationDefaultsPayload(data: OrganizationDefaults): { setting_value: OrganizationDefaults } {
  return { setting_value: data }
}
