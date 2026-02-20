/**
 * usePropertyFormState Composable
 * 
 * LEARNING: Consolidates property form field refs into a single object
 * WHY: Reduces component clutter by managing all form refs in one place
 * PATTERN: Composable that creates and returns all form field refs as a single object
 * 
 * Features:
 * - Creates all form field refs
 * - Returns consolidated form state object
 * - Provides type-safe access to all fields
 */

import { ref } from 'vue'
import type { PropertyFormData, PropertySource } from '@/types/propertyForm'
import type { PropertyFormStateCore } from './usePropertyDetailsLogic'

/** Extends shared base (TYPE_SIMILARITY 1.15). */
export type UsePropertyFormStateReturn = PropertyFormStateCore

/**
 * usePropertyFormState composable
 * 
 * LEARNING: Creates and returns consolidated property form state
 * WHY: Reduces component clutter by managing all form refs in composable
 * PATTERN: Composable that creates all refs and returns as single object
 */
export function usePropertyFormState(): UsePropertyFormStateReturn {
  /**
   * LEARNING: Create all form field refs
   * WHY: Centralizes ref creation in composable
   * PATTERN: All refs created with default empty values
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
   * LEARNING: Track whether address fields are expanded (progressive disclosure)
   * WHY: Start with autocomplete-only, expand to show all fields after selection
   * PATTERN: Boolean ref to control UI state
   */
  const isAddressExpanded = ref(false)

  /**
   * LEARNING: Consolidate all form refs into single object
   * WHY: Provides single source of truth for form state
   * PATTERN: Object containing all form field refs
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

