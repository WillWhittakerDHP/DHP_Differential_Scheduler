/**
 */
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useBooking } from '@/composables/useBooking'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { UseBookingFlowReturn } from '@/types/booking/bookingFlow'

export function useBookingFlow(): UseBookingFlowReturn {
  const { globalData, isLoading: globalIsLoading, error: globalError } = useGlobal()
  const { bookingData } = useBooking()
  const wizardSettings = useWizardSettings()
  const availability = useAvailabilitySettings()

  const globalReady = computed(
    () => !globalIsLoading.value && globalData.value !== undefined && globalData.value !== null
  )

  const readiness = computed(() => {
    const globalHydrated = globalReady.value
    const transformOk = bookingData.value !== null
    const wizardSettingsReady = wizardSettings.loadState.isReady.value
    const availabilitySettled =
      !availability.isLoading.value &&
      (availability.settings.value !== null || availability.error.value !== null)
    return {
      globalHydrated,
      transformOk,
      wizardSettingsReady,
      availabilitySettled,
    }
  })

  const isBookingFlowReady = computed(
    () =>
      readiness.value.globalHydrated &&
      readiness.value.transformOk &&
      readiness.value.wizardSettingsReady &&
      readiness.value.availabilitySettled
  )

  const bookingFlowError = computed((): Error | null => {
    const g = globalError.value
    if (g !== null && g !== undefined) return g
    return availability.error.value
  })

  return {
    bookingData,
    globalReady,
    wizardSettings,
    availability,
    readiness,
    isBookingFlowReady,
    bookingFlowError,
  }
}
