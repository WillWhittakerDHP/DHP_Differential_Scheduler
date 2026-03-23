/**
 * WHY: Field mirroring + wizard restore watches (usePropertyFormWatchers length audit).
 */

import { watch } from 'vue'
import type { UsePropertyFormWatchersParams } from '@/types/booking/propertyFormWatchers'
import { restorePropertyFormFromDetails } from '@/utils/booking/restorePropertyFormFromDetails'

export function registerPropertyFormFieldWatchers(
  formData: UsePropertyFormWatchersParams['formData']
): void {
  watch(
    () => formData.squareFootage.value,
    (newVal) => {
      if (newVal !== null && formData.propertySize.value === null) {
        formData.propertySize.value = newVal
      }
    },
    { immediate: true }
  )

  watch(
    () => formData.additionalUnits.value,
    (newVal) => {
      if (newVal !== null && formData.numberOfUnits.value === null) {
        formData.numberOfUnits.value = newVal
      }
    },
    { immediate: true }
  )
}

export function registerPropertyFormWizardRestoreWatch(
  params: Pick<UsePropertyFormWatchersParams, 'formData' | 'loadedWizardState' | 'isAddressExpanded'>
): void {
  const { formData, loadedWizardState, isAddressExpanded } = params
  if (!loadedWizardState) {
    return
  }

  watch(
    loadedWizardState,
    (newState) => {
      if (!newState?.propertyDetails) {
        return
      }
      const d = newState.propertyDetails
      restorePropertyFormFromDetails(
        formData,
        {
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
          additionalUnits: d.additionalUnits,
        },
        isAddressExpanded
      )
    },
    { immediate: true }
  )
}

export function registerPropertyFormRestoreFromWatch(
  params: Pick<UsePropertyFormWatchersParams, 'formData' | 'restoreFrom' | 'isAddressExpanded'>
): { propertyRestored: { value: boolean } } {
  const { formData, restoreFrom, isAddressExpanded } = params
  const propertyRestored = { value: false }

  if (!restoreFrom) {
    return { propertyRestored }
  }

  watch(
    restoreFrom,
    (data) => {
      if (!propertyRestored.value && data) {
        restorePropertyFormFromDetails(formData, data, isAddressExpanded)
        propertyRestored.value = true
      }
    },
    { immediate: true }
  )

  return { propertyRestored }
}
