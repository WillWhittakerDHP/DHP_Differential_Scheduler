/**
 * JSONB organization_defaults on singleton availability_settings (Phase 6.14).
 */
import type { OrganizationDefaults } from '../../../shared/types/organizationDefaults.js'
import { normalizeOrganizationDefaults } from '../../../shared/utils/normalizeOrganizationDefaults.js'
import { AvailabilitySetting } from '../config/app.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('OrganizationDefaultsRepository')

/**
 * JSON round-trip yields a plain tree (no Sequelize attribute branding) for JSONB / normalize.
 * Intermediate `unknown` is a single narrowing step — not `as unknown as Target`.
 */
function jsonRoundTripUnknown(value: object): unknown {
  return JSON.parse(JSON.stringify(value))
}

function organizationDefaultsToJsonbRecord(data: OrganizationDefaults): Record<string, unknown> {
  const plain: unknown = jsonRoundTripUnknown(data)
  return plain as Record<string, unknown>
}

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
  const plain: unknown = jsonRoundTripUnknown(raw)
  return normalizeOrganizationDefaults(plain as OrganizationDefaults)
}

export async function saveOrganizationDefaultsData(data: OrganizationDefaults): Promise<OrganizationDefaults> {
  const row = await AvailabilitySetting.findOne()
  if (!row) {
    logger.error('Cannot save organization defaults: availability_settings row missing')
    throw new Error('Availability settings must be initialized before saving organization defaults')
  }
  await row.update({
    organizationDefaults: organizationDefaultsToJsonbRecord(data),
    updatedAt: new Date(),
  })
  return data
}
