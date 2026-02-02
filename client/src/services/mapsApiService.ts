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
import { createLogger } from '@/utils/logger'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'

const logger = createLogger('mapsApiService')
const { recordApiCall } = useApiCallStatus()

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Error types for Maps API operations
 * LEARNING: Explicit error types for proper error handling
 * WHY: Different errors need different user messages
 */
export type MapsApiErrorType = 
  | 'auth'           // API key issues
  | 'rate_limit'     // Quota exceeded
  | 'invalid'        // Invalid request
  | 'not_found'      // Place not found
  | 'network_error'  // Network error
  | 'unknown'        // Unknown error

/**
 * Maps API error class
 * LEARNING: Typed errors for consistent error handling
 * PATTERN: Matches CalendarApiError pattern
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
 * LEARNING: Maps error types to user-facing messages
 * WHY: Technical errors should be translated for users
 */
export function getErrorMessage(type: MapsApiErrorType): string {
  const messages: Record<MapsApiErrorType, string> = {
    auth: 'Address lookup is not configured.',
    rate_limit: 'Too many requests. Please try again in a moment.',
    invalid: 'Invalid address lookup request.',
    not_found: 'Address not found.',
    network_error: 'Could not reach address service. Check your connection.',
    unknown: 'An unexpected error occurred.'
  }
  return messages[type]
}

/**
 * Autocomplete prediction from server
 * LEARNING: Structure of a single autocomplete suggestion
 */
export interface AutocompletePrediction {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
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
 * Place details from server
 * LEARNING: Full place details including coordinates
 */
export interface PlaceDetails {
  placeId: string
  formattedAddress: string
  addressComponents: AddressComponents
  coordinates: Coordinates
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
 * Handle API errors and convert to MapsApiError
 * 
 * LEARNING: Map various error types to specific MapsApiError
 * WHY: Different errors need different handling and user messages
 * PATTERN: Error type detection and translation
 */
function handleApiError(error: unknown): MapsApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; type?: string; retryable?: boolean }>
    
    // Check for specific error types from server
    if (axiosError.response?.data?.type) {
      const serverType = axiosError.response.data.type
      const errorType = mapServerErrorType(serverType)
      return new MapsApiError(
        errorType,
        axiosError.response.data.error || 'API error',
        axiosError.response.data.retryable || false
      )
    }
    
    // Check for rate limit
    if (axiosError.response?.status === 429) {
      return new MapsApiError('rate_limit', 'API rate limit exceeded', true)
    }
    
    // Check for auth error
    if (axiosError.response?.status === 401) {
      return new MapsApiError('auth', 'API key invalid or not configured')
    }
    
    // Check for not found
    if (axiosError.response?.status === 404) {
      return new MapsApiError('not_found', 'Place not found')
    }
    
    // Check for network error (no response)
    if (!axiosError.response) {
      return new MapsApiError(
        'network_error',
        'Network error: Could not connect to server',
        true
      )
    }
    
    // Default to invalid for other errors
    return new MapsApiError(
      'invalid',
      axiosError.response?.data?.error || 'Invalid response from server'
    )
  }
  
  // Unknown error type
  return new MapsApiError(
    'unknown',
    error instanceof Error ? error.message : 'Unknown error'
  )
}

/**
 * Map server error type to client error type
 * LEARNING: Server uses slightly different type names
 */
function mapServerErrorType(serverType: string): MapsApiErrorType {
  const typeMap: Record<string, MapsApiErrorType> = {
    'auth': 'auth',
    'rate_limit': 'rate_limit',
    'invalid': 'invalid',
    'not_found': 'not_found',
    'network': 'network_error',
    'unknown': 'unknown'
  }
  return typeMap[serverType] || 'unknown'
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
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS'
}

/**
 * Fetch drive time between two locations
 * 
 * LEARNING: Get drive time from Routes API via server proxy with fallback support
 * WHY: Needed for dynamic drive time buffer calculations
 * PATTERN: Location priority: placeId > coordinates > address
 * 
 * Session 2.2.2: Created for Routes API integration
 * Session 2.2.3: Added fallback support and source metadata
 * 
 * @param origin Origin location (placeId, coordinates, or address)
 * @param destination Destination location (placeId, coordinates, or address)
 * @param useTraffic Whether to use real-time traffic (default: true)
 * @param fallbackMinutes Optional fallback minutes to use if API fails or location missing
 * @returns Drive time result with source metadata, or null if route not found and no fallback
 * @throws MapsApiError on failure (only if no fallback provided)
 */
