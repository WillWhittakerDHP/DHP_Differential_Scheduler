/**
 * PATTERN: useDurationRounding Composable

PATTERN: Composable that reads from avai...
 */
import { computed, type ComputedRef } from 'vue'
import { roundDuration as roundDurationUtil, type DurationRoundingConfig } from '@/utils/booking/durationRounding'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

export interface UseDurationRoundingReturn {
  roundDuration: (duration: number) => number
  
  isRoundingEnabled: ComputedRef<boolean>
  
  roundingConfig: ComputedRef<DurationRoundingConfig | null>
}

/**
 * WHY: useDurationRounding composable

WHY: Extracts rounding logic to composab...
 */
export function useDurationRounding(): UseDurationRoundingReturn {
  const { settings } = useAvailabilitySettings()
  
  /**
   * PATTERN: Computed property that extracts config from settings
   */
  const roundingConfig = computed<DurationRoundingConfig | null>(() => {
    if (!settings.value) return null
    
    const config = settings.value.durationRounding
    if (!config) {
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
   * PATTERN: Computed property that checks config enabled state
   */
  const isRoundingEnabled = computed<boolean>(() => {
    return roundingConfig.value?.enabled ?? false
  })
  
  const roundDuration = (duration: number): number => {
    return roundDurationUtil(duration, settings.value)
  }
  
  return {
    roundDuration,
    isRoundingEnabled,
    roundingConfig
  }
}
