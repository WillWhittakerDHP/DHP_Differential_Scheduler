/**
 * Duration Rounding Utility
 * 
 */

import type { AvailabilitySettings } from '@/configs/availabilitySettings'

/**
 * Rounding method type
 */
export type RoundingMethod = 'roundUp' | 'roundDown' | 'roundNearest'

/**
 * Duration rounding configuration
 */
export interface DurationRoundingConfig {
  enabled: boolean
  increment: number  // Minutes (defaults to minuteIncrement from settings)
  method: RoundingMethod
}

/**
 * Round duration up to nearest increment
 * 
 * @param duration - Duration in minutes
 * @param increment - Increment in minutes
 * @returns Duration rounded up to nearest increment
 */
function roundUp(duration: number, increment: number): number {
  if (duration <= 0) return increment
  return Math.ceil(duration / increment) * increment
}

/**
 * Round duration down to nearest increment
 * 
 * @param duration - Duration in minutes
 * @param increment - Increment in minutes
 * @returns Duration rounded down to nearest increment
 */
function roundDown(duration: number, increment: number): number {
  if (duration <= 0) return 0
  return Math.floor(duration / increment) * increment
}

/**
 * Round duration to nearest increment
 * 
 * @param duration - Duration in minutes
 * @param increment - Increment in minutes
 * @returns Duration rounded to nearest increment
 */
function roundNearest(duration: number, increment: number): number {
  if (duration <= 0) return 0
  return Math.round(duration / increment) * increment
}

/**
 * PATTERN: Apply rounding method to duration
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

/**
 * Round duration based on availability settings
 * 
 * @param duration - Duration in minutes to round
 * @param settings - Availability settings (may be null)
 * @returns Rounded duration if rounding enabled, original duration if disabled
 * 
 * @example
 * ```typescript
 * // Rounding disabled (default)
 * roundDuration(37, settings) // Returns 37
 * 
 * // Rounding enabled, round up, 15-minute increment
 * roundDuration(37, { durationRounding: { enabled: true, increment: 15, method: 'roundUp' } })
 * // Returns 45
 * 
 * // Rounding enabled, round down, 15-minute increment
 * roundDuration(37, { durationRounding: { enabled: true, increment: 15, method: 'roundDown' } })
 * // Returns 30
 * 
 * // Rounding enabled, round nearest, 15-minute increment
 * roundDuration(37, { durationRounding: { enabled: true, increment: 15, method: 'roundNearest' } })
 * // Returns 45 (37 is closer to 45 than 30)
 * ```
 */
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
