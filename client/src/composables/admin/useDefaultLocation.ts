/**
 * Composable for default location (address, label, coordinates, placeId)
 */
import { computed, type WritableComputedRef } from 'vue'
import type { Coordinates } from '@/configs/availabilitySettings'
import type { UseDefaultLocationParams } from '@/types/availabilitySettingsParams'
import { asEmptyString } from '@/utils/safeDefaults'

export type { UseDefaultLocationParams }

export function useDefaultLocation(params: UseDefaultLocationParams): {
  defaultLocationAddress: WritableComputedRef<string>
  defaultLocationLabel: WritableComputedRef<string>
  defaultLocationCoordinates: WritableComputedRef<Coordinates | undefined>
  defaultLocationPlaceId: WritableComputedRef<string>
} {
  const { formData } = params

  const defaultLocationAddress = computed({
    get: () => asEmptyString(formData.value?.defaultLocation?.address),
    set: (value: string) => {
      if (formData.value) {
        if (!formData.value.defaultLocation) {
          formData.value.defaultLocation = { placeId: '' }
        }
        formData.value.defaultLocation.address = value
      }
    }
  })

  const defaultLocationLabel = computed({
    get: () => asEmptyString(formData.value?.defaultLocation?.label),
    set: (value: string) => {
      if (formData.value) {
        if (!formData.value.defaultLocation) {
          formData.value.defaultLocation = { placeId: '' }
        }
        formData.value.defaultLocation.label = value
      }
    }
  })

  const defaultLocationCoordinates = computed({
    get: () => formData.value?.defaultLocation?.coordinates,
    set: (value: Coordinates | undefined) => {
      if (formData.value) {
        if (!formData.value.defaultLocation) {
          formData.value.defaultLocation = { placeId: '' }
        }
        formData.value.defaultLocation.coordinates = value
      }
    }
  })

  const defaultLocationPlaceId = computed({
    get: () => asEmptyString(formData.value?.defaultLocation?.placeId),
    set: (value: string) => {
      if (formData.value) {
        if (!formData.value.defaultLocation) {
          formData.value.defaultLocation = { placeId: '' }
        }
        formData.value.defaultLocation.placeId = value
      }
    }
  })

  return {
    defaultLocationAddress,
    defaultLocationLabel,
    defaultLocationCoordinates,
    defaultLocationPlaceId
  }
}
