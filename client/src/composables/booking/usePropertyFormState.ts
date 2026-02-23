/**
 * PATTERN: usePropertyFormState Composable

PATTERN: Composable that creates and re...
 */
import { ref } from 'vue'
import type { PropertyFormData, PropertySource } from '@/types/propertyForm'
import type { PropertyFormStateCore } from './usePropertyDetailsLogic'

/** Extends shared base (TYPE_SIMILARITY 1.15). */
export type UsePropertyFormStateReturn = PropertyFormStateCore

/**
 * WHY: usePropertyFormState composable

WHY: Reduces component clutter by manag...
 */
export function usePropertyFormState(): UsePropertyFormStateReturn {
  /**
   * WHY: Centralizes ref creation in composable
   */
  const address = ref('')
  const unit = ref('')
  const city = ref('')
  const state = ref('')
  const zipCode = ref('')
  const candidatePlaceId = ref<string | undefined>(undefined)
  const candidateCoordinates = ref<{ lat: number; lng: number } | undefined>(undefined)
  const propertySize = ref<number | null>(null)
  const numberOfUnits = ref<number | null>(null)
  const mlsNumber = ref<string>('')
  const squareFootage = ref<number | null>(null)
  const bedrooms = ref<number | null>(null)
  const bathrooms = ref<number | null>(null)
  const foundationAccess = ref<'basement' | 'crawlspace' | 'slab' | null>(null)
  const additionalUnits = ref<number | null>(null)
  const source = ref<PropertySource | undefined>(undefined)
  const suggestedBlockInstanceIds = ref<string[]>([])
  
  /**
   * PATTERN: Boolean ref to control UI state
   */
  const isAddressExpanded = ref(false)

  /**
   * NOTE: Don't wrap in reactive() - refs are already reactive and wrapping breaks ref access
   */
  const formData: PropertyFormData = {
    address,
    unit,
    city,
    state,
    zipCode,
    candidatePlaceId,
    candidateCoordinates,
    propertySize,
    numberOfUnits,
    mlsNumber,
    squareFootage,
    bedrooms,
    bathrooms,
    foundationAccess,
    additionalUnits,
    source,
    suggestedBlockInstanceIds
  }

  return {
    formData,
    isAddressExpanded
  }
}

