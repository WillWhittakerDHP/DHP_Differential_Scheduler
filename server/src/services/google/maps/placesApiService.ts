/**
 * Google Places API Service
 * 
 * LEARNING: Service for Google Places API operations (autocomplete, place details, geocoding)
 * WHY: Centralized Places API operations with rate limiting and error handling
 * PATTERN: Service layer with shared utilities
 */

import { createLogger } from '../../../utils/logger.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { getGoogleMapsApiKey, GOOGLE_MAPS_API_BASE } from '../shared/googleApiConfig.js'
import { MapsApiError } from './mapsErrorHandler.js'
import { parseAddressComponents, generateSessionToken } from './mapsHelpers.js'
import type {
  AutocompletePrediction,
  PlaceDetails,
  AddressComponents,
  Coordinates
} from './mapsTypes.js'

const logger = createLogger('PlacesApiService')

/**
 * Get address autocomplete suggestions
 * 
 * LEARNING: Calls Google Places Autocomplete API
 * WHY: Provides address suggestions as user types
 * PATTERN: Rate limiting before API call
 * 
 * @param input - User's input text
 * @param sessionToken - Optional session token for billing optimization
 * @returns Array of autocomplete predictions
 */
export async function getAutocompleteSuggestions(
  input: string,
  sessionToken?: string
): Promise<AutocompletePrediction[]> {
  if (!input || input.trim().length < 3) {
    return []
  }
  
  return await withRateLimit('google-maps', async () => {
    const apiKey = getGoogleMapsApiKey()
    
    // Build URL with parameters
    const params = new URLSearchParams({
      input: input.trim(),
      types: 'address',
      components: 'country:us', // Restrict to US addresses
      key: apiKey
    })
    
    if (sessionToken) {
      params.append('sessiontoken', sessionToken)
    }
    
    const url = `${GOOGLE_MAPS_API_BASE}/place/autocomplete/json?${params.toString()}`
    
    logger.debug('Fetching autocomplete', { input })
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new MapsApiError(
          'network',
          `HTTP error: ${response.status}`,
          response.status >= 500
        )
      }
      
      const data = await response.json()
      
      // Log raw response for debugging
      logger.debug('Autocomplete API status', { status: data.status })
      if (data.error_message) {
        logger.error('API error_message', { errorMessage: data.error_message })
      }
      
      // Handle API-level errors
      if (data.status === 'REQUEST_DENIED') {
        throw new MapsApiError('auth', data.error_message || 'API key invalid or restricted')
      }
      
      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new MapsApiError('rate_limit', 'API quota exceeded', true)
      }
      
      if (data.status === 'INVALID_REQUEST') {
        throw new MapsApiError('invalid', data.error_message || 'Invalid autocomplete request')
      }
      
      // Handle zero results
      if (data.status === 'ZERO_RESULTS' || !data.predictions) {
        return []
      }
      
      // Transform predictions to our format
      const predictions: AutocompletePrediction[] = data.predictions.map((p: any) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || ''
      }))
      
      logger.debug('Found suggestions', { count: predictions.length })
      
      return predictions
      
    } catch (error) {
      if (error instanceof MapsApiError) {
        throw error
      }
      
      // Network or parsing error
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
 * 
 * LEARNING: Calls Google Places Details API
 * WHY: Gets full address and coordinates for distance calculations
 * PATTERN: Rate limiting, session token for billing
 * 
 * @param placeId - Google Place ID from autocomplete
 * @param sessionToken - Optional session token (ends the session for billing)
 * @returns Place details with coordinates
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails> {
  if (!placeId) {
    throw new MapsApiError('invalid', 'Place ID is required')
  }
  
  return await withRateLimit('google-maps', async () => {
    const apiKey = getGoogleMapsApiKey()
    
    // Build URL with parameters
    // LEARNING: Only request fields we need to minimize cost
    // WHY: Google charges per field category
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'formatted_address,geometry,address_components',
      key: apiKey
    })
    
    if (sessionToken) {
      params.append('sessiontoken', sessionToken)
    }
    
    const url = `${GOOGLE_MAPS_API_BASE}/place/details/json?${params.toString()}`
    
    logger.debug('Fetching place details', { placeId })
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new MapsApiError(
          'network',
          `HTTP error: ${response.status}`,
          response.status >= 500
        )
      }
      
      const data = await response.json()
      
      // Handle API-level errors
      if (data.status === 'REQUEST_DENIED') {
        throw new MapsApiError('auth', 'API key invalid or restricted')
      }
      
      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new MapsApiError('rate_limit', 'API quota exceeded', true)
      }
      
      if (data.status === 'NOT_FOUND' || data.status === 'INVALID_REQUEST') {
        throw new MapsApiError('not_found', 'Place not found')
      }
      
      if (!data.result) {
        throw new MapsApiError('invalid', 'Invalid response from Places API')
      }
      
      const result = data.result
      
      // Extract coordinates
      const coordinates: Coordinates = {
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng
      }
      
      if (!coordinates.lat || !coordinates.lng) {
        throw new MapsApiError('invalid', 'Place has no coordinates')
      }
      
      // Parse address components
      const addressComponents = parseAddressComponents(result.address_components || [])
      
      const placeDetails: PlaceDetails = {
        placeId,
        formattedAddress: result.formatted_address || '',
        addressComponents,
        coordinates
      }
      
      logger.debug('Got place details', { formattedAddress: placeDetails.formattedAddress })
      
      return placeDetails
      
    } catch (error) {
      if (error instanceof MapsApiError) {
        throw error
      }
      
      // Network or parsing error
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
 * 
 * LEARNING: Converts address text to placeId for accurate routing
 * WHY: Calendar events have address strings, need placeIds for drive time calculations
 * PATTERN: Uses Find Place API with address input, returns placeId
 * 
 * Session 2.2.3: Added for server-side placeId standardization
 * 
 * @param address - Address string to geocode
 * @returns placeId if found, null if not found or error
 */
export async function geocodeAddressToPlaceId(address: string): Promise<string | null> {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return null
  }
  
  try {
    return await withRateLimit('google-maps', async () => {
      const apiKey = getGoogleMapsApiKey()
      
      // Build URL with parameters
      // LEARNING: Find Place API searches by text query and returns place_id
      // WHY: More efficient than Geocoding API for this use case
      const params = new URLSearchParams({
        input: address.trim(),
        inputtype: 'textquery',
        fields: 'place_id', // Only request place_id to minimize cost
        key: apiKey
      })
      
      const url = `${GOOGLE_MAPS_API_BASE}/place/findplacefromtext/json?${params.toString()}`
      
      logger.debug('Geocoding address to placeId', { address: address.substring(0, 50) })
      
      const response = await fetch(url)
      
      if (!response.ok) {
        logger.warn('Geocoding HTTP error', { status: response.status })
        return null
      }
      
      const data = await response.json()
      
      // Handle API-level errors
      if (data.status === 'REQUEST_DENIED') {
        logger.warn('Geocoding denied - API key invalid or restricted')
        return null
      }
      
      if (data.status === 'OVER_QUERY_LIMIT') {
        logger.warn('Geocoding quota exceeded')
        return null
      }
      
      if (data.status === 'ZERO_RESULTS' || data.status === 'NOT_FOUND') {
        logger.debug('No place found for address', { address: address.substring(0, 50) })
        return null
      }
      
      if (data.status !== 'OK') {
        logger.warn('Geocoding error status', { status: data.status })
        return null
      }
      
      // Extract place_id from first candidate
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].place_id) {
        const placeId = data.candidates[0].place_id
        logger.debug('Geocoded address to placeId', { placeId })
        return placeId
      }
      
      return null
    })
  } catch (error) {
    // Network or parsing error - log but don't throw
    logger.warn('Geocoding error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return null
  }
}

// Re-export generateSessionToken for convenience
export { generateSessionToken }
