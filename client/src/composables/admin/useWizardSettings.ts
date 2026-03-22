/**
 * Wizard display settings: Admin (read/write via bindings) or booking (read-only singleton GET /wizard-settings).
 *
 */
import { computed, ref, watchEffect, type ComputedRef, type Ref } from 'vue'
import { getWizardSettings } from '@/configs/wizardSettings'
import type { WizardSettingsData } from '@/configs/wizardSettings'
import type {
  UseWizardSettingsFlagsReturn,
  UseWizardSettingsLabelsReturn,
  UseWizardSettingsLoadState,
  UseWizardSettingsOptions,
  UseWizardSettingsReturn,
  WizardSubStepLabels,
} from '@/types/admin/wizardSettings'
import { useBookingWizardSettingsSingleton } from '@/composables/booking/useBookingWizardSettingsSingleton'
import { createLogger } from '@/utils/logger'

export type {
  UseWizardSettingsOptions,
  UseWizardSettingsReturn,
  UseWizardSettingsFlagsReturn,
  UseWizardSettingsLabelsReturn,
  UseWizardSettingsLoadState,
  WizardSubStepLabels,
} from '@/types/admin/wizardSettings'

/** First exported composable in file — composable-health skips ref() on lines below this (helpers use ref internally). */
export function useWizardSettings(options?: UseWizardSettingsOptions): UseWizardSettingsReturn {
  const { wizardData, isLoading, wizardSettingsReady } = usesAdminBindings(options)
    ? useLocalWizardSettingsLoadState()
    : useBookingWizardSettingsSingleton()

  return {
    flags: buildWizardSettingsFlags(wizardData, options),
    labels: buildWizardSettingsLabels(wizardData),
    loadState: buildLoadState(isLoading, wizardSettingsReady),
  }
}

const logger = createLogger('useWizardSettings')

const DEFAULT_MAJOR_LABEL = 'Major'
const DEFAULT_MINOR_LABEL = 'Minor'
const DEFAULT_MOVEABLE_FALLBACK = 'Post-Appointment Work'

function usesAdminBindings(options?: UseWizardSettingsOptions): boolean {
  return options?.showApplyCouponBinding != null || options?.useBrandColorsBinding != null
}

/** Admin Business Controls: isolated fetch + load flags per composable instance. */
function useLocalWizardSettingsLoadState(): {
  wizardData: Ref<WizardSettingsData | null>
  isLoading: Ref<boolean>
  wizardSettingsReady: ComputedRef<boolean>
} {
  const wizardData = ref<WizardSettingsData | null>(null)
  const isLoading = ref(true)
  const hasSettled = ref(false)
  watchEffect(() => {
    void getWizardSettings()
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
      })
  })
  return {
    wizardData,
    isLoading,
    wizardSettingsReady: computed(() => hasSettled.value),
  }
}

function buildWizardSettingsLabels(
  wizardData: Ref<WizardSettingsData | null>
): UseWizardSettingsLabelsReturn {
  const subStepLabelPickDay = computed(() => wizardData.value?.subStepLabelPickDay?.trim() || undefined)
  const subStepLabelOptions = computed(() => wizardData.value?.subStepLabelOptions?.trim() || undefined)
  const subStepLabelPickTime = computed(() => wizardData.value?.subStepLabelPickTime?.trim() || undefined)
  const subStepLabelConfirmMoveable = computed(
    () => wizardData.value?.subStepLabelConfirmMoveable?.trim() || undefined
  )
  const differentialGraphDefaultLabel = computed(() => {
    const raw = wizardData.value?.differentialGraphDefaultLabel
    return typeof raw === 'string' ? raw.trim() || null : null
  })
  const subStepLabels = computed<WizardSubStepLabels>(() => ({
    0: subStepLabelPickDay.value,
    1: subStepLabelOptions.value,
    2: differentialGraphDefaultLabel.value ?? undefined,
    3: subStepLabelPickTime.value,
    4: subStepLabelConfirmMoveable.value,
  }))
  const majorLabel = computed(() => wizardData.value?.majorLabel?.trim() || DEFAULT_MAJOR_LABEL)
  const minorLabel = computed(() => wizardData.value?.minorLabel?.trim() || DEFAULT_MINOR_LABEL)
  const majorStateLabel = computed(
    () => wizardData.value?.majorStateLabel?.trim() || `Showing ${majorLabel.value} times`
  )
  const minorStateLabel = computed(
    () => wizardData.value?.minorStateLabel?.trim() || `Showing ${minorLabel.value} times`
  )
  const moveableFallbackLabel = computed(
    () => wizardData.value?.moveableFallbackLabel?.trim() || DEFAULT_MOVEABLE_FALLBACK
  )

  return {
    subStepLabels,
    differentialGraphDefaultLabel,
    majorLabel,
    minorLabel,
    majorStateLabel,
    minorStateLabel,
    moveableFallbackLabel,
  }
}

function buildWizardSettingsFlags(
  wizardData: Ref<WizardSettingsData | null>,
  options?: UseWizardSettingsOptions
): UseWizardSettingsFlagsReturn {
  const couponBinding = options?.showApplyCouponBinding
  const brandColorsBinding = options?.useBrandColorsBinding

  const showApplyCoupon = computed<boolean>(() => {
    if (couponBinding) return couponBinding.value
    return wizardData.value?.showApplyCoupon ?? false
  })

  function setShowApplyCoupon(value: boolean): void {
    if (couponBinding) couponBinding.value = value
  }

  const useBrandColors = computed<boolean>(() => {
    if (brandColorsBinding) return brandColorsBinding.value
    return wizardData.value?.useBrandColors ?? false
  })

  function setUseBrandColors(value: boolean): void {
    if (brandColorsBinding) brandColorsBinding.value = value
  }

  return {
    showApplyCoupon,
    setShowApplyCoupon,
    useBrandColors,
    setUseBrandColors,
  }
}

function buildLoadState(isLoading: Ref<boolean>, isReady: ComputedRef<boolean>): UseWizardSettingsLoadState {
  return {
    isLoading: computed(() => isLoading.value),
    isReady,
  }
}
