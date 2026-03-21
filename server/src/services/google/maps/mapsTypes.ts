
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

export interface AutocompleteResponse {
  predictions: AutocompletePrediction[]
  status: string
}

export interface DriveTimeResult {
  durationMinutes: number
  durationSeconds: number
  distanceMeters: number
  distanceMiles: number
  source: 'calculated' | 'estimated' | 'cached'
}
