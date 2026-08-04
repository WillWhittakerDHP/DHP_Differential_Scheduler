/**
 * WHY: Restore form fields from PropertyDetailsData (property form watchers).
 */

import type { PropertyDetailsData } from '@/types/propertyForm'
import type { UsePropertyFormWatchersParams } from '@/types/booking/propertyFormWatchers'

export function restorePropertyFormFromDetails(
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
  formData.hvacCount.value = typeof details.hvacCount === 'number' ? details.hvacCount : null
  formData.waterHeaterCount.value =
    typeof details.waterHeaterCount === 'number' ? details.waterHeaterCount : null
  formData.kitchenApplianceCount.value =
    typeof details.kitchenApplianceCount === 'number' ? details.kitchenApplianceCount : null
  formData.foundationAccess.value =
    typeof details.foundationAccess === 'string' &&
    (details.foundationAccess === 'basement' ||
      details.foundationAccess === 'crawlspace' ||
      details.foundationAccess === 'slab')
      ? (details.foundationAccess as 'basement' | 'crawlspace' | 'slab')
      : null
  if (formData.source) {
    formData.source.value =
      typeof details.source === 'string' ? (details.source as 'api' | 'manual' | 'client') : undefined
  }
  if (formData.suggestedBlockInstanceIds) {
    formData.suggestedBlockInstanceIds.value = Array.isArray(details.suggestedBlockInstanceIds)
      ? details.suggestedBlockInstanceIds
      : []
  }
  if (details.address) {
    isAddressExpanded.value = true
  }
}
