/**
 * WHY: Shared read/write for wizard_settings vs availability form differential copy (pure helpers).
 */

import type { Ref } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { WizardSettingsData } from '@/configs/wizardSettings'
import type { WizardCopyLabelFields } from '@shared/types/wizardSettingsTypes'

export type DifferentialLabelKey = keyof WizardCopyLabelFields

export function ensureDifferentialPerspectivesBucket(
  formData: Ref<AvailabilitySettings | null>
): NonNullable<AvailabilitySettings['differentialPerspectives']> | undefined {
  if (!formData.value) {
    return undefined
  }
  if (!formData.value.differentialPerspectives) {
    formData.value.differentialPerspectives = {}
  }
  return formData.value.differentialPerspectives
}

export function readWizardOrFormLabel(
  wizardForm: WizardSettingsData | null | undefined,
  formDp: AvailabilitySettings['differentialPerspectives'] | undefined,
  key: DifferentialLabelKey,
  defaultValue: string
): string {
  return wizardForm?.[key] ?? formDp?.[key] ?? defaultValue
}

export function writeWizardOrFormLabel(
  wizardFormData: Ref<WizardSettingsData | null> | undefined,
  formData: Ref<AvailabilitySettings | null>,
  key: DifferentialLabelKey,
  value: string
): void {
  if (wizardFormData?.value) {
    wizardFormData.value[key] = value
    return
  }
  const dp = ensureDifferentialPerspectivesBucket(formData)
  if (!dp) {
    return
  }
  dp[key] = value
}
