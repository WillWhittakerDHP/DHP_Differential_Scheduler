/**
 * JSONB organization_defaults on singleton availability_settings (Phase 6.14).
 */
import type { OrganizationDefaults } from '../../../shared/types/organizationDefaults.js'
import { normalizeOrganizationDefaults } from '../../../shared/utils/normalizeOrganizationDefaults.js'
import { AvailabilitySetting } from '../config/app.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('OrganizationDefaultsRepository')

export async function getOrganizationDefaultsData(): Promise<OrganizationDefaults> {
  const row = await AvailabilitySetting.findOne()
  if (!row) {
    logger.debug('No availability_settings row; using factory organization defaults')
    return normalizeOrganizationDefaults(undefined)
  }
  const raw = row.organizationDefaults
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return normalizeOrganizationDefaults(undefined)
  }
  return normalizeOrganizationDefaults(raw as OrganizationDefaults)
}

export async function saveOrganizationDefaultsData(data: OrganizationDefaults): Promise<OrganizationDefaults> {
  const row = await AvailabilitySetting.findOne()
  if (!row) {
    logger.error('Cannot save organization defaults: availability_settings row missing')
    throw new Error('Availability settings must be initialized before saving organization defaults')
  }
  await row.update({
    organizationDefaults: data as Record<string, unknown>,
    updatedAt: new Date(),
  })
  return data
}
