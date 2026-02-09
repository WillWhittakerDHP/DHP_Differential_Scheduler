/**
 * Google Maps API Types
 * 
 * LEARNING: Centralized type definitions for Google Maps API operations
 * WHY: Single source of truth for Maps API types, improves type safety
 * PATTERN: Type definitions module
 */

/**
 * Maps API error types
 * LEARNING: Specific error types for proper error handling
 * WHY: Different errors need different user messages
 */
export type MapsApiErrorType = 
  | 'auth'           // API key issues
  | 'rate_limit'     // Quota exceeded
  | 'invalid'        // Invalid request or response
  | 'not_found'      // Place not found
  | 'network'        // Network error
  | 'unknown'        // Unknown error

/**
 * Autocomplete prediction from Google Places API
 * LEARNING: Structure of a single autocomplete suggestion
 */
export interface AutocompletePrediction {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

/**
 * Autocomplete response structure
 */
export interface AutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
}

/**
 * Address components extracted from place details
 * LEARNING: Parsed address components for structured storage
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
 * Place details response structure
 * LEARNING: Full place details including coordinates
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
 * WHY: Provides flexibility in how locations are specified
 * PATTERN: Priority order for accuracy: placeId > coordinates > address
 */
export interface RouteLocation {
  placeId?: string
  coordinates?: Coordinates
  address?: string
}

/**
 * Route matrix result for a single origin-destination pair
 * LEARNING: Contains duration and distance for a route
 */
export interface RouteMatrixResult {
  originIndex: number
  destinationIndex: number
  durationSeconds: number
  distanceMeters: number
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS'
  condition?: string
}

/**
 * Drive time calculation result
 * LEARNING: Convenience result type for single origin-destination calculations
 */
export interface DriveTimeResult {
  durationMinutes: number
  durationSeconds: number
  distanceMeters: number
  distanceMiles: number
  source: 'calculated' | 'estimated' | 'cached'
}
