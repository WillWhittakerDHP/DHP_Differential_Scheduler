import type { ComputedRef, Ref } from 'vue'
import type { WizardSettingsData } from '@/configs/wizardSettings'
import type { UseAdminSettingsFormReturnBase } from '@/types/admin/adminSettingsFormReturnBase'

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
  /** From GET /wizard-settings; null when unset. Used by booking theme when Brand colors is on. */
  brandPrimaryHex: ComputedRef<string | null>
  brandSecondaryHex: ComputedRef<string | null>
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
  moveableNoFeasibleCompletionSlotsMessage: ComputedRef<string>
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

export type UseAdminWizardSettingsReturn = UseAdminSettingsFormReturnBase<WizardSettingsData>
