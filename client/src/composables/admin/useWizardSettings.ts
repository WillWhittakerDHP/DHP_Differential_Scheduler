/**
 * Wizard display settings: Admin (read/write via bindings) or booking wizard (read-only from /wizard-settings API).
 *
 * PATTERN: Grouped { flags, labels } return — single watchEffect + ref; splits contract for composable-health (oversized-return).
 */
import { computed, ref, watchEffect, type Ref } from 'vue'
import { getWizardSettings } from '@/configs/wizardSettings'
import type { WizardSettingsData } from '@/configs/wizardSettings'
import type {
  UseWizardSettingsFlagsReturn,
  UseWizardSettingsLabelsReturn,
  UseWizardSettingsOptions,
  UseWizardSettingsReturn,
  WizardSubStepLabels,
} from '@/types/admin/wizardSettings'

export type {
  UseWizardSettingsOptions,
  UseWizardSettingsReturn,
  UseWizardSettingsFlagsReturn,
  UseWizardSettingsLabelsReturn,
  WizardSubStepLabels,
} from '@/types/admin/wizardSettings'

const DEFAULT_MAJOR_LABEL = 'Major'
const DEFAULT_MINOR_LABEL = 'Minor'
const DEFAULT_MOVEABLE_FALLBACK = 'Post-Appointment Work'

function useWizardSettingsDataRef(): Ref<WizardSettingsData | null> {
  const wizardData = ref<WizardSettingsData | null>(null)
  watchEffect(() => {
    void getWizardSettings().then((data) => {
      wizardData.value = data
    })
  })
  return wizardData
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

export function useWizardSettings(options?: UseWizardSettingsOptions): UseWizardSettingsReturn {
  const wizardData = useWizardSettingsDataRef()
  return {
    flags: buildWizardSettingsFlags(wizardData, options),
    labels: buildWizardSettingsLabels(wizardData),
  }
}
