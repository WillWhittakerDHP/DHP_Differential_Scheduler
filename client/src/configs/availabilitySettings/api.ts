/**
 * API client, caching, and payload builders for availability settings.
 */
import type { BusinessHoursConfig } from '@shared/types/availabilityTypes'
import { toGlobalEntityId } from '@/utils/globalEntity'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type { AvailabilitySettings, RawAvailabilitySettings } from './types'
import { ensureRangeConstraintCategory } from './constraints'

const logger = createLogger('availabilitySettings')

interface CacheEntry {
  settings: AvailabilitySettings
  cachedAt: number
}

let cachedSettings: CacheEntry | null = null

const DEFAULT_CACHE_TTL_MINUTES = 5
const CACHE_TTL_MS = import.meta.env.VITE_AVAILABILITY_CACHE_TTL
  ? Number(import.meta.env.VITE_AVAILABILITY_CACHE_TTL)
  : DEFAULT_CACHE_TTL_MINUTES * 60 * 1000

function isCacheValid(): boolean {
  if (!cachedSettings) return false
  const age = Date.now() - cachedSettings.cachedAt
  const isValid = age < CACHE_TTL_MS
  if (!isValid) {
    logger.debug('Cache expired', {
      age: `${(age / 1000).toFixed(0)}s`,
      ttl: `${(CACHE_TTL_MS / 1000).toFixed(0)}s`,
    })
  }
  return isValid
}

export async function getAvailabilitySettings(): Promise<AvailabilitySettings> {
  if (cachedSettings && isCacheValid()) {
    return cachedSettings.settings
  }

  try {
    const response = await apiClient.get('/business-settings/availability_settings')

    if (response.data && response.data.setting_value) {
      const rawSettings = response.data.setting_value as RawAvailabilitySettings

      if (!rawSettings.rangeConstraints?.businessHours) {
        throw new Error('rangeConstraints.businessHours is required')
      }
      if (!rawSettings.minuteIncrement) {
        throw new Error('minuteIncrement is required')
      }

      const businessHoursConfig = rawSettings.rangeConstraints.businessHours.config as BusinessHoursConfig
      const businessHours = businessHoursConfig.hours
      const rangeConstraints = ensureRangeConstraintCategory(rawSettings.rangeConstraints)

      const convertedSettings: AvailabilitySettings = {
        businessHours,
        minuteIncrement: rawSettings.minuteIncrement,
        rangeConstraints,
        buffers: rawSettings.buffers,
        maxWorkHours: rawSettings.maxWorkHours,
        maxIncome: rawSettings.maxIncome,
        timezone: rawSettings.timezone,
        durationRounding: rawSettings.durationRounding,
        differentialPerspectives: rawSettings.differentialPerspectives
          ? {
              ...rawSettings.differentialPerspectives,
              majorAttendees: rawSettings.differentialPerspectives.majorAttendees?.map(toGlobalEntityId),
              minorAttendees: rawSettings.differentialPerspectives.minorAttendees?.map(toGlobalEntityId),
            }
          : undefined,
        calendarConfig: rawSettings.calendarConfig,
        defaultLocation: rawSettings.defaultLocation,
        overlapSources: rawSettings.overlapSources,
      }

      cachedSettings = {
        settings: convertedSettings,
        cachedAt: Date.now(),
      }

      return convertedSettings
    }

    throw new Error('Invalid API response: missing setting_value or required fields')
  } catch (error) {
    logger.error('Failed to fetch settings from API', { error })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to fetch availability settings: ${errorMessage}`)
  }
}

export function invalidateAvailabilitySettingsCache(): void {
  if (cachedSettings) {
    logger.info('Cache invalidated manually')
    cachedSettings = null
  }
}

/**
 * Build the PUT payload for saving availability settings.
 */
export function buildAvailabilityPayload(
  formData: AvailabilitySettings,
  autoConfirmEnabled: boolean
): { setting_value: Record<string, unknown>; auto_confirm_enabled: boolean } {
  const settingsToSave: Record<string, unknown> = {
    businessHours: formData.businessHours,
    minuteIncrement: formData.minuteIncrement,
  }

  if (formData.rangeConstraints) {
    const rc = { ...formData.rangeConstraints }
    const bhConstraint = rc.businessHours
    if (bhConstraint && bhConstraint.config && 'hours' in bhConstraint.config) {
      (bhConstraint.config as BusinessHoursConfig).hours = formData.businessHours
    }
    settingsToSave.rangeConstraints = rc
  } else {
    settingsToSave.rangeConstraints = {
      businessHours: {
        category: 'range' as const,
        type: 'businessHours' as const,
        enforcement: 'hard' as const,
        config: { hours: formData.businessHours },
      },
    }
  }

  if (formData.buffers) settingsToSave.buffers = formData.buffers
  if (formData.overlapSources) settingsToSave.overlapSources = formData.overlapSources
  if (formData.maxWorkHours) settingsToSave.maxWorkHours = formData.maxWorkHours
  if (formData.timezone) settingsToSave.timezone = formData.timezone
  if (formData.durationRounding) settingsToSave.durationRounding = formData.durationRounding
  if (formData.differentialPerspectives) settingsToSave.differentialPerspectives = formData.differentialPerspectives
  if (formData.calendarConfig) settingsToSave.calendarConfig = formData.calendarConfig
  if (formData.defaultLocation) settingsToSave.defaultLocation = formData.defaultLocation

  return { setting_value: settingsToSave, auto_confirm_enabled: autoConfirmEnabled }
}
