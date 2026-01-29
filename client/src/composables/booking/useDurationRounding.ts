/**
 * useDurationRounding Composable
 * 
 * LEARNING: Provides reactive duration rounding based on availability settings
 * WHY: Centralizes rounding logic with reactive settings integration
 * PATTERN: Composable that reads from availability settings and provides rounding function
 */

import { computed, type ComputedRef } from 'vue'
import { roundDuration as roundDurationUtil, type DurationRoundingConfig } from '@/utils/booking/durationRounding'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

/**
 * useDurationRounding composable return type
 */
export interface UseDurationRoundingReturn {
  /**
   * Round duration based on current availability settings
   * LEARNING: Reactive rounding function that respects current settings
   * WHY: Provides easy-to-use rounding that updates when settings change
   */
  roundDuration: (duration: number) => number
  
  /**
   * Whether rounding is currently enabled
   * LEARNING: Reactive computed property indicating rounding state
   * WHY: Allows components to conditionally display rounding information
   */
  isRoundingEnabled: ComputedRef<boolean>
  
  /**
   * Current rounding configuration
   * LEARNING: Reactive computed property with current rounding config
   * WHY: Allows components to display rounding settings
   */
  roundingConfig: ComputedRef<DurationRoundingConfig | null>
}

/**
 * useDurationRounding composable
 * 
 * LEARNING: Provides reactive duration rounding based on availability settings
 * WHY: Extracts rounding logic to composable, ensures reactivity with settings changes
 * PATTERN: Composable that uses useAvailabilitySettings and provides rounding function
 */
export function useDurationRounding(): UseDurationRoundingReturn {
  const { settings } = useAvailabilitySettings()
  
  /**
   * LEARNING: Get current rounding configuration
   * WHY: Provides reactive access to rounding config
   * PATTERN: Computed property that extracts config from settings
   */
  const roundingConfig = computed<DurationRoundingConfig | null>(() => {
    if (!settings.value) return null
    
    const config = settings.value.durationRounding
    if (!config) {
      // Return default config (disabled)
      return {
        enabled: false,
        increment: settings.value.minuteIncrement || 15,
        method: 'roundUp'
      }
    }
    
    return {
      enabled: config.enabled,
      increment: config.increment || settings.value.minuteIncrement || 15,
      method: config.method || 'roundUp'
    }
  })
  
  /**
   * LEARNING: Check if rounding is enabled
   * WHY: Provides reactive boolean for conditional logic
   * PATTERN: Computed property that checks config enabled state
   */
  const isRoundingEnabled = computed<boolean>(() => {
    return roundingConfig.value?.enabled ?? false
  })
  
  /**
   * LEARNING: Round duration using current settings
   * WHY: Provides reactive rounding function that updates when settings change
   * PATTERN: Function that calls utility with current settings value
   * 
   * @param duration - Duration in minutes to round
   * @returns Rounded duration if rounding enabled, original duration if disabled
   */
  const roundDuration = (duration: number): number => {
    return roundDurationUtil(duration, settings.value)
  }
  
  return {
    roundDuration,
    isRoundingEnabled,
    roundingConfig
  }
}
