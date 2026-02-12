/**
 * Client-side Maps API Service
 *
 * LEARNING: Service layer for Google Maps API calls via server proxy
 * WHY: Centralized API calls, error handling, response transformation
 * PATTERN: Service layer between components and server endpoints
 *
 * Session 2.2.1: Created for Address Autocomplete
 */

import axios, { AxiosError } from 'axios'
import { UNKNOWN_ERROR_MESSAGE } from '@/constants/errorMessages'
import { MAPS_ERROR_MESSAGES, type RouteMatrixStatus } from '@/constants/mapsConstants'
import { createLogger } from '@/utils/logger'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'
import type {
  AddressComponents,
  AutocompletePrediction,
  Coordinates,
  MapsApiErrorType,
  PlaceDetails
} from '@shared/types/mapsTypes'

export type { AddressComponents, AutocompletePrediction, Coordinates, MapsApiErrorType, PlaceDetails }

const logger = createLogger('mapsApiService')
const { recordApiCall } = useApiCallStatus()

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Maps API error class
 */
export class MapsApiError extends Error {
  constructor(
    public type: MapsApiErrorType,
    message: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'MapsApiError'
  }
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(type: MapsApiErrorType): string {
  return MAPS_ERROR_MESSAGES[type] ?? MAPS_ERROR_MESSAGES.unknown
}

/**
 * Generate a new session token for billing optimization
 * 
 * LEARNING: Session tokens group autocomplete + details into one billing session
 * WHY: Reduces cost when user selects from suggestions
 * PATTERN: Get token from server (maintains consistent token format)
 * 
 * @returns Session token string
 */
export async function getSessionToken(): Promise<string> {
  try {
    const response = await axios.get<{ sessionToken: string }>(
      `${API_BASE_URL}/api/v1/external/maps/session-token`
    )
    return response.data.sessionToken
  } catch (_error) {
    // Generate client-side as fallback
    logger.warn('[getSessionToken] Failed to get token from server, generating locally')
    return crypto.randomUUID()
  }
}

/**
 * Fetch address autocomplete suggestions
 * 
 * LEARNING: Main function for getting address suggestions as user types
 * WHY: Provides real-time address suggestions for better UX
 * PATTERN: Debounce should be handled by caller, this just makes the request
 * 
 * @param input User's input text (minimum 3 characters)
 * @param sessionToken Optional session token for billing optimization
 * @returns Array of autocomplete predictions
 * @throws MapsApiError on failure
 */
export async function fetchAutocompleteSuggestions(
  input: string,
  sessionToken?: string
): Promise<AutocompletePrediction[]> {
  // Don't call API if input is too short
  if (!input || input.trim().length < 3) {
    logger.debug('[fetchAutocompleteSuggestions] Input too short, returning empty')
    return []
  }
  
  logger.debug('[fetchAutocompleteSuggestions] Fetching for:', input)
  
  try {
    // Build URL with query params
    const params = new URLSearchParams({ input: input.trim() })
    if (sessionToken) {
      params.append('sessionToken', sessionToken)
    }
    
    const response = await axios.get<{ predictions: AutocompletePrediction[] }>(
      `${API_BASE_URL}/api/v1/external/maps/autocomplete?${params.toString()}`
    )
    
    logger.debug('[fetchAutocompleteSuggestions] Got', response.data.predictions.length, 'suggestions')
    
    // Record successful Places API call
    recordApiCall('places', 'hit')
    
    return response.data.predictions
    
  } catch (error) {
    const apiError = handleApiError(error)
    logger.error('[fetchAutocompleteSuggestions] Error:', apiError.type, apiError.message)
    
    // Record failed Places API call
    recordApiCall('places', 'error')
    
    throw apiError
  }
}

/**
 * Fetch place details including coordinates
 * 
 * LEARNING: Get full address and coordinates after user selects a suggestion
 * WHY: Need coordinates for distance calculations
 * PATTERN: Session token ends the billing session on this call
 * 
 * @param placeId Google Place ID from autocomplete selection
 * @param sessionToken Optional session token (ends the session for billing)
 * @returns Place details with coordinates
 * @throws MapsApiError on failure
 */
export async function fetchPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails> {
  if (!placeId) {
    throw new MapsApiError('invalid', 'Place ID is required')
  }
  
  logger.debug('[fetchPlaceDetails] Fetching details for:', placeId)
  
  try {
    // Build URL with query params
    const params = new URLSearchParams({ placeId })
    if (sessionToken) {
      params.append('sessionToken', sessionToken)
    }
    
    const response = await axios.get<PlaceDetails>(
      `${API_BASE_URL}/api/v1/external/maps/place-details?${params.toString()}`
    )
    
    logger.debug('[fetchPlaceDetails] Got details:', response.data.formattedAddress)
    
    // Record successful Places API call
    recordApiCall('places', 'hit')
    
    return response.data
    
  } catch (error) {
    const apiError = handleApiError(error)
    logger.error('[fetchPlaceDetails] Error:', apiError.type, apiError.message)
    
    // Record failed Places API call
    recordApiCall('places', 'error')
    
    throw apiError
  }
}

/**
 * Map Axios error to MapsApiError
 */
function mapAxiosErrorToMapsError(
  axiosError: AxiosError<{ error?: string; type?: string; retryable?: boolean }>
): MapsApiError {
  if (axiosError.response?.data?.type) {
    const errorType = mapServerErrorType(axiosError.response.data.type)
    return new MapsApiError(
      errorType,
      axiosError.response.data.error ?? 'API error',
      axiosError.response.data.retryable ?? false
    )
  }
  if (axiosError.response?.status === 429) {
    return new MapsApiError('rate_limit', 'API rate limit exceeded', true)
  }
  if (axiosError.response?.status === 401) {
    return new MapsApiError('auth', 'API key invalid or not configured')
  }
  if (axiosError.response?.status === 404) {
    return new MapsApiError('not_found', 'Place not found')
  }
  if (!axiosError.response) {
    return new MapsApiError('network', 'Network error: Could not connect to server', true)
  }
  const rawError = axiosError.response?.data?.error
  const message = rawError !== undefined && rawError !== null ? rawError : 'Invalid response from server'
  return new MapsApiError('invalid', message)
}

function mapServerErrorType(serverType: string): MapsApiErrorType {
  const typeMap: Record<string, MapsApiErrorType> = {
    auth: 'auth',
    rate_limit: 'rate_limit',
    invalid: 'invalid',
    not_found: 'not_found',
    network: 'network',
    unknown: 'unknown'
  }
  return typeMap[serverType] ?? 'unknown'
}

function handleApiError(error: unknown): MapsApiError {
  if (axios.isAxiosError(error)) {
    return mapAxiosErrorToMapsError(error)
  }
  return new MapsApiError(
    'unknown',
    error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
  )
}

// =============================================================================
// ROUTES API - Session 2.2.2
// =============================================================================

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
 * Drive time result from Routes API
 * LEARNING: Contains duration and distance for a route with source metadata
 * WHY: Indicates whether time is calculated (from API), estimated (fallback), or cached
 * Session 2.2.3: Added 'estimated' source type for fallback values
 */
export interface DriveTimeResult {
  durationMinutes: number
  durationSeconds: number
  distanceMeters: number
  distanceMiles: number
  _meta?: {
    source: 'calculated' | 'estimated' | 'cache'
  }
}

/**
 * Route matrix result for a single origin-destination pair
 * LEARNING: Used for batch calculations
 */
export interface RouteMatrixResult {
  originIndex: number
  destinationIndex: number
  durationSeconds: number
  distanceMeters: number
  status: RouteMatrixStatus
}

// Phase 9: Removed fetchDriveTime and fetchRouteMatrix
// WHY: Drive times are now calculated server-side via fetchComputedAvailabilityData

