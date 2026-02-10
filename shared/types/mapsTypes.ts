/**
 * Shared Maps API Types
 *
 * LEARNING: Single source of truth for Google Maps/Places API types
 * WHY: Eliminates duplication between client and server, ensures contract consistency
 */

/**
 * Maps API error types
 */
export type MapsApiErrorType =
  | 'auth'
  | 'rate_limit'
  | 'invalid'
  | 'not_found'
  | 'network'
  | 'unknown'

/**
 * Autocomplete prediction from Google Places API
 */
export interface AutocompletePrediction {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

/**
 * Address components extracted from place details
 */
export interface AddressComponents {
  streetNumber?: string
  streetName?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

/**
 * Coordinates (latitude/longitude)
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Place details from Places API
 */
export interface PlaceDetails {
  placeId: string
  formattedAddress: string
  addressComponents: AddressComponents
  coordinates: Coordinates
}
