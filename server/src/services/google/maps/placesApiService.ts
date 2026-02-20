/**
 * Google Places API Service
 *
 * LEARNING: Service for Google Places API operations (autocomplete, place details, geocoding)
 * WHY: Centralized Places API operations with rate limiting and error handling
 * PATTERN: Service layer with shared utilities
 */

import { createLogger } from '../../../utils/logger.js'
import { UNKNOWN_ERROR_MESSAGE } from '../../../constants/router.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { getGoogleMapsApiKey } from '../shared/googleApiConfig.js'
import { MapsApiError } from './mapsErrorHandler.js'
import {
  buildAutocompleteUrl,
  buildPlaceDetailsUrl,
  executeGeocodeApiCall,
  generateSessionToken,
  transformPlaceResult,
  transformPredictions,
  validateGoogleApiResponse,
  validateHttpResponse
} from './mapsHelpers.js'
import { getCachedPlaceId, cachePlaceId, normalizeAddress } from '../../addressGeocodingCache.js'
import { GOOGLE_API_STATUS } from './mapsConstants.js'
import type { AutocompletePrediction, PlaceDetails } from './mapsTypes.js'

const logger = createLogger('PlacesApiService')

// In-flight deduplication: reuse pending promises for the same address
// WHY: Prevents duplicate API calls when multiple events share the same location
const inflightGeocoding = new Map<string, Promise<string | null>>()

/**
 * Get address autocomplete suggestions
 */
export async function getAutocompleteSuggestions(
  input: string,
  sessionToken?: string
): Promise<AutocompletePrediction[]> {
  if (!input || input.trim().length < 3) return []

  return withRateLimit('google-maps', async () => {
    const apiKey = getGoogleMapsApiKey()
    const url = buildAutocompleteUrl(input, apiKey, sessionToken)
    logger.debug('Fetching autocomplete', { input })

    try {
      const response = await fetch(url)
      validateHttpResponse(response)

      const data = (await response.json()) as {
        status: string
        error_message?: string
        predictions?: Array<{
          place_id: string
          description: string
          structured_formatting?: { main_text?: string; secondary_text?: string }
        }>
      }
      logger.debug('Autocomplete API status', { status: data.status })
      if (data.error_message) logger.error('API error_message', { errorMessage: data.error_message })

      validateGoogleApiResponse(data)
      if (data.status === GOOGLE_API_STATUS.ZERO_RESULTS || !data.predictions) return []

      return transformPredictions(data.predictions)
    } catch (error) {
      logger.error(error)
      if (error instanceof MapsApiError) throw error
      logger.error('Autocomplete error', { error })
      throw new MapsApiError(
        'network',
        error instanceof Error ? error.message : 'Network error',
        true
      )
    }
  })
}

/**
 * Get place details including coordinates
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails> {
  if (!placeId) throw new MapsApiError('invalid', 'Place ID is required')

  return withRateLimit('google-maps', async () => {
    const apiKey = getGoogleMapsApiKey()
    const url = buildPlaceDetailsUrl(placeId, apiKey, sessionToken)
    logger.debug('Fetching place details', { placeId })

    try {
      const response = await fetch(url)
      validateHttpResponse(response)

      const data = (await response.json()) as {
        status: string
        error_message?: string
        result?: Parameters<typeof transformPlaceResult>[0]
      }
      validateGoogleApiResponse(data, { invalidRequestAsNotFound: true })
      if (!data.result) throw new MapsApiError('invalid', 'Invalid response from Places API')

      return transformPlaceResult(data.result, placeId)
    } catch (error) {
      logger.error(error)
      if (error instanceof MapsApiError) throw error
      logger.error('Place details error', { error })
      throw new MapsApiError(
        'network',
        error instanceof Error ? error.message : 'Network error',
        true
      )
    }
  })
}

/**
 * Geocode address string to placeId using Places API Find Place
 */
export async function geocodeAddressToPlaceId(address: string): Promise<string | null> {
  if (!address || typeof address !== 'string' || address.trim().length === 0) return null

  const cached = getCachedPlaceId(address)
  if (cached !== undefined) {
    logger.debug('Geocoding cache hit', {
      address: address.substring(0, 50),
      placeId: cached ?? '(not found)'
    })
    return cached
  }

  const normalizedKey = normalizeAddress(address)
  const inflight = inflightGeocoding.get(normalizedKey)
  if (inflight) return inflight

  logger.debug('Geocoding cache miss, calling API', { address: address.substring(0, 50) })

  const geocodingPromise = (async (): Promise<string | null> => {
    try {
      const placeId = await withRateLimit('google-maps', () => executeGeocodeApiCall(address))
      cachePlaceId(address, placeId)
      return placeId
    } catch (error) {
      logger.warn('Geocoding error', {
        error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
      })
      cachePlaceId(address, null)
      return null
    } finally {
      inflightGeocoding.delete(normalizedKey)
    }
  })()

  inflightGeocoding.set(normalizedKey, geocodingPromise)
  return geocodingPromise
}

// Re-export generateSessionToken for convenience
export { generateSessionToken }
