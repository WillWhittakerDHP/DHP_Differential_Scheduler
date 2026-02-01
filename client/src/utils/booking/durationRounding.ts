/**
 * Duration Rounding Utility
 * 
 * LEARNING: Centralized rounding logic for duration calculations
 * WHY: Provides configurable rounding with multiple methods (round up, round down, round nearest)
 * PATTERN: Pure functions that apply rounding based on configuration
 */

import type { AvailabilitySettings } from '@/configs/availabilitySettings'

/**
 * Rounding method type
 * LEARNING: Defines how durations should be rounded
 * WHY: Supports different rounding strategies (round up, round down, round nearest)
 * PATTERN: String literal union type
 */
export type RoundingMethod = 'roundUp' | 'roundDown' | 'roundNearest'

/**
 * Duration rounding configuration
 * LEARNING: Configuration for duration rounding behavior
 * WHY: Allows admin to control rounding via Business Controls tab
 * PATTERN: Interface with enabled flag, increment, and method
 */
export interface DurationRoundingConfig {
  enabled: boolean
  increment: number  // Minutes (defaults to minuteIncrement from settings)
  method: RoundingMethod
}

/**
 * Round duration up to nearest increment
 * LEARNING: Ceiling function for time durations
 * WHY: Rounds up to ensure durations don't fall short
 * PATTERN: Use Math.ceil to round up, then multiply by increment
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
 * LEARNING: Floor function for time durations
 * WHY: Rounds down to ensure durations don't exceed
 * PATTERN: Use Math.floor to round down, then multiply by increment
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
 * LEARNING: Standard rounding function for time durations
 * WHY: Rounds to closest increment (halfway rounds up)
 * PATTERN: Use Math.round to round to nearest, then multiply by increment
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
 * Apply rounding method to duration
 * LEARNING: Routes to appropriate rounding function based on method
 * WHY: Centralizes rounding logic selection
 * PATTERN: Switch statement routing to method-specific functions
 * 
 * @param duration - Duration in minutes
 * @param increment - Increment in minutes
 * @param method - Rounding method to apply
 * @returns Rounded duration
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
      increment: settings?.minuteIncrement || 15,
      method: 'roundUp'
    }
  }
  
  return {
    enabled: settings.durationRounding.enabled,
    increment: settings.durationRounding.increment || settings.minuteIncrement || 15,
    method: settings.durationRounding.method || 'roundUp'
  }
}

/**
 * Round duration based on availability settings
 * LEARNING: Main entry point for duration rounding
 * WHY: Centralizes all rounding logic, respects settings configuration
 * PATTERN: Check if rounding enabled, apply method if enabled, return original if disabled
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
