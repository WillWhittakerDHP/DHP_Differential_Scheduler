/**
 * Google Maps Service
 * 
 * LEARNING: Service for interacting with Google Maps APIs (Places, Distance Matrix)
 * WHY: Centralized Maps API operations with rate limiting and caching
 * PATTERN: Service layer pattern matching googleCalendarService.ts
 * 
 * SESSION: 2.2.1 - Address Autocomplete (Places API)
 */

import { checkRateLimit, recordRequest, waitForRateLimit } from './rateLimiter.js';

/**
 * API base URL for Google Maps
 * LEARNING: Use environment variable or default
 */
const GOOGLE_MAPS_API_BASE = 'https://maps.googleapis.com/maps/api';

/**
 * Get Google Maps API key from environment
 * LEARNING: Uses existing GOOGLE_API_KEY from .env.development
 */
function getApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new MapsApiError('auth', 'Google Maps API key not configured');
  }
  return apiKey;
}

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
  | 'unknown';       // Unknown error

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
    super(message);
    this.name = 'MapsApiError';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    const messages: Record<MapsApiErrorType, string> = {
      auth: 'Address lookup service is not configured.',
      rate_limit: 'Too many requests. Please try again in a moment.',
      invalid: 'Invalid address lookup request.',
      not_found: 'Address not found.',
      network: 'Could not reach address lookup service.',
      unknown: 'An unexpected error occurred.'
    };
    return messages[this.type];
  }
}

/**
 * Autocomplete prediction from Google Places API
 * LEARNING: Structure of a single autocomplete suggestion
 */
export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

/**
 * Autocomplete response structure
 */
export interface AutocompleteResponse {
  predictions: AutocompletePrediction[];
  status: string;
}

/**
 * Address components extracted from place details
 * LEARNING: Parsed address components for structured storage
 */
export interface AddressComponents {
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Coordinates (latitude/longitude)
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Place details response structure
 * LEARNING: Full place details including coordinates
 */
export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  addressComponents: AddressComponents;
  coordinates: Coordinates;
}

/**
 * Parse address components from Google Places API response
 * LEARNING: Maps Google's address_components to our structured format
 * WHY: Provides normalized address fields for storage
 */
function parseAddressComponents(components: Array<{
  types: string[];
  long_name: string;
  short_name: string;
}>): AddressComponents {
  const result: AddressComponents = {};
  
  for (const component of components) {
    const types = component.types;
    
    if (types.includes('street_number')) {
      result.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      result.streetName = component.long_name;
    } else if (types.includes('locality')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.short_name; // Use abbreviation for state
    } else if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    } else if (types.includes('country')) {
      result.country = component.short_name; // Use country code
    }
  }
  
  return result;
}

/**
 * Get address autocomplete suggestions
 * 
 * LEARNING: Calls Google Places Autocomplete API
 * WHY: Provides address suggestions as user types
 * PATTERN: Rate limiting before API call
 * 
 * @param input User's input text
 * @param sessionToken Optional session token for billing optimization
 * @returns Array of autocomplete predictions
 */
