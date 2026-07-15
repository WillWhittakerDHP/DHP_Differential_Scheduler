/**
 * WHY: Centralize ref writers for MLS enrichment (keeps composable handlers short for complexity audit).
 */

import type { PropertyFormData } from '@/types/propertyForm'
import type { PropertyEnrichmentFormWriters } from '@/utils/booking/propertyEnrichmentApply'

export function buildPropertyEnrichmentWritersFromFormData(
  formData: PropertyFormData
): PropertyEnrichmentFormWriters {
  return {
    setMlsNumber: (v) => {
      formData.mlsNumber.value = v
    },
    setSquareFootage: (v) => {
      formData.squareFootage.value = v
    },
    setBedrooms: (v) => {
      formData.bedrooms.value = v
    },
    setBathrooms: (v) => {
      formData.bathrooms.value = v
    },
    setFoundationAccess: (v) => {
      formData.foundationAccess.value = v
    },
    setAdditionalUnits: (v) => {
      formData.additionalUnits.value = v
    },
    setHvacCount: (v) => {
      formData.hvacCount.value = v
    },
    setWaterHeaterCount: (v) => {
      formData.waterHeaterCount.value = v
    },
    setKitchenApplianceCount: (v) => {
      formData.kitchenApplianceCount.value = v
    },
    setSource: (v) => {
      if (formData.source) {
        formData.source.value = v
      }
    },
    setSuggestedBlockInstanceIds: (v) => {
      if (formData.suggestedBlockInstanceIds) {
        formData.suggestedBlockInstanceIds.value = v
      }
    },
    setPropertySize: (v) => {
      formData.propertySize.value = v
    },
  }
}
