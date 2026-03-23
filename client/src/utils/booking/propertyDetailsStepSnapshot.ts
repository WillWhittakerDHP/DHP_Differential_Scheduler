/**
 * WHY: Snapshot of property step refs into PropertyDetailsData (pure values in → data out).
 */

import type { PropertyDetailsData, PropertyFormData, PropertySource } from '@/types/propertyForm'

interface PropertyDetailsFormValues {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
  candidatePlaceId: string | undefined
  candidateCoordinates: { lat: number; lng: number } | undefined
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

export function propertyDetailsFormValuesFromRefs(formData: PropertyFormData): PropertyDetailsFormValues {
  return {
    address: formData.address.value,
    unit: formData.unit.value,
    city: formData.city.value,
    state: formData.state.value,
    zipCode: formData.zipCode.value,
    candidatePlaceId: formData.candidatePlaceId.value,
    candidateCoordinates: formData.candidateCoordinates.value,
    propertySize: formData.propertySize.value,
    numberOfUnits: formData.numberOfUnits.value,
    mlsNumber: formData.mlsNumber.value,
    squareFootage: formData.squareFootage.value,
    bedrooms: formData.bedrooms.value,
    bathrooms: formData.bathrooms.value,
    foundationAccess: formData.foundationAccess.value,
    additionalUnits: formData.additionalUnits.value,
    source: formData.source?.value,
    suggestedBlockInstanceIds: formData.suggestedBlockInstanceIds?.value,
  }
}

export function buildPropertyDetailsStepData(values: PropertyDetailsFormValues): PropertyDetailsData {
  return {
    address: values.address,
    unit: values.unit,
    city: values.city,
    state: values.state,
    zipCode: values.zipCode,
    candidatePlaceId: values.candidatePlaceId,
    candidateCoordinates: values.candidateCoordinates,
    propertySize: values.propertySize,
    numberOfUnits: values.numberOfUnits,
    mlsNumber: values.mlsNumber,
    squareFootage: values.squareFootage,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    foundationAccess: values.foundationAccess,
    additionalUnits: values.additionalUnits,
    source: values.source,
    suggestedBlockInstanceIds: values.suggestedBlockInstanceIds,
  }
}
