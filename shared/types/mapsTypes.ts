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

/**
 * Location input for route calculations
 * LEARNING: Routes API accepts placeId, coordinates, or address
 * WHY: Flexibility in how locations are specified (Phase 1.3 type-similarity UNIFY)
 * PATTERN: Priority order for accuracy: placeId > coordinates > address
 */
export interface RouteLocation {
  placeId?: string
  coordinates?: Coordinates
  address?: string
}

/** Status values for route matrix results (matches GOOGLE_API_STATUS) */
export type RouteMatrixStatus = 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS'

/**
 * Route matrix result for a single origin-destination pair
 * LEARNING: Shared between client and server for route/drive time APIs
 */
export interface RouteMatrixResult {
  originIndex: number
  destinationIndex: number
  durationSeconds: number
  distanceMeters: number
  status: RouteMatrixStatus
  condition?: string
}
