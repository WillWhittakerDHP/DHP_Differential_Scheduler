import { getCalendarSettings } from '../../../repositories/calendarSettingsRepository.js'
import { createLogger } from '../../../utils/logger.js'
import type { CalendarSettingsData } from '../../../db/models/admin/calendar_settings.js'
import type { AdminEntryTimeout } from '../../../../../shared/types/calendarTypes.js'

const logger = createLogger('AppointmentRouter')

const HOLD_DURATION_MIN_FALLBACK = 1
const HOLD_DURATION_MAX_FALLBACK = 60
const HOLD_DURATION_VALUE_FALLBACK = 15

export interface HoldDurationBounds {
  min: number
  max: number
  fallback: number
}

/** Derive bounds from calendar settings (sync; no DB). */
function holdDurationBoundsFromCalendarData(data: CalendarSettingsData): HoldDurationBounds {
  const minRaw = data.holdDurationMin
  const maxRaw = data.holdDurationMax
  const fallbackRaw = data.holdDurationFallback
  const min = typeof minRaw === 'number' && !Number.isNaN(minRaw) ? Math.floor(minRaw) : HOLD_DURATION_MIN_FALLBACK
  const max = typeof maxRaw === 'number' && !Number.isNaN(maxRaw) ? Math.floor(maxRaw) : HOLD_DURATION_MAX_FALLBACK
  const fallback = typeof fallbackRaw === 'number' && !Number.isNaN(fallbackRaw) ? Math.floor(fallbackRaw) : HOLD_DURATION_VALUE_FALLBACK
  const clampedFallback = Math.min(max, Math.max(min, fallback))
  return { min, max, fallback: clampedFallback }
}

/** Hold duration bounds and default in one read. */
export async function getHoldDurationFromSettings(): Promise<{ bounds: HoldDurationBounds; defaultMinutes: number }> {
  const data = await getCalendarSettings()
  const bounds = holdDurationBoundsFromCalendarData(data)
  const raw = data.holdDurationMinutes
  const parsed = typeof raw === 'number' && !Number.isNaN(raw) ? Math.floor(raw) : bounds.fallback
  const defaultMinutes = Math.min(bounds.max, Math.max(bounds.min, parsed))
  return { bounds, defaultMinutes }
}

const DEFAULT_ADMIN_ENTRY_TIMEOUT: AdminEntryTimeout = { value: 30, unit: 'days' }

/** Admin entry dropdown time-out from calendar_settings. */
export async function getAdminEntryTimeoutFromSettings(): Promise<AdminEntryTimeout> {
  const data = await getCalendarSettings()
  const raw = data.adminEntryTimeout
  if (raw && typeof raw.value === 'number' && !Number.isNaN(raw.value) && (raw.unit === 'days' || raw.unit === 'weeks')) {
    const value = Math.max(1, Math.min(365, Math.floor(raw.value)))
    return { value, unit: raw.unit }
  }
  return DEFAULT_ADMIN_ENTRY_TIMEOUT
}

/** Whether to auto-confirm appointments (from calendar_settings). */
export async function getAutoConfirmEnabledFromSettings(): Promise<boolean> {
  const data = await getCalendarSettings()
  return data.autoConfirmEnabled === true
}

function findWriteToCalendarEmail(calendars: Array<{ email?: string; writeTo?: boolean }>): string | undefined {
  const entry = calendars.find(e => e.writeTo && e.email?.trim())
  return entry?.email?.trim()
}

/** Email of the calendar configured for write operations, or undefined if none. */
export async function getWriteToCalendarFromSettings(): Promise<string | undefined> {
  try {
    const data = await getCalendarSettings()
    if (!data.enabled || !Array.isArray(data.calendars)) {
      logger.debug('Calendar integration not enabled or invalid config')
      return undefined
    }
    const email = findWriteToCalendarEmail(data.calendars)
    if (email) {
      logger.debug('Found writeTo calendar', { email })
      return email
    }
    logger.debug('No writeTo calendar configured')
    return undefined
  } catch (error) {
    logger.error('Error reading writeTo calendar from settings', { error })
    return undefined
  }
}
