
import { AVAILABILITY_SETTINGS_KEY, defaultAvailabilitySettings } from './businessSettingsConstants.js'

/** Minimal shape for BusinessSettings-like records (settingKey, settingValue). */
interface BusinessSettingRecord {
  settingKey: string
  settingValue: unknown
}

/**
 * WHY: Transform setting to response format
LEARNING: Transforms BusinessSettin...
 */
export function transformSettingToResponse(setting: BusinessSettingRecord): { setting_key: string; setting_value: unknown } {
  return {
    setting_key: setting.settingKey,
    setting_value: setting.settingValue,
  }
}

export function getSettingWithDefault(
  setting: BusinessSettingRecord | null,
  key: string
): { setting_key: string; setting_value: unknown } | null {
  if (!setting) {
    if (key === AVAILABILITY_SETTINGS_KEY) {
      return {
        setting_key: AVAILABILITY_SETTINGS_KEY,
        setting_value: defaultAvailabilitySettings,
      }
    }
    return null
  }

  return transformSettingToResponse(setting)
}

export function mergeSettingValues(existingValue: unknown, newValue: unknown): unknown {
  const existing = (typeof existingValue === 'object' && existingValue !== null ? existingValue : {}) as Record<string, unknown>
  const next = (typeof newValue === 'object' && newValue !== null ? newValue : {}) as Record<string, unknown>
  return {
    ...existing,
    ...next,
  }
}
