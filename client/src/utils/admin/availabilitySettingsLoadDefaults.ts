/**
 * WHY: Normalize API-loaded availability document with required nested defaults (mutates in place).
 */

import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { DEFAULT_DRIVE_TIME_FEE_CONFIG } from '@/utils/booking/computeDriveTimeFee'

export function applyAvailabilitySettingsLoadDefaults(settings: AvailabilitySettings): void {
  if (!settings.durationRounding) {
    settings.durationRounding = {
      enabled: false,
      increment: settings.minuteIncrement || 15,
      method: 'roundUp',
    }
  }
  if (!settings.driveTimeFee) {
    settings.driveTimeFee = { ...DEFAULT_DRIVE_TIME_FEE_CONFIG }
  }
}
