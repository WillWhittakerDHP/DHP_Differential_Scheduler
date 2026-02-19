/**
 * Google Maps API Types
 *
 * LEARNING: Re-exports shared types, defines server-only types
 * WHY: Single source of truth via shared/types/mapsTypes.ts
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
 * LEARNING: Convenience result type for single origin-destination calculations
 */
export interface DriveTimeResult {
  durationMinutes: number
  durationSeconds: number
  distanceMeters: number
  distanceMiles: number
  source: 'calculated' | 'estimated' | 'cached'
}
