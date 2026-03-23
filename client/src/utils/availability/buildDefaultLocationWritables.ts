/**
 * WHY: Writable computeds for default location fields (useDefaultLocation length audit).
 */

import { computed, type Ref, type WritableComputedRef } from 'vue'
import type { AvailabilitySettings, Coordinates } from '@/configs/availabilitySettings'

function optionalFieldString(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  return value
}

function ensureDefaultLocationStub(form: AvailabilitySettings | null | undefined): void {
  if (form && !form.defaultLocation) {
    form.defaultLocation = { placeId: '' }
  }
}

export function buildDefaultLocationWritables(formData: Ref<AvailabilitySettings | null>): {
  defaultLocationAddress: WritableComputedRef<string>
  defaultLocationLabel: WritableComputedRef<string>
  defaultLocationCoordinates: WritableComputedRef<Coordinates | undefined>
  defaultLocationPlaceId: WritableComputedRef<string>
} {
  const defaultLocationAddress = computed({
    get: () => optionalFieldString(formData.value?.defaultLocation?.address),
    set: (value: string) => {
      if (!formData.value) return
      ensureDefaultLocationStub(formData.value)
      formData.value.defaultLocation!.address = value
    },
  })

  const defaultLocationLabel = computed({
    get: () => optionalFieldString(formData.value?.defaultLocation?.label),
    set: (value: string) => {
      if (!formData.value) return
      ensureDefaultLocationStub(formData.value)
      formData.value.defaultLocation!.label = value
    },
  })

  const defaultLocationCoordinates = computed({
    get: () => formData.value?.defaultLocation?.coordinates,
    set: (value: Coordinates | undefined) => {
      if (!formData.value) return
      ensureDefaultLocationStub(formData.value)
      formData.value.defaultLocation!.coordinates = value
    },
  })

  const defaultLocationPlaceId = computed({
    get: () => optionalFieldString(formData.value?.defaultLocation?.placeId),
    set: (value: string) => {
      if (!formData.value) return
      ensureDefaultLocationStub(formData.value)
      formData.value.defaultLocation!.placeId = value
    },
  })

  return {
    defaultLocationAddress,
    defaultLocationLabel,
    defaultLocationCoordinates,
    defaultLocationPlaceId,
  }
}