export async function getAutocompleteSuggestions(
  input: string,
  sessionToken?: string
): Promise<AutocompletePrediction[]> {
  if (!input || input.trim().length < 3) {
    return [];
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit('google-maps');
  
  if (rateLimitResult.status === 'exceeded') {
    console.warn('[GoogleMapsService] Rate limit exceeded, waiting...');
    await waitForRateLimit('google-maps');
  }
  
  // Record request for rate limiting
  recordRequest('google-maps');
  
  const apiKey = getApiKey();
  
  // Build URL with parameters
  const params = new URLSearchParams({
    input: input.trim(),
    types: 'address',
    components: 'country:us', // Restrict to US addresses
    key: apiKey
  });
  
  if (sessionToken) {
    params.append('sessiontoken', sessionToken);
  }
  
  const url = `${GOOGLE_MAPS_API_BASE}/place/autocomplete/json?${params.toString()}`;
  
  console.log(`[GoogleMapsService] Fetching autocomplete for: "${input}"`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new MapsApiError(
        'network',
        `HTTP error: ${response.status}`,
        response.status >= 500
      );
    }
    
    const data = await response.json();
    
    // Log raw response for debugging
    console.log('[GoogleMapsService] Autocomplete API status:', data.status);
    if (data.error_message) {
      console.error('[GoogleMapsService] API error_message:', data.error_message);
    }
    
    // Handle API-level errors
    if (data.status === 'REQUEST_DENIED') {
      throw new MapsApiError('auth', data.error_message || 'API key invalid or restricted');
    }
    
    if (data.status === 'OVER_QUERY_LIMIT') {
      throw new MapsApiError('rate_limit', 'API quota exceeded', true);
    }
    
    if (data.status === 'INVALID_REQUEST') {
      throw new MapsApiError('invalid', data.error_message || 'Invalid autocomplete request');
    }
    
    // Handle zero results
    if (data.status === 'ZERO_RESULTS' || !data.predictions) {
      return [];
    }
    
    // Transform predictions to our format
    const predictions: AutocompletePrediction[] = data.predictions.map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || ''
    }));
    
    console.log(`[GoogleMapsService] Found ${predictions.length} suggestions`);
    
    return predictions;
    
  } catch (error) {
    if (error instanceof MapsApiError) {
      throw error;
    }
    
    // Network or parsing error
    console.error('[GoogleMapsService] Autocomplete error:', error);
    throw new MapsApiError(
      'network',
      error instanceof Error ? error.message : 'Network error',
      true
    );
  }
}

/**
 * Get place details including coordinates
 * 
 * LEARNING: Calls Google Places Details API
 * WHY: Gets full address and coordinates for distance calculations
 * PATTERN: Rate limiting, session token for billing
 * 
 * @param placeId Google Place ID from autocomplete
 * @param sessionToken Optional session token (ends the session for billing)
 * @returns Place details with coordinates
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails> {
  if (!placeId) {
    throw new MapsApiError('invalid', 'Place ID is required');
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit('google-maps');
  
  if (rateLimitResult.status === 'exceeded') {
    console.warn('[GoogleMapsService] Rate limit exceeded, waiting...');
    await waitForRateLimit('google-maps');
  }
  
  // Record request for rate limiting
  recordRequest('google-maps');
  
  const apiKey = getApiKey();
  
  // Build URL with parameters
  // LEARNING: Only request fields we need to minimize cost
  // WHY: Google charges per field category
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'formatted_address,geometry,address_components',
    key: apiKey
  });
  
  if (sessionToken) {
    params.append('sessiontoken', sessionToken);
  }
  
  const url = `${GOOGLE_MAPS_API_BASE}/place/details/json?${params.toString()}`;
  
  console.log(`[GoogleMapsService] Fetching place details for: ${placeId}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new MapsApiError(
        'network',
        `HTTP error: ${response.status}`,
        response.status >= 500
      );
    }
    
    const data = await response.json();
    
    // Handle API-level errors
    if (data.status === 'REQUEST_DENIED') {
      throw new MapsApiError('auth', 'API key invalid or restricted');
    }
    
    if (data.status === 'OVER_QUERY_LIMIT') {
      throw new MapsApiError('rate_limit', 'API quota exceeded', true);
    }
    
    if (data.status === 'NOT_FOUND' || data.status === 'INVALID_REQUEST') {
      throw new MapsApiError('not_found', 'Place not found');
    }
    
    if (!data.result) {
      throw new MapsApiError('invalid', 'Invalid response from Places API');
    }
    
    const result = data.result;
    
    // Extract coordinates
    const coordinates: Coordinates = {
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng
    };
    
    if (!coordinates.lat || !coordinates.lng) {
      throw new MapsApiError('invalid', 'Place has no coordinates');
    }
    
    // Parse address components
    const addressComponents = parseAddressComponents(result.address_components || []);
    
    const placeDetails: PlaceDetails = {
      placeId,
      formattedAddress: result.formatted_address || '',
      addressComponents,
      coordinates
    };
    
    console.log(`[GoogleMapsService] Got place details: ${placeDetails.formattedAddress}`);
    
    return placeDetails;
    
  } catch (error) {
    if (error instanceof MapsApiError) {
      throw error;
    }
    
    // Network or parsing error
    console.error('[GoogleMapsService] Place details error:', error);
    throw new MapsApiError(
      'network',
      error instanceof Error ? error.message : 'Network error',
      true
    );
  }
}

/**
 * Generate a session token for billing optimization
 * 
 * LEARNING: Session tokens group autocomplete + details into one billing session
 * WHY: Google charges per session, not per request, when using tokens
 * PATTERN: Generate UUID for session token
 */
