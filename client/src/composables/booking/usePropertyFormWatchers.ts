/**
 * WHY: usePropertyFormWatchers Composable

WHY: Moves MLS data syncing and load...
 */
import { watch } from 'vue'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { UsePropertyFormWatchersParams, UsePropertyFormWatchersReturn } from '@/types/booking/propertyFormWatchers'

/** Restore form fields from PropertyDetailsData (wizard persistence when returning to step). */
function restoreFormFromDetails(
  formData: UsePropertyFormWatchersParams['formData'],
  details: PropertyDetailsData,
  isAddressExpanded: { value: boolean }
): void {
  formData.address.value = typeof details.address === 'string' ? details.address : ''
  formData.unit.value = typeof details.unit === 'string' ? details.unit : ''
  formData.city.value = typeof details.city === 'string' ? details.city : ''
  formData.state.value = typeof details.state === 'string' ? details.state : ''
  formData.zipCode.value = typeof details.zipCode === 'string' ? details.zipCode : ''
  formData.mlsNumber.value = typeof details.mlsNumber === 'string' ? details.mlsNumber : ''
  formData.candidatePlaceId.value = typeof details.candidatePlaceId === 'string' ? details.candidatePlaceId : undefined
  formData.candidateCoordinates.value = details.candidateCoordinates ?? undefined
  formData.propertySize.value = typeof details.propertySize === 'number' ? details.propertySize : null
  formData.numberOfUnits.value = typeof details.numberOfUnits === 'number' ? details.numberOfUnits : null
  formData.squareFootage.value = typeof details.squareFootage === 'number' ? details.squareFootage : null
  formData.bedrooms.value = typeof details.bedrooms === 'number' ? details.bedrooms : null
  formData.bathrooms.value = typeof details.bathrooms === 'number' ? details.bathrooms : null
  formData.additionalUnits.value = typeof details.additionalUnits === 'number' ? details.additionalUnits : null
  formData.foundationAccess.value =
    typeof details.foundationAccess === 'string' &&
    (details.foundationAccess === 'basement' || details.foundationAccess === 'crawlspace' || details.foundationAccess === 'slab')
      ? (details.foundationAccess as 'basement' | 'crawlspace' | 'slab')
      : null
  if (formData.source) {
    formData.source.value = typeof details.source === 'string' ? (details.source as 'api' | 'manual' | 'client') : undefined
  }
  if (formData.suggestedBlockInstanceIds) {
    formData.suggestedBlockInstanceIds.value = Array.isArray(details.suggestedBlockInstanceIds) ? details.suggestedBlockInstanceIds : []
  }
  if (details.address) {
    isAddressExpanded.value = true
  }
}

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
    isAddressExpanded,
    restoreFrom
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

  if (loadedWizardState) {
    watch(loadedWizardState, (newState) => {
      if (newState?.propertyDetails) {
        const d = newState.propertyDetails
        restoreFormFromDetails(formData, {
          address: d.address,
          unit: d.unit,
          city: d.city,
          state: d.state,
          zipCode: d.zipCode,
          candidatePlaceId: d.candidatePlaceId,
          candidateCoordinates: d.candidateCoordinates,
          propertySize: d.propertySize,
          numberOfUnits: d.numberOfUnits,
          mlsNumber: d.mlsNumber,
          squareFootage: d.squareFootage,
          bedrooms: d.bedrooms,
          bathrooms: d.bathrooms,
          foundationAccess: d.foundationAccess,
          additionalUnits: d.additionalUnits
        }, isAddressExpanded)
      }
    }, { immediate: true })
  }

  let propertyRestored = false
  if (restoreFrom) {
    watch(restoreFrom, (data) => {
      if (!propertyRestored && data) {
        restoreFormFromDetails(formData, data, isAddressExpanded)
        propertyRestored = true
      }
    }, { immediate: true })
  }

  return {}
}
