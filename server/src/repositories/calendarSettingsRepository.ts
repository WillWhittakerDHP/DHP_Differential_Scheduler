/**
 * Relational calendar settings (singleton + calendar_setting_calendars).
 */
import type { Transaction } from 'sequelize'
import type { CalendarSettingsData } from '../../../shared/types/calendarSettingsDocument.js'
import { nilToEmptyArray } from '../../../shared/utils/nilDefaults.js'
import type { CalendarSettingCalendar } from '../db/models/admin/calendar_setting_calendar.js'
import { CalendarSettings, CalendarSettingCalendar as CalendarSettingCalendarModel } from '../config/app.js'
import { sequelize } from '../config/database.js'

function resolveAdminEntryTimeoutRow(
  input: CalendarSettingsData['adminEntryTimeout'] | undefined
): { value: number; unit: 'days' | 'weeks' } {
  if (input === undefined || input === null) {
    return { value: 30, unit: 'days' }
  }
  return {
    value: input.value === undefined || input.value === null ? 30 : input.value,
    unit: input.unit === undefined || input.unit === null ? 'days' : input.unit,
  }
}

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

export async function getCalendarSettings(): Promise<CalendarSettingsData> {
  const row = await CalendarSettings.findOne({
    include: [
      {
        model: CalendarSettingCalendarModel,
        as: 'calendarEntries',
        separate: true,
        order: [['sortOrder', 'ASC']],
      },
    ],
  })
  if (!row) {
    return { ...DEFAULT }
  }
  const rawEntries = (row as { calendarEntries?: CalendarSettingCalendar[] }).calendarEntries
  const entries = nilToEmptyArray(rawEntries)
  return {
    ...DEFAULT,
    enabled: row.enabled,
    provider: row.provider as CalendarSettingsData['provider'],
    holdDurationMinutes: row.holdDurationMinutes,
    holdDurationMin: row.holdDurationMin,
    holdDurationMax: row.holdDurationMax,
    holdDurationFallback: row.holdDurationFallback,
    adminEntryTimeout: {
      value: row.adminEntryTimeoutValue,
      unit: row.adminEntryTimeoutUnit as 'days' | 'weeks',
    },
    autoConfirmEnabled: row.autoConfirmEnabled,
    calendars: entries.map((e) => ({
      email: e.email,
      // @audit-allow:hardcoding:fieldMapping - Calendar entry optional label matches API row shape
      ...(e.label ? { label: e.label } : {}),
      readFrom: e.readFrom,
      writeTo: e.writeTo,
    })),
  }
}

async function persistCalendar(data: CalendarSettingsData, t: Transaction): Promise<CalendarSettingsData> {
  const merged = { ...DEFAULT, ...data }
  const adminTimeout = resolveAdminEntryTimeoutRow(merged.adminEntryTimeout)
  let row = await CalendarSettings.findOne({ transaction: t })
  if (!row) {
    row = await CalendarSettings.create(
      {
        enabled: merged.enabled,
        provider: merged.provider,
        holdDurationMinutes: merged.holdDurationMinutes ?? 15,
        holdDurationMin: merged.holdDurationMin ?? 1,
        holdDurationMax: merged.holdDurationMax ?? 60,
        holdDurationFallback: merged.holdDurationFallback ?? 15,
        adminEntryTimeoutValue: adminTimeout.value,
        adminEntryTimeoutUnit: adminTimeout.unit,
        autoConfirmEnabled: merged.autoConfirmEnabled ?? false,
      },
      { transaction: t }
    )
  } else {
    await row.update(
      {
        enabled: merged.enabled,
        provider: merged.provider,
        holdDurationMinutes: merged.holdDurationMinutes ?? 15,
        holdDurationMin: merged.holdDurationMin ?? 1,
        holdDurationMax: merged.holdDurationMax ?? 60,
        holdDurationFallback: merged.holdDurationFallback ?? 15,
        adminEntryTimeoutValue: adminTimeout.value,
        adminEntryTimeoutUnit: adminTimeout.unit,
        autoConfirmEnabled: merged.autoConfirmEnabled ?? false,
        updatedAt: new Date(),
      },
      { transaction: t }
    )
  }

  // @audit-allow:hardcoding:fieldMapping - Sequelize destroy where matches calendar_setting_calendars FK
  await CalendarSettingCalendarModel.destroy({ where: { calendarSettingsId: row.id }, transaction: t })
  const cals = Array.isArray(merged.calendars) ? merged.calendars : []
  let order = 0
  for (const e of cals) {
    if (!e?.email) continue
    await CalendarSettingCalendarModel.create(
      {
        calendarSettingsId: row.id,
        sortOrder: order++,
        email: String(e.email).trim(),
        label: e.label ?? null,
        readFrom: Boolean(e.readFrom),
        writeTo: Boolean(e.writeTo),
      },
      { transaction: t }
    )
  }

  return merged
}

export async function saveCalendarSettingsData(
  data: CalendarSettingsData,
  options?: { transaction?: Transaction }
): Promise<CalendarSettingsData> {
  if (options?.transaction) {
    return persistCalendar(data, options.transaction)
  }
  return sequelize.transaction(async (t) => persistCalendar(data, t))
}
