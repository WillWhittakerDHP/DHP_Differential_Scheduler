/**
 * Google Maps API Helper Functions
 * 
 * LEARNING: Utility functions for Google Maps API operations
 * WHY: Reusable helper functions for data transformation and utilities
 * PATTERN: Pure helper functions
 */

import { createLogger } from '../../../utils/logger.js'
import { getGoogleMapsApiKey } from '../shared/googleApiConfig.js'
import { GOOGLE_MAPS_API_BASE } from '../shared/googleApiConfig.js'
import {
  AddressComponents,
  AutocompletePrediction,
  Coordinates,
  PlaceDetails,
  RouteLocation
} from './mapsTypes.js'
import { MapsApiError } from './mapsErrorHandler.js'
import { GOOGLE_API_STATUS } from './mapsConstants.js'

/** Raw Google Places Autocomplete API prediction shape */
interface RawAutocompletePrediction {
  place_id: string
  description: string
  structured_formatting?: { main_text?: string; secondary_text?: string }
}

/** Raw Google Place Details API result shape */
interface RawPlaceDetailsResult {
  formatted_address?: string
  geometry?: { location?: { lat?: number; lng?: number } }
  address_components?: Array<{ types: string[]; long_name: string; short_name: string }>
}

/** Raw Google Find Place API candidate shape */
interface RawFindPlaceCandidate {
  place_id?: string
}

/**
 * Validate HTTP response and throw MapsApiError on failure
 * LEARNING: Centralized HTTP error handling for Google API calls
 * WHY: Eliminates duplicated response.ok checks across services
 */
export function validateHttpResponse(response: Response): void {
  if (!response.ok) {
    throw new MapsApiError(
      'network',
      `HTTP error: ${response.status}`,
      response.status >= 500
    )
  }
}

/**
 * Validate Google API response status and throw MapsApiError for known failure statuses
 * LEARNING: Centralized API-level error handling
 * WHY: Eliminates duplicated status-checking branching across Places API functions
 *
 * @param data - Raw API response with status and optional error_message
 * @param options - throwOnZeroResults: if true, also throw for ZERO_RESULTS (used by geocode)
 *                  invalidRequestAsNotFound: if true, INVALID_REQUEST throws not_found (Place Details)
 */
export function validateGoogleApiResponse(
  data: { status: string; error_message?: string },
  options?: { throwOnZeroResults?: boolean; invalidRequestAsNotFound?: boolean }
): void {
  const { throwOnZeroResults = false, invalidRequestAsNotFound = false } = options ?? {}

  if (data.status === GOOGLE_API_STATUS.REQUEST_DENIED) {
    throw new MapsApiError('auth', data.error_message ?? 'API key invalid or restricted')
  }

  if (data.status === GOOGLE_API_STATUS.OVER_QUERY_LIMIT) {
    throw new MapsApiError('rate_limit', 'API quota exceeded', true)
  }

  if (data.status === GOOGLE_API_STATUS.INVALID_REQUEST) {
    const message = invalidRequestAsNotFound ? 'Place not found' : (data.error_message ?? 'Invalid request')
    const type = invalidRequestAsNotFound ? 'not_found' : 'invalid'
    throw new MapsApiError(type, message)
  }

  if (data.status === GOOGLE_API_STATUS.NOT_FOUND) {
    throw new MapsApiError('not_found', 'Place not found')
  }

  if (throwOnZeroResults && data.status === GOOGLE_API_STATUS.ZERO_RESULTS) {
    throw new MapsApiError('not_found', 'No results found')
  }
}

/**
 * Build Places Autocomplete API URL
 */
export function buildAutocompleteUrl(input: string, apiKey: string, sessionToken?: string): string {
  const params = new URLSearchParams({
    input: input.trim(),
    types: 'address',
    components: 'country:us',
    key: apiKey
  })
  if (sessionToken) params.append('sessiontoken', sessionToken)
  return `${GOOGLE_MAPS_API_BASE}/place/autocomplete/json?${params.toString()}`
}

/**
 * Transform raw Google Autocomplete predictions to our format
 */
export function transformPredictions(
  raw: RawAutocompletePrediction[]
): AutocompletePrediction[] {
  return raw.map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting?.main_text ?? p.description,
    secondaryText: p.structured_formatting?.secondary_text ?? ''
  }))
}

/**
 * Build Place Details API URL
 */
