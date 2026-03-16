import { AVAILABILITY_SETTINGS_KEY, defaultAvailabilitySettings } from './businessSettingsConstants.js'

/** Minimal shape for BusinessSettings-like records (settingKey, settingValue, optional autoConfirmEnabled). */
interface BusinessSettingRecord {
  settingKey: string
  settingValue: unknown
  autoConfirmEnabled?: boolean
}

/**
 * WHY: Transform setting to response format
 */
export function transformSettingToResponse(setting: BusinessSettingRecord): { setting_key: string; setting_value: unknown; auto_confirm_enabled?: boolean } {
  const out: { setting_key: string; setting_value: unknown; auto_confirm_enabled?: boolean } = {
    setting_key: setting.settingKey,
    setting_value: setting.settingValue,
  }
  if (typeof setting.autoConfirmEnabled === 'boolean') {
    out.auto_confirm_enabled = setting.autoConfirmEnabled
  }
  return out
}

/** Sync: return setting or default for availability_settings; availability is read from business_settings by the router. */
export function getSettingWithDefault(
  setting: BusinessSettingRecord | null,
  key: string
): { setting_key: string; setting_value: unknown; auto_confirm_enabled?: boolean } | null {
  if (key === AVAILABILITY_SETTINGS_KEY) {
    return {
      setting_key: AVAILABILITY_SETTINGS_KEY,
      setting_value: defaultAvailabilitySettings,
    }
  }
  if (!setting) return null
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
