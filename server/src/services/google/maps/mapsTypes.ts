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
  PlaceDetails
} from '@shared/types/mapsTypes.js'
import { GOOGLE_API_STATUS } from './mapsConstants.js'

export type {
  AddressComponents,
  AutocompletePrediction,
  Coordinates,
  MapsApiErrorType,
  PlaceDetails
}

/** Status values for route matrix results (from GOOGLE_API_STATUS) */
export type RouteMatrixStatus =
  | typeof GOOGLE_API_STATUS.OK
  | typeof GOOGLE_API_STATUS.NOT_FOUND
  | typeof GOOGLE_API_STATUS.ZERO_RESULTS

/**
 * Autocomplete response structure (server-only)
 */
export interface AutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
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
  status: RouteMatrixStatus
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
