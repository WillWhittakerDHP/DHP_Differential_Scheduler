import type { ComputedRef, Ref } from 'vue'
import type { WizardSettingsData } from '@/configs/wizardSettings'

/** Sub-step index → admin-configured label (availability mini-wizard). */
export interface WizardSubStepLabels {
  0?: string
  1?: string
  2?: string
  3?: string
  4?: string
}

/** Admin Business Controls: bind toggles to form refs instead of public API. */
export interface UseWizardSettingsOptions {
  showApplyCouponBinding?: Ref<boolean>
  useBrandColorsBinding?: Ref<boolean>
}

/** Coupon + brand toggles (read + action setters). */
export interface UseWizardSettingsFlagsReturn {
  showApplyCoupon: ComputedRef<boolean>
  setShowApplyCoupon: (value: boolean) => void
  useBrandColors: ComputedRef<boolean>
  setUseBrandColors: (value: boolean) => void
}

/** Wizard copy from /wizard-settings (labels, sub-step strings, moveable fallback). */
export interface UseWizardSettingsLabelsReturn {
  subStepLabels: ComputedRef<WizardSubStepLabels>
  differentialGraphDefaultLabel: ComputedRef<string | null>
  majorLabel: ComputedRef<string>
  minorLabel: ComputedRef<string>
  majorStateLabel: ComputedRef<string>
  minorStateLabel: ComputedRef<string>
  moveableFallbackLabel: ComputedRef<string>
}

/** Load contract for /wizard-settings (booking singleton or per-instance admin fetch). */
export interface UseWizardSettingsLoadState {
  isLoading: ComputedRef<boolean>
  /** True after the first fetch attempt finished (success or error); avoids null-first race in UI. */
  isReady: ComputedRef<boolean>
}

/**
 * PATTERN: Grouped return — composable-health keeps surface small ({ flags, labels, loadState }).
 * @see COMPOSABLE_AUTHORING_PLAYBOOK.md — split oversized return surfaces.
 */
export interface UseWizardSettingsReturn {
  flags: UseWizardSettingsFlagsReturn
  labels: UseWizardSettingsLabelsReturn
  loadState: UseWizardSettingsLoadState
}

export interface UseAdminWizardSettingsOptions {
  enabled?: Ref<boolean>
}

export interface UseAdminWizardSettingsReturn {
  formData: Ref<WizardSettingsData | null>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}
