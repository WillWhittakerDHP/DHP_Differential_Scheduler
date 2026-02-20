/**
 * Composable for default location (address, label, coordinates, placeId)
 * WHY: Extracts default location bindings from BusinessControlsTab for reuse
 * PATTERN: Writable computeds that ensure defaultLocation exists on set
 * @audit-allow loop-mutation:assignProp - Vue reactive form pattern (writable computed setters)
 */
import { computed, type WritableComputedRef } from 'vue'
import type { Coordinates } from '@/configs/availabilitySettings'
import type { UseDefaultLocationParams } from '@/types/availabilitySettingsParams'

export type { UseDefaultLocationParams }

export function useDefaultLocation(params: UseDefaultLocationParams): {
  defaultLocationAddress: WritableComputedRef<string>
  defaultLocationLabel: WritableComputedRef<string>
  defaultLocationCoordinates: WritableComputedRef<Coordinates | undefined>
  defaultLocationPlaceId: WritableComputedRef<string>
} {
  const { formData } = params

  const defaultLocationAddress = computed({
    get: () => formData.value?.defaultLocation?.address ?? '',
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
    get: () => formData.value?.defaultLocation?.label ?? '',
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
    get: () => formData.value?.defaultLocation?.placeId ?? '',
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