export function generateSessionToken(): string {
  // Simple UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// =============================================================================
// ROUTES API - Session 2.2.2
// =============================================================================

/**
 * Routes API base URL
 * LEARNING: Routes API uses a different base URL than Places API
 */
const ROUTES_API_BASE = 'https://routes.googleapis.com';

/**
 * Location input for route calculations
 * LEARNING: Routes API accepts placeId, coordinates, or address
 * WHY: Provides flexibility in how locations are specified
 * PATTERN: Priority order for accuracy: placeId > coordinates > address
 */
export interface RouteLocation {
  placeId?: string;
  coordinates?: Coordinates;
  address?: string;
}

/**
 * Route matrix result for a single origin-destination pair
 * LEARNING: Contains duration and distance for a route
 */
export interface RouteMatrixResult {
  originIndex: number;
  destinationIndex: number;
  durationSeconds: number;
  distanceMeters: number;
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS';
  condition?: string;
}

/**
 * Convert our location format to Routes API waypoint format
 * 
 * LEARNING: Routes API has specific waypoint format
 * WHY: Different from Places API, uses nested structure
 * PATTERN: Priority: placeId > coordinates > address
 * 
 * @param location Our location format
 * @returns Routes API waypoint format
 */
function toRoutesWaypoint(location: RouteLocation): object {
  if (location.placeId) {
    // Best accuracy - uses exact place identifier
    return { placeId: location.placeId };
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
    };
  }
  
  if (location.address) {
    // Fallback - requires geocoding
    return { address: location.address };
  }
  
  throw new MapsApiError('invalid', 'Location must have placeId, coordinates, or address');
}

/**
 * Calculate route matrix using Google Routes API
 * 
 * LEARNING: Routes API computeRouteMatrix calculates drive times between multiple locations
 * WHY: More accurate than Distance Matrix API (legacy), especially with Place IDs
 * PATTERN: POST request with origins/destinations arrays
 * 
 * @param origins Array of origin locations
 * @param destinations Array of destination locations
 * @param useTraffic Whether to use real-time traffic (default: true, triggers Pro SKU)
 * @returns Array of route results for each origin-destination pair
 */