export function buildPlaceDetailsUrl(
  placeId: string,
  apiKey: string,
  sessionToken?: string
): string {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'formatted_address,geometry,address_components',
    key: apiKey
  })
  if (sessionToken) params.append('sessiontoken', sessionToken)
  return `${GOOGLE_MAPS_API_BASE}/place/details/json?${params.toString()}`
}

/**
 * Transform raw Place Details result to PlaceDetails
 */
export function transformPlaceResult(
  result: RawPlaceDetailsResult,
  placeId: string
): PlaceDetails {
  const lat = result.geometry?.location?.lat
  const lng = result.geometry?.location?.lng
  if (lat == null || lng == null) {
    throw new MapsApiError('invalid', 'Place has no coordinates')
  }
  const coordinates: Coordinates = { lat, lng }
  const addressComponents = parseAddressComponents(result.address_components ?? [])
  return {
    placeId,
    formattedAddress: result.formatted_address ?? '',
    addressComponents,
    coordinates
  }
}

/**
 * Build Find Place from Text API URL
 */
export function buildFindPlaceUrl(address: string, apiKey: string): string {
  const params = new URLSearchParams({
    input: address.trim(),
    inputtype: 'textquery',
    fields: 'place_id',
    key: apiKey
  })
  return `${GOOGLE_MAPS_API_BASE}/place/findplacefromtext/json?${params.toString()}`
}

const geocodeLogger = createLogger('PlacesGeocode')

/**
 * Execute Find Place API call and extract placeId
 * Returns null on any error (network, auth, not found) - does not throw
 */
export async function executeGeocodeApiCall(address: string): Promise<string | null> {
  try {
    const apiKey = getGoogleMapsApiKey()
    const url = buildFindPlaceUrl(address, apiKey)
    const response = await fetch(url)
    validateHttpResponse(response)

    const data = (await response.json()) as {
      status: string
      error_message?: string
      candidates?: RawFindPlaceCandidate[]
    }
    validateGoogleApiResponse(data, { throwOnZeroResults: true })

    if (data.status !== GOOGLE_API_STATUS.OK) return null

    const candidate = data.candidates?.[0]
    return candidate?.place_id ?? null
  } catch (error) {
    geocodeLogger.warn('Geocoding failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      addressPreview: address.substring(0, 50)
    })
    return null
  }
}

/**
 * Parse address components from Google Places API response
 * LEARNING: Maps Google's address_components to our structured format
 * WHY: Provides normalized address fields for storage
 * PATTERN: Functional approach - map over components
 * 
 * @param components - Array of address components from Google Places API
 * @returns Parsed address components
 */
export function parseAddressComponents(components: Array<{
  types: string[]
  long_name: string
  short_name: string
}>): AddressComponents {
  const result: AddressComponents = {}
  
  for (const component of components) {
    const types = component.types
    
    if (types.includes('street_number')) {
      result.streetNumber = component.long_name
    } else if (types.includes('route')) {
      result.streetName = component.long_name
    } else if (types.includes('locality')) {
      result.city = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.short_name // Use abbreviation for state
    } else if (types.includes('postal_code')) {
      result.postalCode = component.long_name
    } else if (types.includes('country')) {
      result.country = component.short_name // Use country code
    }
  }
  
  return result
}

/**
 * Convert our location format to Routes API waypoint format
 * 
 * LEARNING: Routes API has specific waypoint format
 * WHY: Different from Places API, uses nested structure
 * PATTERN: Priority: placeId > coordinates > address
 * 
 * @param location - Our location format
 * @returns Routes API waypoint format
 * @throws MapsApiError if location has no valid fields
 */
export function toRoutesWaypoint(location: RouteLocation): object {
  if (location.placeId) {
    // Best accuracy - uses exact place identifier
    return { placeId: location.placeId }
  }
  
  if (location.coordinates) {
    // Good accuracy - uses lat/lng
    return {
      location: {
        latLng: {
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng
        }
      }
    }
  }
  
  if (location.address) {
    // Fallback - requires geocoding
    return { address: location.address }
  }
  
  throw new MapsApiError('invalid', 'Location must have placeId, coordinates, or address')
}

/**
 * Generate a session token for billing optimization
 * 
 * LEARNING: Session tokens group autocomplete + details into one billing session
 * WHY: Google charges per session, not per request, when using tokens
 * PATTERN: Generate UUID v4 for session token
 * 
 * @returns UUID v4 string for session token
 */
export function generateSessionToken(): string {
  // Simple UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
