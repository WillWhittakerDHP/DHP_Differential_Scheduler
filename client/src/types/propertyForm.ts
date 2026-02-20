/**
 * LEARNING: Shared property form types
 * WHY: Property form data structures are duplicated across multiple files
 * PATTERN: Centralized type definitions for property form data
 * 
 * Used by:
 * - usePropertyDetailsLogic.ts
 * - usePropertyFormWatchers.ts
 * - wizard.ts
 */

import type { Ref } from 'vue'
import { DEFAULT_PROPERTY_SOURCE } from '@shared/constants/propertyConstants'
import type { PropertyAddressBase } from '@shared/types/propertyTypes'

/**
 * LEARNING: Canonical property source values for form and type
 * WHY: Single source of truth for property source; CLIENT from shared constant
 * PATTERN: Const object then derived type
 */
export const PROPERTY_SOURCE = { API: 'api', MANUAL: 'manual', CLIENT: DEFAULT_PROPERTY_SOURCE } as const
export type PropertySource = (typeof PROPERTY_SOURCE)[keyof typeof PROPERTY_SOURCE]

/**
 * LEARNING: Property details data structure
 * WHY: Used for property form data in booking wizard
 * PATTERN: Plain data structure (no Ref wrappers); extends shared address base
 */
export interface PropertyDetailsData extends PropertyAddressBase {
  unit: string  // narrow base's optional unit to required for form
  candidatePlaceId?: string  // Candidate placeId from autocomplete (not yet saved to property)
  candidateCoordinates?: { lat: number; lng: number }  // Candidate coordinates from autocomplete (not yet saved)
  propertySize: number | null
  numberOfUnits: number | null
  mlsNumber: string
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | null
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits: number | null
  source?: PropertySource
  suggestedBlockInstanceIds?: string[]
}

/**
 * LEARNING: Property form data structure with Ref wrappers
 * WHY: Used for reactive form data in composables
 * PATTERN: Same structure as PropertyDetailsData but with Ref wrappers for reactivity
 */
export interface PropertyFormData {
  address: Ref<string>
  unit: Ref<string>
  city: Ref<string>
  state: Ref<string>
  zipCode: Ref<string>
  candidatePlaceId: Ref<string | undefined>  // Candidate placeId from autocomplete (not yet saved)
  candidateCoordinates: Ref<{ lat: number; lng: number } | undefined>  // Candidate coordinates from autocomplete (not yet saved)
  propertySize: Ref<number | null>
  numberOfUnits: Ref<number | null>
  mlsNumber: Ref<string>
  squareFootage: Ref<number | null>
  bedrooms: Ref<number | null>
  bathrooms: Ref<number | null>
  foundationAccess: Ref<'basement' | 'crawlspace' | 'slab' | null>
  additionalUnits: Ref<number | null>
  source?: Ref<PropertySource | undefined>
  suggestedBlockInstanceIds?: Ref<string[]>
}
