/**
 * Google Routes API Service
 * 
 * LEARNING: Service for Google Routes API operations (route matrix, drive time)
 * WHY: Centralized Routes API operations with rate limiting and error handling
 * PATTERN: Service layer with shared utilities
 */

import { createLogger } from '../../../utils/logger.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { withRetry } from '../shared/googleApiRetry.js'
import { getGoogleMapsApiKey, ROUTES_API_BASE } from '../shared/googleApiConfig.js'
import { MapsApiError } from './mapsErrorHandler.js'
import { toRoutesWaypoint } from './mapsHelpers.js'
import { getCachedDriveTime, cacheDriveTime } from '../../driveTimeCache.js'
import type {
  RouteLocation,
  RouteMatrixResult,
  DriveTimeResult
} from './mapsTypes.js'

const logger = createLogger('RoutesApiService')

/**
 * Calculate route matrix using Google Routes API
 * 
 * LEARNING: Routes API computeRouteMatrix calculates drive times between multiple locations
 * WHY: More accurate than Distance Matrix API (legacy), especially with Place IDs
 * PATTERN: POST request with origins/destinations arrays
 * 
 * @param origins - Array of origin locations
 * @param destinations - Array of destination locations
 * @param useTraffic - Whether to use real-time traffic (default: true, triggers Pro SKU)
 * @returns Array of route results for each origin-destination pair
 */
export async function calculateRouteMatrix(
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
  
  // Check element limit (origins × destinations ≤ 625)
  const elementCount = origins.length * destinations.length
  if (elementCount > 625) {
    throw new MapsApiError('invalid', `Element count ${elementCount} exceeds maximum 625`)
  }
  
  return await withRateLimit('google-maps', async () => {
    const apiKey = getGoogleMapsApiKey()
    
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
    }
    
    const url = `${ROUTES_API_BASE}/distanceMatrix/v2:computeRouteMatrix`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        logger.error('Routes API HTTP error', { status: response.status, errorText })
        
        if (response.status === 401 || response.status === 403) {
          throw new MapsApiError('auth', `API key invalid or Routes API not enabled: ${errorText}`)
        }
        if (response.status === 429) {
          throw new MapsApiError('rate_limit', 'Routes API quota exceeded', true)
        }
        
        throw new MapsApiError(
          'network',
          `HTTP error: ${response.status}`,
          response.status >= 500
        )
      }
      
      const data = await response.json()
      
      // Routes API returns an array of results
      if (!Array.isArray(data)) {
        logger.error('Unexpected response format', { data })
        throw new MapsApiError('invalid', 'Unexpected response format from Routes API')
      }
      
      // Transform results to our format
      const results: RouteMatrixResult[] = data.map((item: any) => {
        // Parse duration (comes as "123s" string)
        let durationSeconds = 0
        if (item.duration) {
          const match = item.duration.match(/^(\d+)s$/)
          if (match) {
            durationSeconds = parseInt(match[1], 10)
          }
        }
        
        // Determine status
        let status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' = 'OK'
        if (item.condition === 'ROUTE_NOT_FOUND') {
          status = 'NOT_FOUND'
        } else if (!item.distanceMeters || durationSeconds === 0) {
          status = 'ZERO_RESULTS'
        }
        
        return {
          originIndex: item.originIndex ?? 0,
          destinationIndex: item.destinationIndex ?? 0,
          durationSeconds,
          distanceMeters: item.distanceMeters ?? 0,
          status,
          condition: item.condition
        }
      })
      
      logger.debug('Route matrix complete', { resultsCount: results.length })
      
      return results
      
    } catch (error) {
      if (error instanceof MapsApiError) {
        throw error
      }
      
      // Network or parsing error
      logger.error('Route matrix error', { error })
      throw new MapsApiError(
        'network',
        error instanceof Error ? error.message : 'Network error',
        true
      )
    }
  })
}

/**
 * Calculate drive time between two locations (convenience function)
 * 
 * LEARNING: Simple wrapper for single origin-destination calculation with fallback support
 * WHY: Most common use case is point-to-point drive time
 * PATTERN: Returns fallback value when API fails or location data missing
 * 
 * Session 2.2.3: Added fallback support and retry logic
 * 
 * @param origin - Origin location
 * @param destination - Destination location
 * @param useTraffic - Whether to use real-time traffic
 * @param fallbackMinutes - Optional fallback minutes to use if API fails or location missing
 * @returns Drive time result with source metadata, or null if route not found and no fallback
 */
export async function calculateDriveTime(
  origin: RouteLocation,
  destination: RouteLocation,
  useTraffic: boolean = true,
  fallbackMinutes?: number
): Promise<DriveTimeResult | null> {
  // Validate location data before attempting API call
  if (!origin.placeId && !origin.coordinates && !origin.address) {
    logger.warn('Missing origin location data')
    if (fallbackMinutes !== undefined) {
      return {
        durationMinutes: fallbackMinutes,
        durationSeconds: fallbackMinutes * 60,
        distanceMeters: 0, // Unknown distance when using fallback
        distanceMiles: 0,
        source: 'estimated'
      }
    }
    throw new MapsApiError('invalid', 'Origin location must have placeId, coordinates, or address')
  }
  
  if (!destination.placeId && !destination.coordinates && !destination.address) {
    logger.warn('Missing destination location data')
    if (fallbackMinutes !== undefined) {
      return {
        durationMinutes: fallbackMinutes,
        durationSeconds: fallbackMinutes * 60,
        distanceMeters: 0,
        distanceMiles: 0,
        source: 'estimated'
      }
    }
    throw new MapsApiError('invalid', 'Destination location must have placeId, coordinates, or address')
  }
  
  // Check cache first
  const cached = getCachedDriveTime(origin, destination)
  if (cached) {
    return {
      durationMinutes: Math.ceil(cached.durationSeconds / 60),
      durationSeconds: cached.durationSeconds,
      distanceMeters: cached.distanceMeters,
      distanceMiles: Math.round(cached.distanceMeters / 1609.34 * 10) / 10,
      source: 'cached'
    }
  }
  
  // Attempt API call with retry for transient errors
  try {
    const results = await withRetry(
      () => calculateRouteMatrix([origin], [destination], useTraffic),
      (error) => error instanceof MapsApiError && error.retryable
    )
    
    if (results.length === 0 || results[0].status !== 'OK') {
      logger.warn('No route found between locations')
      // Use fallback if available
      if (fallbackMinutes !== undefined) {
        return {
          durationMinutes: fallbackMinutes,
          durationSeconds: fallbackMinutes * 60,
          distanceMeters: 0,
          distanceMiles: 0,
          source: 'estimated'
        }
      }
      return null
    }
    
    const result = results[0]
    
    // Cache the result for future use
    cacheDriveTime(origin, destination, result.durationSeconds, result.distanceMeters)
    
    return {
      durationMinutes: Math.ceil(result.durationSeconds / 60),
      durationSeconds: result.durationSeconds,
      distanceMeters: result.distanceMeters,
      distanceMiles: Math.round(result.distanceMeters / 1609.34 * 10) / 10,
      source: 'calculated'
    }
    
  } catch (error) {
    // API failed - use fallback if available
    if (fallbackMinutes !== undefined) {
      logger.warn('API failed, using fallback', {
        errorType: error instanceof MapsApiError ? error.type : 'unknown',
        fallbackMinutes
      })
      return {
        durationMinutes: fallbackMinutes,
        durationSeconds: fallbackMinutes * 60,
        distanceMeters: 0,
        distanceMiles: 0,
        source: 'estimated'
      }
    }
    
    // No fallback available - rethrow error
    throw error
  }
}
