/**
 * WHY: Maps Places addressComponents into property form fields (pure).
 */

import type { AddressComponents, Coordinates } from '@shared/types/mapsTypes'

export interface PlaceAddressFormPatch {
  address: string
  city: string
  state: string
  zipCode: string
  candidatePlaceId: string
  candidateCoordinates: Coordinates
}

function addressField(
  value: string | undefined | null,
  fieldName: string,
  onMissingComponent: (fieldName: string) => void
): string {
  if (value === undefined || value === null) {
    onMissingComponent(fieldName)
    return ''
  }
  return value
}

export function placeAddressPatchFromComponents(
  addressComponents: AddressComponents,
  placeId: string,
  coordinates: Coordinates,
  onMissingComponent: (fieldName: string) => void
): PlaceAddressFormPatch {
  const streetNumber = addressField(addressComponents.streetNumber, 'streetNumber', onMissingComponent)
  const streetName = addressField(addressComponents.streetName, 'streetName', onMissingComponent)
  return {
    address: `${streetNumber} ${streetName}`.trim(),
    city: addressField(addressComponents.city, 'city', onMissingComponent),
    state: addressField(addressComponents.state, 'state', onMissingComponent),
    zipCode: addressField(addressComponents.postalCode, 'postalCode', onMissingComponent),
    candidatePlaceId: placeId,
    candidateCoordinates: coordinates,
  }
}
