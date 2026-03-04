import { computed } from 'vue'
import type { Ref } from 'vue'
import type { PropertyRequest } from '@/types/property'
import { asEmptyString } from '@/utils/safeDefaults'
import type { UsePropertyCreateFormReturn } from '@/types/admin/propertyCreateForm'

/**
 * Form state and setters for PropertyCreateForm.
 * Keeps the component thin (vue-architecture audit).
 */
export function usePropertyCreateForm(
  newProperty: Ref<PropertyRequest | Partial<PropertyRequest>>
): UsePropertyCreateFormReturn {
  const address = computed(() => asEmptyString(newProperty.value?.address))
  const unit = computed(() => asEmptyString(newProperty.value?.unit))
  const city = computed(() => asEmptyString(newProperty.value?.city))
  const state = computed(() => asEmptyString(newProperty.value?.state))
  const zipCode = computed(() => asEmptyString(newProperty.value?.zipCode))
  const squareFootage = computed(() => newProperty.value?.squareFootage ?? undefined)
  const mlsNumber = computed(() => asEmptyString(newProperty.value?.mlsNumber))
  const bedrooms = computed(() => newProperty.value?.bedrooms ?? undefined)
  const bathrooms = computed(() => newProperty.value?.bathrooms ?? undefined)
  const foundationAccess = computed(() => asEmptyString(newProperty.value?.foundationAccess))
  const additionalUnits = computed(() => newProperty.value?.additionalUnits ?? undefined)

  return {
    address,
    unit,
    city,
    state,
    zipCode,
    squareFootage,
    mlsNumber,
    bedrooms,
    bathrooms,
    foundationAccess,
    additionalUnits,
    setAddress(v: string): void {
      if (newProperty.value) newProperty.value.address = v
    },
    setUnit(v: string): void {
      if (newProperty.value) newProperty.value.unit = v
    },
    setCity(v: string): void {
      if (newProperty.value) newProperty.value.city = v
    },
    setState(v: string): void {
      if (newProperty.value) newProperty.value.state = v
    },
    setZipCode(v: string): void {
      if (newProperty.value) newProperty.value.zipCode = v
    },
    setSquareFootage(v: number | string | null): void {
      if (newProperty.value) newProperty.value.squareFootage = v != null ? Number(v) : undefined
    },
    setMlsNumber(v: string): void {
      if (newProperty.value) newProperty.value.mlsNumber = v
    },
    setBedrooms(v: number | string | null): void {
      if (newProperty.value) newProperty.value.bedrooms = v != null ? Number(v) : undefined
    },
    setBathrooms(v: number | string | null): void {
      if (newProperty.value) newProperty.value.bathrooms = v != null ? Number(v) : undefined
    },
    setFoundationAccess(v: string | null): void {
      if (newProperty.value) {
        newProperty.value.foundationAccess =
          v === 'basement' || v === 'crawlspace' || v === 'slab' ? v : undefined
      }
    },
    setAdditionalUnits(v: number | string | null): void {
      if (newProperty.value) newProperty.value.additionalUnits = v != null ? Number(v) : undefined
    },
  }
}
