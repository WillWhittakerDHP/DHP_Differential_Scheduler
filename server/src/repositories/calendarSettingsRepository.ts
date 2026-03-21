/**
 * Canonical persistence for calendar_settings document (namespace calendar, path document).
 */
import type { Transaction } from 'sequelize'
import type { CalendarSettingsData } from '../../../shared/types/calendarSettingsDocument.js'
import { AppSettingEntry } from '../config/app.js'
import { createLogger } from '../utils/logger.js'

const NAMESPACE = 'calendar' as const
const DOCUMENT_PATH = 'document' as const

const DEFAULT: CalendarSettingsData = {
  enabled: false,
  provider: 'none',
  calendars: [],
  holdDurationMinutes: 15,
  holdDurationMin: 1,
  holdDurationMax: 60,
  holdDurationFallback: 15,
  adminEntryTimeout: { value: 30, unit: 'days' },
  autoConfirmEnabled: false,
}

const logger = createLogger('CalendarSettingsRepository')

export async function getCalendarSettings(): Promise<CalendarSettingsData> {
  const row = await AppSettingEntry.findOne({
    where: { namespace: NAMESPACE, path: DOCUMENT_PATH },
  })
  if (row?.valueJsonb && typeof row.valueJsonb === 'object') {
    return { ...DEFAULT, ...(row.valueJsonb as CalendarSettingsData) }
  }
  logger.warn('calendar document missing in app_setting_entries; using defaults', {
    namespace: NAMESPACE,
    path: DOCUMENT_PATH,
  })
  return { ...DEFAULT }
}

export async function saveCalendarSettingsData(
  data: CalendarSettingsData,
  options?: { transaction?: Transaction }
): Promise<CalendarSettingsData> {
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
