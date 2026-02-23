
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

export type RoundingMethod = 'roundUp' | 'roundDown' | 'roundNearest'

export interface DurationRoundingConfig {
  enabled: boolean
  increment: number  // Minutes (defaults to minuteIncrement from settings)
  method: RoundingMethod
}

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
    case 'roundUp':
      return roundUp(duration, increment)
    case 'roundDown':
      return roundDown(duration, increment)
    case 'roundNearest':
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
      method: 'roundUp'
    }
  }
  
  return {
    enabled: settings.durationRounding.enabled,
    increment: settings.durationRounding.increment !== undefined && settings.durationRounding.increment !== null ? settings.durationRounding.increment : (settings.minuteIncrement !== undefined && settings.minuteIncrement !== null ? settings.minuteIncrement : 15),
    method: settings.durationRounding.method !== undefined && settings.durationRounding.method !== null ? settings.durationRounding.method : 'roundUp'
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