export async function fetchDriveTime(
  origin: RouteLocation,
  destination: RouteLocation,
  useTraffic: boolean = true,
  fallbackMinutes?: number
): Promise<DriveTimeResult | null> {
  // Validate inputs - if missing and fallback provided, return fallback immediately
  if (!origin.placeId && !origin.coordinates && !origin.address) {
    if (fallbackMinutes !== undefined) {
      logger.warn('[fetchDriveTime] Missing origin location, using fallback')
      return {
        durationMinutes: fallbackMinutes,
        durationSeconds: fallbackMinutes * 60,
        distanceMeters: 0,
        distanceMiles: 0,
        _meta: { source: 'estimated' }
      }
    }
    throw new MapsApiError('invalid', 'Origin must have placeId, coordinates, or address')
  }
  
  if (!destination.placeId && !destination.coordinates && !destination.address) {
    if (fallbackMinutes !== undefined) {
      logger.warn('[fetchDriveTime] Missing destination location, using fallback')
      return {
        durationMinutes: fallbackMinutes,
        durationSeconds: fallbackMinutes * 60,
        distanceMeters: 0,
        distanceMiles: 0,
        _meta: { source: 'estimated' }
      }
    }
    throw new MapsApiError('invalid', 'Destination must have placeId, coordinates, or address')
  }
  
  const startTime = performance.now()
  logger.debug('[fetchDriveTime] Calculating drive time', fallbackMinutes !== undefined ? `(fallback: ${fallbackMinutes} min)` : '')
  
  try {
    // Build URL with query params
    const params = new URLSearchParams()
    
    // Add origin
    if (origin.placeId) {
      params.append('originPlaceId', origin.placeId)
    } else if (origin.coordinates) {
      params.append('originLat', origin.coordinates.lat.toString())
      params.append('originLng', origin.coordinates.lng.toString())
    } else if (origin.address) {
      params.append('originAddress', origin.address)
    }
    
    // Add destination
    if (destination.placeId) {
      params.append('destPlaceId', destination.placeId)
    } else if (destination.coordinates) {
      params.append('destLat', destination.coordinates.lat.toString())
      params.append('destLng', destination.coordinates.lng.toString())
    } else if (destination.address) {
      params.append('destAddress', destination.address)
    }
    
    // Add traffic preference
    params.append('useTraffic', useTraffic.toString())
    
    // Add fallback if provided
    if (fallbackMinutes !== undefined) {
      params.append('fallbackMinutes', fallbackMinutes.toString())
    }
    
    const response = await axios.get<DriveTimeResult>(
      `${API_BASE_URL}/api/v1/external/maps/drive-time?${params.toString()}`
    )
    
    const duration = performance.now() - startTime
    const source = response.data._meta?.source || 'calculated'
    logger.debug(
      `[fetchDriveTime] Got result: ${response.data.durationMinutes} minutes ` +
      `(source: ${source}, duration: ${duration.toFixed(0)}ms${duration >= 2000 ? ' ⚠ slow' : ''})`
    )
    
    // Record successful Routes API call (only if source is 'calculated' or 'cache', not 'estimated')
    if (source === 'calculated' || source === 'cache') {
      recordApiCall('routes', 'hit')
    }
    
    // Warn if performance is slow
    if (duration >= 2000) {
      logger.warn(
        `[fetchDriveTime] Performance warning: API call took ${duration.toFixed(0)}ms ` +
        `(target: <2000ms). Origin: ${origin.placeId ? 'placeId' : origin.coordinates ? 'coordinates' : 'address'}, ` +
        `Destination: ${destination.placeId ? 'placeId' : destination.coordinates ? 'coordinates' : 'address'}`
      )
    }
    
    return response.data
    
  } catch (error) {
    const duration = performance.now() - startTime
    const apiError = handleApiError(error)
    
    // Handle 404 as "not found" - use fallback if available
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      logger.warn(
        `[fetchDriveTime] No route found between locations (after ${duration.toFixed(0)}ms)`,
        {
          originType: origin.placeId ? 'placeId' : origin.coordinates ? 'coordinates' : 'address',
          destinationType: destination.placeId ? 'placeId' : destination.coordinates ? 'coordinates' : 'address',
          hasFallback: fallbackMinutes !== undefined
        }
      )
      if (fallbackMinutes !== undefined) {
        // API call succeeded but no route found - using fallback, don't record as error
        return {
          durationMinutes: fallbackMinutes,
          durationSeconds: fallbackMinutes * 60,
          distanceMeters: 0,
          distanceMiles: 0,
          _meta: { source: 'estimated' }
        }
      }
      // No fallback available - record as error
      recordApiCall('routes', 'error')
      return null
    }
    
    // For other errors, use fallback if available
    if (fallbackMinutes !== undefined) {
      // Using fallback - don't record as error since we have a result
      logger.warn(
        `[fetchDriveTime] API error (${apiError.type}) after ${duration.toFixed(0)}ms, ` +
        `using fallback: ${fallbackMinutes} minutes`,
        {
          errorType: apiError.type,
          errorMessage: apiError.message,
          retryable: apiError.retryable,
          originType: origin.placeId ? 'placeId' : origin.coordinates ? 'coordinates' : 'address',
          destinationType: destination.placeId ? 'placeId' : destination.coordinates ? 'coordinates' : 'address'
        }
      )
      return {
        durationMinutes: fallbackMinutes,
        durationSeconds: fallbackMinutes * 60,
        distanceMeters: 0,
        distanceMiles: 0,
        _meta: { source: 'estimated' }
      }
    }
    
    // No fallback available - record as error and throw
    recordApiCall('driveTime', 'error')
    
    // No fallback available - throw error with context
    logger.error(
      `[fetchDriveTime] Error after ${duration.toFixed(0)}ms:`,
      apiError.type,
      apiError.message,
      {
        errorType: apiError.type,
        retryable: apiError.retryable,
        originType: origin.placeId ? 'placeId' : origin.coordinates ? 'coordinates' : 'address',
        destinationType: destination.placeId ? 'placeId' : destination.coordinates ? 'coordinates' : 'address'
      }
    )
    throw apiError
  }
}

