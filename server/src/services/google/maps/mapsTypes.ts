/**
 * Google Maps API Types
 *
 */

import type {
  AddressComponents,
  AutocompletePrediction,
  Coordinates,
  MapsApiErrorType,
  PlaceDetails,
  RouteLocation,
  RouteMatrixStatus,
  RouteMatrixResult
} from '@shared/types/mapsTypes.js'

export type {
  AddressComponents,
  AutocompletePrediction,
  Coordinates,
  MapsApiErrorType,
  PlaceDetails,
  RouteLocation,
  RouteMatrixStatus,
  RouteMatrixResult
}

/**
 * Autocomplete response structure (server-only)
 */
export interface AutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
}

/**
 * Drive time calculation result
 */
export interface DriveTimeResult {
  durationMinutes: number
  durationSeconds: number
  distanceMeters: number
  distanceMiles: number
  source: 'calculated' | 'estimated' | 'cached'
}
