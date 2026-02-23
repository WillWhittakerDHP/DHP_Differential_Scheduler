/**
 * Google Routes API Service
 * 
 */

import { createLogger } from '../../../utils/logger.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { withRetry } from '../shared/googleApiRetry.js'
import { getGoogleMapsApiKey, ROUTES_API_BASE } from '../shared/googleApiConfig.js'
import { GOOGLE_API_STATUS, ROUTES_CONDITION_NOT_FOUND } from './mapsConstants.js'
import { MapsApiError } from './mapsErrorHandler.js'
import { toRoutesWaypoint } from './mapsHelpers.js'
import { getCachedDriveTime, cacheDriveTime } from '../../driveTimeCache.js'
import type {
  RouteLocation,
  RouteMatrixResult,
  RouteMatrixStatus,
  DriveTimeResult
} from './mapsTypes.js'

const logger = createLogger('RoutesApiService')

function parseRouteMatrixItem(item: { duration?: string; distanceMeters?: number; originIndex?: number; destinationIndex?: number; condition?: string }): RouteMatrixResult {
  let durationSeconds = 0
  if (item.duration) {
    const match = item.duration.match(/^(\d+)s$/)
    if (match) durationSeconds = parseInt(match[1], 10)
  }
  let status: RouteMatrixStatus = GOOGLE_API_STATUS.OK
  if (item.condition === ROUTES_CONDITION_NOT_FOUND) status = GOOGLE_API_STATUS.NOT_FOUND
  else if (!item.distanceMeters || durationSeconds === 0) status = GOOGLE_API_STATUS.ZERO_RESULTS
  return {
    originIndex: item.originIndex ?? 0,
    destinationIndex: item.destinationIndex ?? 0,
    durationSeconds,
    distanceMeters: item.distanceMeters ?? 0,
    status,
    condition: item.condition
  }
}

function toDriveTimeResult(durationSeconds: number, distanceMeters: number, source: 'calculated' | 'estimated' | 'cached'): DriveTimeResult {
  return {
    durationMinutes: Math.ceil(durationSeconds / 60),
    durationSeconds,
    distanceMeters,
    distanceMiles: Math.round(distanceMeters / 1609.34 * 10) / 10,
    source
  }
}

/**
 * Calculate route matrix using Google Routes API
 * 
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
  if (!origins.length) {
    throw new MapsApiError('invalid', 'At least one origin is required')
  }
  if (!destinations.length) {
    throw new MapsApiError('invalid', 'At least one destination is required')
  }
  
  const elementCount = origins.length * destinations.length
  if (elementCount > 625) {
    throw new MapsApiError('invalid', `Element count ${elementCount} exceeds maximum 625`)
  }
  
  return await withRateLimit('google-maps', async () => {
    const apiKey = getGoogleMapsApiKey()
    
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
      
      const results: RouteMatrixResult[] = data.map((item: Record<string, unknown>) =>
        parseRouteMatrixItem(item as { duration?: string; distanceMeters?: number; originIndex?: number; destinationIndex?: number; condition?: string })
      )
      
      logger.debug('Route matrix complete', { resultsCount: results.length })
      
      return results
      
    } catch (error) {
      logger.error(error)
      if (error instanceof MapsApiError) {
        throw error
      }
      
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
  const fallbackResult = fallbackMinutes !== undefined ? toDriveTimeResult(fallbackMinutes * 60, 0, 'estimated') : null
  if (!origin.placeId && !origin.coordinates && !origin.address) {
    logger.warn('Missing origin location data')
    if (fallbackResult) return fallbackResult
    throw new MapsApiError('invalid', 'Origin location must have placeId, coordinates, or address')
  }
  if (!destination.placeId && !destination.coordinates && !destination.address) {
    logger.warn('Missing destination location data')
    if (fallbackResult) return fallbackResult
    throw new MapsApiError('invalid', 'Destination location must have placeId, coordinates, or address')
  }
  const cached = getCachedDriveTime(origin, destination)
  if (cached) return toDriveTimeResult(cached.durationSeconds, cached.distanceMeters, 'cached')
  
  // Attempt API call with retry for transient errors
  try {
    const results = await withRetry(
      () => calculateRouteMatrix([origin], [destination], useTraffic),
      (error) => error instanceof MapsApiError && error.retryable
    )
    
    if (results.length === 0 || results[0].status !== GOOGLE_API_STATUS.OK) {
      logger.warn('No route found between locations')
      if (fallbackMinutes !== undefined) return toDriveTimeResult(fallbackMinutes * 60, 0, 'estimated')
      return null
    }
    const result = results[0]
    cacheDriveTime(origin, destination, result.durationSeconds, result.distanceMeters)
    return toDriveTimeResult(result.durationSeconds, result.distanceMeters, 'calculated')
  } catch (error) {
    if (fallbackMinutes !== undefined) {
      logger.warn('API failed, using fallback', {
        errorType: error instanceof MapsApiError ? error.type : 'unknown',
        fallbackMinutes
      })
      return toDriveTimeResult(fallbackMinutes * 60, 0, 'estimated')
    }
    throw error
  }
}
