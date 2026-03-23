import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { DurationRoundingConfig, RoundingMethod } from '@/types/booking/durationRounding'

export type { DurationRoundingConfig, RoundingMethod } from '@/types/booking/durationRounding'

/** Constants for duration rounding method (avoids hardcoded case strings). */
const DURATION_ROUNDING_MODE = {
  ROUND_UP: 'roundUp',
  ROUND_DOWN: 'roundDown',
  ROUND_NEAREST: 'roundNearest',
} as const satisfies Record<string, RoundingMethod>

function roundUp(duration: number, increment: number): number {
  if (duration <= 0) return increment
  return Math.ceil(duration / increment) * increment
}

function roundDown(duration: number, increment: number): number {
  if (duration <= 0) return 0
  return Math.floor(duration / increment) * increment
}

function roundNearest(duration: number, increment: number): number {
  if (duration <= 0) return 0
  return Math.round(duration / increment) * increment
}

/**
PATTERN: Switch statement routing to m...
 */
function applyRoundingMethod(
  duration: number,
  increment: number,
  method: RoundingMethod
): number {
  switch (method) {
    case DURATION_ROUNDING_MODE.ROUND_UP:
      return roundUp(duration, increment)
    case DURATION_ROUNDING_MODE.ROUND_DOWN:
      return roundDown(duration, increment)
    case DURATION_ROUNDING_MODE.ROUND_NEAREST:
      return roundNearest(duration, increment)
    default:
      return roundUp(duration, increment)
  }
}

function getRoundingConfig(settings: AvailabilitySettings | null): DurationRoundingConfig {
  if (!settings?.durationRounding) {
    return {
      enabled: false,
      increment: settings?.minuteIncrement !== undefined && settings?.minuteIncrement !== null ? settings.minuteIncrement : 15,
      method: DURATION_ROUNDING_MODE.ROUND_UP,
    }
  }

  return {
    enabled: settings.durationRounding.enabled,
    increment: settings.durationRounding.increment !== undefined && settings.durationRounding.increment !== null ? settings.durationRounding.increment : (settings.minuteIncrement !== undefined && settings.minuteIncrement !== null ? settings.minuteIncrement : 15),
    method: settings.durationRounding.method !== undefined && settings.durationRounding.method !== null ? settings.durationRounding.method : DURATION_ROUNDING_MODE.ROUND_UP,
  }
}

export function roundDuration(
  duration: number,
  settings: AvailabilitySettings | null
): number {
  const config = getRoundingConfig(settings)
  
  if (!config.enabled) {
    return duration
  }
  
  return applyRoundingMethod(duration, config.increment, config.method)
}
