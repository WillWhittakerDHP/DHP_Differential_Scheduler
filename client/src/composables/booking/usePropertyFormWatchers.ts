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

/**
 * usePropertyFormWatchers composable parameters
 */
export interface UsePropertyFormWatchersParams {
  formData: PropertyFormData
  loadedWizardState: Ref<WizardStateData | null> | null
}

/**
 * usePropertyFormWatchers composable return type
 * NOTE: Empty interface is intentional - watchers are set up internally with no external API
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UsePropertyFormWatchersReturn {}

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
    loadedWizardState
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
        // String fields - ensure they're strings (transformer guarantees this)
        formData.address.value = typeof details.address === 'string' ? details.address : ''
        formData.unit.value = typeof details.unit === 'string' ? details.unit : ''
        formData.city.value = typeof details.city === 'string' ? details.city : ''
        formData.state.value = typeof details.state === 'string' ? details.state : ''
        formData.zipCode.value = typeof details.zipCode === 'string' ? details.zipCode : ''
        formData.mlsNumber.value = typeof details.mlsNumber === 'string' ? details.mlsNumber : ''
        
        // Number fields - ensure they're numbers or null
        formData.propertySize.value = typeof details.propertySize === 'number' ? details.propertySize : null
        formData.numberOfUnits.value = typeof details.numberOfUnits === 'number' ? details.numberOfUnits : null
        formData.squareFootage.value = typeof details.squareFootage === 'number' ? details.squareFootage : null
        formData.bedrooms.value = typeof details.bedrooms === 'number' ? details.bedrooms : null
        formData.bathrooms.value = typeof details.bathrooms === 'number' ? details.bathrooms : null
        formData.additionalUnits.value = typeof details.additionalUnits === 'number' ? details.additionalUnits : null
        
        // Foundation access - ensure it's the correct type
        formData.foundationAccess.value = typeof details.foundationAccess === 'string' && 
          (details.foundationAccess === 'basement' || details.foundationAccess === 'crawlspace' || details.foundationAccess === 'slab')
          ? details.foundationAccess as 'basement' | 'crawlspace' | 'slab'
          : null
      }
    }, { immediate: true })
  }

  return {}
}

