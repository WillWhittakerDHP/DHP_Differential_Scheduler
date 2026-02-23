/**
 * WHY: Canonical param shapes for composables that take AvailabilitySettings fo...
 */
import type { Ref } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

export interface AvailabilitySettingsFormParams {
  formData: Ref<AvailabilitySettings | null>
}

export type UseBufferSettingsParams = AvailabilitySettingsFormParams & { readonly __brand: 'UseBufferSettingsParams' }
export type UseDefaultLocationParams = AvailabilitySettingsFormParams & { readonly __brand: 'UseDefaultLocationParams' }
export type UseDifferentialPerspectivesParams = AvailabilitySettingsFormParams & { readonly __brand: 'UseDifferentialPerspectivesParams' }