/**
 * Fetch drive times for multiple origin-destination pairs (batch)
 * 
 * LEARNING: Batch calculation using Routes API computeRouteMatrix
 * WHY: More efficient than multiple single calls for multiple routes
 * PATTERN: Elements = origins × destinations (max 625)
 * 
 * Session 2.2.2: Created for Routes API integration
 * 
 * @param origins Array of origin locations
 * @param destinations Array of destination locations
 * @param useTraffic Whether to use real-time traffic (default: true)
 * @returns Array of route results
 * @throws MapsApiError on failure
 */
export async function fetchRouteMatrix(
  origins: RouteLocation[],
  destinations: RouteLocation[],
  useTraffic: boolean = true
): Promise<RouteMatrixResult[]> {
  // Validate inputs
  if (!origins.length) {
    throw new MapsApiError('invalid', 'At least one origin is required')
  }
  if (!destinations.length) {
    throw new MapsApiError('invalid', 'At least one destination is required')
  }
  
  // Check element limit
  const elementCount = origins.length * destinations.length
  if (elementCount > 625) {
    throw new MapsApiError('invalid', `Element count ${elementCount} exceeds maximum 625`)
  }
  
  logger.debug('[fetchRouteMatrix] Calculating', elementCount, 'routes')
  
  try {
    const response = await axios.post<{ results: RouteMatrixResult[] }>(
      `${API_BASE_URL}/api/v1/external/maps/route-matrix`,
      { origins, destinations, useTraffic }
    )
    
    logger.debug('[fetchRouteMatrix] Got', response.data.results.length, 'results')
    
    return response.data.results
    
  } catch (error) {
    const apiError = handleApiError(error)
    logger.error('[fetchRouteMatrix] Error:', apiError.type, apiError.message)
    throw apiError
  }
}
