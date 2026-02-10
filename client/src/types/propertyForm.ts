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

/**
 * LEARNING: Property details data structure
 * WHY: Used for property form data in booking wizard
 * PATTERN: Plain data structure (no Ref wrappers)
 */
export interface PropertyDetailsData {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
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
}
