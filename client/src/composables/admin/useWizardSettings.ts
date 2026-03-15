/**
 * WHY: Single composable for wizard-related settings used in both Admin (read/write)
 * and booking wizard (read-only from API). Replaces scattered handlers (e.g. showApplyCouponInWizard).
 * PATTERN: Read from useAvailabilitySettings when no binding; write via optional Ref binding (Admin).
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

export interface UseWizardSettingsOptions {
  /** When provided (Admin), composable reads/writes this ref; otherwise read-only from API (wizard). */
  showApplyCouponInWizardBinding?: Ref<boolean>
}

export interface UseWizardSettingsReturn {
  /** Current value: from binding when provided, else from availability settings API. */
  showApplyCouponInWizard: ComputedRef<boolean>
  /** Updates value when binding provided; no-op in read-only (wizard) mode. */
  setShowApplyCouponInWizard: (value: boolean) => void
}

/**
 * Consolidates wizard settings access. Use with no options in wizard (read-only);
 * pass showApplyCouponInWizardBinding in Admin to wire form state.
 */
export function useWizardSettings(
  options?: UseWizardSettingsOptions
): UseWizardSettingsReturn {
  const { settings } = useAvailabilitySettings()

  const binding = options?.showApplyCouponInWizardBinding

  const showApplyCouponInWizard = computed<boolean>(() => {
    if (binding) return binding.value
    return settings.value?.showApplyCouponInWizard ?? false
  })

  function setShowApplyCouponInWizard(value: boolean): void {
    if (binding) binding.value = value
  }

  return {
    showApplyCouponInWizard,
    setShowApplyCouponInWizard,
  }
}
