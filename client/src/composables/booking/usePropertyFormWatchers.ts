/**
 * WHY: usePropertyFormWatchers Composable

WHY: Moves MLS data syncing and load...
 */
import { watch } from 'vue'
import type { UsePropertyFormWatchersParams, UsePropertyFormWatchersReturn } from '@/types/booking/propertyFormWatchers'

export type { UsePropertyFormWatchersParams, UsePropertyFormWatchersReturn } from '@/types/booking/propertyFormWatchers'

/**
 * WHY: usePropertyFormWatchers composable

WHY: Extracts watcher logic from com...
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
   */
  watch(() => formData.squareFootage.value, (newVal) => {
    if (newVal !== null && formData.propertySize.value === null) {
      formData.propertySize.value = newVal
    }
  }, { immediate: true })

  /**
   */
  watch(() => formData.additionalUnits.value, (newVal) => {
    if (newVal !== null && formData.numberOfUnits.value === null) {
      formData.numberOfUnits.value = newVal
    }
  }, { immediate: true })

  /**
LEARNING: Watch loaded wizard state and populate property details fo...
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
        
        if (details.address) {
          isAddressExpanded.value = true
        }
      }
    }, { immediate: true })
  }

  return {}
}

