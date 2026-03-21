/**
 * Single source for calendar_settings (singleton row). Used by computedAvailabilityService and appointmentHelpers.
 */
import type { CalendarSettingsData } from '../db/models/admin/calendar_settings.js';
import { CalendarSettings } from '../config/app.js';

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
};

export async function getCalendarSettings(): Promise<CalendarSettingsData> {
  const row = await CalendarSettings.findOne();
  if (!row?.settingValue) return DEFAULT;
  return { ...DEFAULT, ...(row.settingValue as CalendarSettingsData) };
}
