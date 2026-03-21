/**
 * WHY: Shared Availability Settings Composable

WHY: Multiple composables fetch...
 */
import { ref, computed, watchEffect } from 'vue'
import { getAvailabilitySettings, type AvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import type { UseBookingAvailabilitySettingsReturn } from '@/types/booking/availabilitySettings'


const logger = createLogger('useAvailabilitySettings')

/**
 * WHY: Shared availability settings composable
WHY: Allows multiple composables...
 */
export function useAvailabilitySettings(
  initialSettings?: AvailabilitySettings | null
): UseBookingAvailabilitySettingsReturn {
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
