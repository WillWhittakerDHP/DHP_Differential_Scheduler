/**
 * usePropertyFormWatchers Composable
 * 
 * LEARNING: Extracts form watchers logic from PropertyDetailsStep component
 * WHY: Moves MLS data syncing and loaded state population logic to composable
 * PATTERN: Composable that sets up watchers for form data synchronization
 */

import { watch, type Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { PropertyFormData } from '@/types/propertyForm'

// FIX: Use shared PropertyFormData type from propertyForm.ts

export interface UsePropertyFormWatchersParams {
  formData: PropertyFormData
  loadedWizardState: Ref<WizardStateData | null> | null
  isAddressExpanded: Ref<boolean>
}

export type UsePropertyFormWatchersReturn = Record<string, never>

/**
 * usePropertyFormWatchers composable
 * 
 * LEARNING: Sets up watchers for property form data synchronization
 * WHY: Extracts watcher logic from component to composable
 * PATTERN: Composable that sets up watchers for form data syncing
 */
export function usePropertyFormWatchers(
  params: UsePropertyFormWatchersParams
): UsePropertyFormWatchersReturn {
  const {
    formData,
    loadedWizardState,
    isAddressExpanded
  } = params

  /**
   * LEARNING: Watch MLS square footage and sync to property size
   * WHY: When MLS data is available, populate property size field
   * PATTERN: Watch MLS data and sync to form fields
   */
  watch(() => formData.squareFootage.value, (newVal) => {
    if (newVal !== null && formData.propertySize.value === null) {
      formData.propertySize.value = newVal
    }
  }, { immediate: true })

  /**
   * LEARNING: Watch MLS additional units and sync to numberOfUnits
   * WHY: When MLS data is available, populate number of units field
   * PATTERN: Watch MLS data and sync to form fields
   */
  watch(() => formData.additionalUnits.value, (newVal) => {
    if (newVal !== null && formData.numberOfUnits.value === null) {
      formData.numberOfUnits.value = newVal
    }
  }, { immediate: true })

  /**
   * LEARNING: Watch loaded wizard state and populate property details form fields
   * WHY: Enables loading appointment data into property details step
   * PATTERN: Watch loadedWizardState and update local refs when data is available
   * FIX: Removed toString() fallbacks that cause [object Object] display - values are already properly typed from transformer
   */
  if (loadedWizardState) {
    watch(loadedWizardState, (newState) => {
      if (newState?.propertyDetails) {
        const details = newState.propertyDetails
        formData.address.value = typeof details.address === 'string' ? details.address : ''
        formData.unit.value = typeof details.unit === 'string' ? details.unit : ''
        formData.city.value = typeof details.city === 'string' ? details.city : ''
        formData.state.value = typeof details.state === 'string' ? details.state : ''
        formData.zipCode.value = typeof details.zipCode === 'string' ? details.zipCode : ''
        formData.mlsNumber.value = typeof details.mlsNumber === 'string' ? details.mlsNumber : ''
        
        // Populate candidatePlaceId and candidateCoordinates if available
        formData.candidatePlaceId.value = typeof details.candidatePlaceId === 'string' ? details.candidatePlaceId : undefined
        formData.candidateCoordinates.value = details.candidateCoordinates || undefined
        
        formData.propertySize.value = typeof details.propertySize === 'number' ? details.propertySize : null
        formData.numberOfUnits.value = typeof details.numberOfUnits === 'number' ? details.numberOfUnits : null
        formData.squareFootage.value = typeof details.squareFootage === 'number' ? details.squareFootage : null
        formData.bedrooms.value = typeof details.bedrooms === 'number' ? details.bedrooms : null
        formData.bathrooms.value = typeof details.bathrooms === 'number' ? details.bathrooms : null
        formData.additionalUnits.value = typeof details.additionalUnits === 'number' ? details.additionalUnits : null
        
        formData.foundationAccess.value = typeof details.foundationAccess === 'string' && 
          (details.foundationAccess === 'basement' || details.foundationAccess === 'crawlspace' || details.foundationAccess === 'slab')
          ? details.foundationAccess as 'basement' | 'crawlspace' | 'slab'
          : null
        
        // Expand address fields if address exists (for existing appointments)
        if (details.address) {
          isAddressExpanded.value = true
        }
      }
    }, { immediate: true })
  }

  return {}
}

