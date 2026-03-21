/**
 * Wizard display settings: Admin (read/write via bindings) or booking wizard (read-only from /wizard-settings API).
 */
import { computed, ref, watchEffect, type ComputedRef, type Ref } from 'vue'
import { getWizardSettings } from '@/configs/wizardSettings'
import type { WizardSettingsData } from '@/configs/wizardSettings'

export interface UseWizardSettingsOptions {
  showApplyCouponBinding?: Ref<boolean>
  useBrandColorsBinding?: Ref<boolean>
}

export interface WizardSubStepLabels {
  0?: string
  1?: string
  2?: string
  3?: string
  4?: string
}

export interface UseWizardSettingsReturn {
  showApplyCoupon: ComputedRef<boolean>
  setShowApplyCoupon: (value: boolean) => void
  useBrandColors: ComputedRef<boolean>
  setUseBrandColors: (value: boolean) => void
  subStepLabels: ComputedRef<WizardSubStepLabels>
  differentialGraphDefaultLabel: ComputedRef<string | null>
  majorLabel: ComputedRef<string>
  minorLabel: ComputedRef<string>
  majorStateLabel: ComputedRef<string>
  minorStateLabel: ComputedRef<string>
  moveableFallbackLabel: ComputedRef<string>
  /** Alias for useBrandColors (booking wizard uses this name). */
  useDhpBrandColors: ComputedRef<boolean>
}

const DEFAULT_MAJOR_LABEL = 'Major'
const DEFAULT_MINOR_LABEL = 'Minor'
const DEFAULT_MOVEABLE_FALLBACK = 'Post-Appointment Work'

export function useWizardSettings(
  options?: UseWizardSettingsOptions
): UseWizardSettingsReturn {
  const wizardData = ref<WizardSettingsData | null>(null)

  watchEffect(() => {
    void getWizardSettings().then((data) => {
      wizardData.value = data
    })
  })

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

  const subStepLabelPickDay = computed(() => wizardData.value?.subStepLabelPickDay?.trim() || undefined)
  const subStepLabelOptions = computed(() => wizardData.value?.subStepLabelOptions?.trim() || undefined)
  const subStepLabelPickTime = computed(() => wizardData.value?.subStepLabelPickTime?.trim() || undefined)
  const subStepLabelConfirmMoveable = computed(() => wizardData.value?.subStepLabelConfirmMoveable?.trim() || undefined)
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
    showApplyCoupon,
    setShowApplyCoupon,
    useBrandColors,
    setUseBrandColors,
    subStepLabels,
    differentialGraphDefaultLabel,
    majorLabel,
    minorLabel,
    majorStateLabel,
    minorStateLabel,
    moveableFallbackLabel,
    useDhpBrandColors: useBrandColors,
  }
}
