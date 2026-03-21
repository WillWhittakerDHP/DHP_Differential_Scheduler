/**
 * Single flight for GET /wizard-settings in the public booking app.
 * WHY: Many composables called useWizardSettings() and each spawned a separate fetch + null-first paint.
 * PATTERN: Module refs + deduped promise; reset on BookingWizard unmount so a return visit refetches.
 */
import { computed, type ComputedRef, type Ref, ref } from 'vue'
import type { WizardSettingsData } from '@/configs/wizardSettings'
import { getWizardSettings } from '@/configs/wizardSettings'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useBookingWizardSettingsSingleton')

const wizardData = ref<WizardSettingsData | null>(null)
const isLoading = ref(false)
const hasSettled = ref(false)
let inFlight: Promise<void> | null = null

function runLoad(): Promise<void> {
  if (inFlight) return inFlight
  isLoading.value = true
  const p = getWizardSettings()
    .then((data) => {
      wizardData.value = data
    })
    .catch((err: unknown) => {
      logger.error('Failed to load wizard settings', { err })
      wizardData.value = {}
    })
    .finally(() => {
      isLoading.value = false
      hasSettled.value = true
      inFlight = null
    })
  inFlight = p
  return p
}

/** Start wizard-settings fetch as early as possible (BookingWizard setup). */
export function prefetchBookingWizardSettings(): void {
  void runLoad()
}

/** Clear cached wizard settings when leaving the booking flow so the next visit loads fresh data. */
export function resetBookingWizardSettingsSingleton(): void {
  wizardData.value = null
  hasSettled.value = false
  isLoading.value = false
  inFlight = null
}

/** Shared state for all booking callers of useWizardSettings() without admin bindings. */
export function useBookingWizardSettingsSingleton(): {
  wizardData: Ref<WizardSettingsData | null>
  isLoading: Ref<boolean>
  wizardSettingsReady: ComputedRef<boolean>
} {
  void runLoad()
  return {
    wizardData,
    isLoading,
    wizardSettingsReady: computed(() => hasSettled.value),
  }
}
