/**
 * Shared Availability Settings Composable
 * 
 * LEARNING: Provides shared availability settings to avoid redundant fetching
 * WHY: Multiple composables fetch the same settings, causing redundant API calls
 * PATTERN: Composable that can be used with provide/inject or passed as parameter
 * 
 * P2-1: Created to reduce redundant settings fetching across composables
 * 
 * Usage:
 * 1. In parent component (e.g., BookingWizard):
 *    const settings = useAvailabilitySettings()
 *    provide('availabilitySettings', settings)
 * 
 * 2. In child composables:
 *    const settings = inject<ReturnType<typeof useAvailabilitySettings>>('availabilitySettings')
 *    // Or pass as parameter if composable supports it
 * 
 * NOTE: getAvailabilitySettings() already has caching, but this provides
 * a reactive shared instance that can be provided/injected for better coordination.
 */

import { ref, computed, watchEffect, type Ref, type ComputedRef } from 'vue'
import { getAvailabilitySettings, type AvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAvailabilitySettings')

export interface UseAvailabilitySettingsReturn {
  settings: ComputedRef<AvailabilitySettings | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  hasError: ComputedRef<boolean>
  refresh: () => Promise<void>
}

/**
 * Shared availability settings composable
 * LEARNING: Provides reactive availability settings with loading and error states
 * WHY: Allows multiple composables to share the same settings instance
 * PATTERN: Composable that fetches settings once and provides reactive access
 * 
 * @param initialSettings - Optional initial settings (if already fetched)
 * @returns Reactive settings with loading/error states
 */
export function useAvailabilitySettings(
  initialSettings?: AvailabilitySettings | null
): UseAvailabilitySettingsReturn {
  const settings = ref<AvailabilitySettings | null>(initialSettings || null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  watchEffect(async () => {
    if (settings.value) {
      return
    }

    try {
      isLoading.value = true
      error.value = null
      // WHY: Allows provide/inject pattern for better coordination
      const fetchedSettings = await getAvailabilitySettings()
      settings.value = fetchedSettings
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load availability settings')
      logger.error('Error loading availability settings:', err)
    } finally {
      isLoading.value = false
    }
  })

  /**
   * Refresh settings manually
   * LEARNING: Allows manual refresh of settings
   * WHY: Useful when admin updates settings and we need to refresh
   * PATTERN: Async function that fetches fresh settings
   */
  const refresh = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      const fetchedSettings = await getAvailabilitySettings()
      settings.value = fetchedSettings
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to refresh availability settings')
      logger.error('Error refreshing availability settings:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings: computed(() => settings.value),
    isLoading,
    error,
    hasError: computed(() => error.value !== null),
    refresh
  }
}
