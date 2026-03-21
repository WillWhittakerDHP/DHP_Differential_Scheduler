/**
 * Canonical persistence for availability settings (namespace availability, path document).
 */
import type { Transaction } from 'sequelize'
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import { AppSettingEntry } from '../config/app.js'
import { defaultAvailabilitySettings } from '../routes/internal/businessSettings/businessSettingsConstants.js'
import { createLogger } from '../utils/logger.js'

const NAMESPACE = 'availability' as const
const DOCUMENT_PATH = 'document' as const

const logger = createLogger('AvailabilitySettingsRepository')

export async function getAvailabilitySettingsData(): Promise<AvailabilitySettingsData> {
  const row = await AppSettingEntry.findOne({
    where: { namespace: NAMESPACE, path: DOCUMENT_PATH },
  })
  if (row?.valueJsonb && typeof row.valueJsonb === 'object') {
    return row.valueJsonb as AvailabilitySettingsData
  }
  logger.warn('availability document missing in app_setting_entries; using defaults', {
    namespace: NAMESPACE,
    path: DOCUMENT_PATH,
  })
  return defaultAvailabilitySettings as AvailabilitySettingsData
}

export async function saveAvailabilitySettingsData(
  data: AvailabilitySettingsData,
  options?: { transaction?: Transaction }
): Promise<void> {
  const t = options?.transaction
  const existing = await AppSettingEntry.findOne({
    where: { namespace: NAMESPACE, path: DOCUMENT_PATH },
    transaction: t,
  })
  const now = new Date()
  if (existing) {
    await existing.update(
      { valueJsonb: data, schemaVersion: 1, updatedAt: now },
      { transaction: t }
    )
    return
  }
  await AppSettingEntry.create(
    {
      namespace: NAMESPACE,
      path: DOCUMENT_PATH,
      valueJsonb: data,
      schemaVersion: 1,
      updatedAt: now,
    },
    { transaction: t }
  )
}
