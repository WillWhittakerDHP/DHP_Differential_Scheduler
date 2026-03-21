/**
 * Canonical persistence for wizard display settings (namespace wizard, path document).
 */
import type { Transaction } from 'sequelize'
import type { WizardSettingsData } from '../../../shared/types/wizardSettingsTypes.js'
import { AppSettingEntry } from '../config/app.js'
import { createLogger } from '../utils/logger.js'

const NAMESPACE = 'wizard' as const
const DOCUMENT_PATH = 'document' as const

const DEFAULT: WizardSettingsData = {
  showApplyCoupon: false,
  useBrandColors: false,
}

const logger = createLogger('WizardSettingsRepository')

export async function getWizardSettingsData(): Promise<WizardSettingsData> {
  const row = await AppSettingEntry.findOne({
    where: { namespace: NAMESPACE, path: DOCUMENT_PATH },
  })
  if (row?.valueJsonb && typeof row.valueJsonb === 'object') {
    return { ...DEFAULT, ...(row.valueJsonb as WizardSettingsData) }
  }
  logger.warn('wizard document missing in app_setting_entries; using defaults', {
    namespace: NAMESPACE,
    path: DOCUMENT_PATH,
  })
  return { ...DEFAULT }
}

export async function saveWizardSettingsData(
  data: WizardSettingsData,
  options?: { transaction?: Transaction }
): Promise<WizardSettingsData> {
  const t = options?.transaction
  const merged = { ...DEFAULT, ...data }
  const existing = await AppSettingEntry.findOne({
    where: { namespace: NAMESPACE, path: DOCUMENT_PATH },
    transaction: t,
  })
  const now = new Date()
  if (existing) {
    await existing.update(
      { valueJsonb: merged, schemaVersion: 1, updatedAt: now },
      { transaction: t }
    )
    return merged
  }
  await AppSettingEntry.create(
    {
      namespace: NAMESPACE,
      path: DOCUMENT_PATH,
      valueJsonb: merged,
      schemaVersion: 1,
      updatedAt: now,
    },
    { transaction: t }
  )
  return merged
}
