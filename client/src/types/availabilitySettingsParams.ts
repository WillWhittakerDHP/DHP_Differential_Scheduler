/**
 * WHY: Canonical param shapes for composables that take AvailabilitySettings fo...
 */
import type { Ref } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { WizardSettingsData } from '@/configs/wizardSettings'

export interface AvailabilitySettingsFormParams {
  formData: Ref<AvailabilitySettings | null>
}

export type UseBufferSettingsParams = AvailabilitySettingsFormParams & { readonly __brand: 'UseBufferSettingsParams' }
export type UseDefaultLocationParams = AvailabilitySettingsFormParams & { readonly __brand: 'UseDefaultLocationParams' }

export interface UseDifferentialPerspectivesParams extends AvailabilitySettingsFormParams {
  readonly __brand: 'UseDifferentialPerspectivesParams'
  /** When provided (Admin), label fields read/write here; otherwise availability formData.differentialPerspectives. */
  wizardFormData?: Ref<WizardSettingsData | null>
}