export async function calculateRouteMatrix(
  origins: RouteLocation[],
  destinations: RouteLocation[],
  useTraffic: boolean = true
): Promise<RouteMatrixResult[]> {
  // Validate inputs
  if (!origins.length) {
    throw new MapsApiError('invalid', 'At least one origin is required');
  }
  if (!destinations.length) {
    throw new MapsApiError('invalid', 'At least one destination is required');
  }
  
  // Check element limit (origins × destinations ≤ 625)
  const elementCount = origins.length * destinations.length;
  if (elementCount > 625) {
    throw new MapsApiError('invalid', `Element count ${elementCount} exceeds maximum 625`);
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit('google-maps');
  
  if (rateLimitResult.status === 'exceeded') {
    console.warn('[GoogleMapsService] Rate limit exceeded, waiting...');
    await waitForRateLimit('google-maps');
  }
  
  // Record request for rate limiting
  recordRequest('google-maps');
  
  const apiKey = getApiKey();
  
  // Build request body
  const requestBody = {
    origins: origins.map(origin => ({
      waypoint: toRoutesWaypoint(origin)
    })),
    destinations: destinations.map(dest => ({
      waypoint: toRoutesWaypoint(dest)
    })),
    travelMode: 'DRIVE',
    routingPreference: useTraffic ? 'TRAFFIC_AWARE' : 'TRAFFIC_UNAWARE'
  };
  
  const url = `${ROUTES_API_BASE}/distanceMatrix/v2:computeRouteMatrix`;
  
  console.log(`[GoogleMapsService] Calculating route matrix: ${origins.length} origins × ${destinations.length} destinations`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleMapsService] Routes API HTTP error:', response.status, errorText);
      
      if (response.status === 401 || response.status === 403) {
        throw new MapsApiError('auth', `API key invalid or Routes API not enabled: ${errorText}`);
      }
      if (response.status === 429) {
        throw new MapsApiError('rate_limit', 'Routes API quota exceeded', true);
      }
      
      throw new MapsApiError(
        'network',
        `HTTP error: ${response.status}`,
        response.status >= 500
      );
    }
    
    const data = await response.json();
    
    // Log response for debugging
    console.log('[GoogleMapsService] Routes API response count:', Array.isArray(data) ? data.length : 'not array');
    
    // Routes API returns an array of results
    if (!Array.isArray(data)) {
      console.error('[GoogleMapsService] Unexpected response format:', data);
      throw new MapsApiError('invalid', 'Unexpected response format from Routes API');
    }
    
    // Transform results to our format
    const results: RouteMatrixResult[] = data.map((item: any) => {
      // Parse duration (comes as "123s" string)
      let durationSeconds = 0;
      if (item.duration) {
        const match = item.duration.match(/^(\d+)s$/);
        if (match) {
          durationSeconds = parseInt(match[1], 10);
        }
      }
      
      // Determine status
      let status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' = 'OK';
      if (item.condition === 'ROUTE_NOT_FOUND') {
        status = 'NOT_FOUND';
      } else if (!item.distanceMeters || durationSeconds === 0) {
        status = 'ZERO_RESULTS';
      }
      
      return {
        originIndex: item.originIndex ?? 0,
        destinationIndex: item.destinationIndex ?? 0,
        durationSeconds,
        distanceMeters: item.distanceMeters ?? 0,
        status,
        condition: item.condition
      };
    });
    
    console.log(`[GoogleMapsService] Route matrix complete: ${results.length} results`);
    
    return results;
    
  } catch (error) {
    if (error instanceof MapsApiError) {
      throw error;
    }
    
    // Network or parsing error
    console.error('[GoogleMapsService] Route matrix error:', error);
    throw new MapsApiError(
      'network',
      error instanceof Error ? error.message : 'Network error',
      true
    );
  }
}

/**
 * Calculate drive time between two locations (convenience function)
 * 
 * LEARNING: Simple wrapper for single origin-destination calculation
 * WHY: Most common use case is point-to-point drive time
 * 
 * @param origin Origin location
 * @param destination Destination location
 * @param useTraffic Whether to use real-time traffic
 * @returns Drive time result or null if route not found
 */
export async function calculateDriveTime(
  origin: RouteLocation,
  destination: RouteLocation,
  useTraffic: boolean = true
): Promise<{ durationMinutes: number; durationSeconds: number; distanceMeters: number; distanceMiles: number } | null> {
  const results = await calculateRouteMatrix([origin], [destination], useTraffic);
  
  if (results.length === 0 || results[0].status !== 'OK') {
    console.warn('[GoogleMapsService] No route found between locations');
    return null;
  }
  
  const result = results[0];
  
  return {
    durationMinutes: Math.ceil(result.durationSeconds / 60),
    durationSeconds: result.durationSeconds,
    distanceMeters: result.distanceMeters,
    distanceMiles: Math.round(result.distanceMeters / 1609.34 * 10) / 10
  };
}
