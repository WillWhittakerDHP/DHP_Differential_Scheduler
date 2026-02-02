import { Router, Request, Response } from 'express';
import { 
  getAutocompleteSuggestions, 
  getPlaceDetails,
  generateSessionToken,
  calculateRouteMatrix,
  calculateDriveTime,
  MapsApiError,
  type AutocompletePrediction,
  type PlaceDetails,
  type RouteLocation
} from '../../services/googleMapsService.js';
import { getRateLimitStats } from '../../services/rateLimiter.js';
import { 
  getCachedDriveTime, 
  cacheDriveTime, 
  getDriveTimeCacheStats,
  getAllCachedDriveTimes,
  clearDriveTimeCache
} from '../../services/driveTimeCache.js';

/**
 * Maps Routes
 * 
 * LEARNING: API endpoints for Google Maps operations (Places, Routes)
 * WHY: Proxy Google Maps API calls through server to hide API key
 * PATTERN: Matches calendarRoutes.ts structure
 * 
 * SESSION: 2.2.1 - Address Autocomplete (Places API)
 * SESSION: 2.2.2 - Drive Time Calculations (Routes API)
 */

const router = Router();

/**
 * GET /api/v1/external/maps/autocomplete
 * 
 * Get address autocomplete suggestions
 * 
 * Query params:
 *   input: string - User's input text (required)
 *   sessionToken: string - Optional session token for billing optimization
 * 
 * Response:
 *   { predictions: AutocompletePrediction[] }
 */
router.get('/autocomplete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { input, sessionToken } = req.query;
    
    // Validate input
    if (!input || typeof input !== 'string') {
      res.status(400).json({
        error: 'Missing required parameter: input',
        type: 'invalid'
      });
      return;
    }
    
    // Get suggestions
    const predictions = await getAutocompleteSuggestions(
      input,
      sessionToken as string | undefined
    );
    
    res.json({ predictions });
    
  } catch (error) {
    console.error('[MapsRoutes] Autocomplete error:', error);
    
    if (error instanceof MapsApiError) {
      const statusCode = getStatusCodeForError(error.type);
      res.status(statusCode).json({
        error: error.getUserMessage(),
        type: error.type,
        retryable: error.retryable
      });
      return;
    }
    
    res.status(500).json({
      error: 'Internal server error',
      type: 'unknown'
    });
  }
});

/**
 * GET /api/v1/external/maps/place-details
 * 
 * Get place details including coordinates
 * 
 * Query params:
 *   placeId: string - Google Place ID from autocomplete (required)
 *   sessionToken: string - Optional session token (ends the session for billing)
 * 
 * Response:
 *   PlaceDetails (formattedAddress, coordinates, addressComponents)
 */
router.get('/place-details', async (req: Request, res: Response): Promise<void> => {
  try {
    const { placeId, sessionToken } = req.query;
    
    // Validate input
    if (!placeId || typeof placeId !== 'string') {
      res.status(400).json({
        error: 'Missing required parameter: placeId',
        type: 'invalid'
      });
      return;
    }
    
    // Get place details
    const details = await getPlaceDetails(
      placeId,
      sessionToken as string | undefined
    );
    
    res.json(details);
    
  } catch (error) {
    console.error('[MapsRoutes] Place details error:', error);
    
    if (error instanceof MapsApiError) {
      const statusCode = getStatusCodeForError(error.type);
      res.status(statusCode).json({
        error: error.getUserMessage(),
        type: error.type,
        retryable: error.retryable
      });
      return;
    }
    
    res.status(500).json({
      error: 'Internal server error',
      type: 'unknown'
    });
  }
});

/**
 * GET /api/v1/external/maps/session-token
 * 
 * Generate a new session token for billing optimization
 * 
 * LEARNING: Session tokens group autocomplete + place-details into one billing session
 * WHY: Reduces cost when user selects from suggestions
 * 
 * Response:
 *   { sessionToken: string }
 */
router.get('/session-token', (_req: Request, res: Response): void => {
  const sessionToken = generateSessionToken();
  res.json({ sessionToken });
});

// =============================================================================
// ROUTES API ENDPOINTS - Session 2.2.2
// =============================================================================

/**
 * GET /api/v1/external/maps/drive-time
 * 
 * Get drive time between two locations (simple point-to-point)
 * 
 * LEARNING: Convenience endpoint for single origin-destination with fallback support
 * WHY: Most common use case - calculate drive time from A to B
 * PATTERN: Uses caching to reduce API calls, falls back to static value on error
 * 
 * Session 2.2.3: Added fallback support and source metadata
 * 
 * Query params (at least one identifier required for origin and destination):
 *   originPlaceId: string - Google Place ID for origin
 *   originLat: number - Latitude for origin
 *   originLng: number - Longitude for origin
 *   originAddress: string - Address string for origin
 *   destPlaceId: string - Google Place ID for destination
 *   destLat: number - Latitude for destination
 *   destLng: number - Longitude for destination
 *   destAddress: string - Address string for destination
 *   useTraffic: 'true'|'false' - Use real-time traffic (default: true)
 *   fallbackMinutes: number - Fallback minutes to use if API fails (optional)
 * 
 * Response:
 *   { 
 *     durationMinutes, 
 *     durationSeconds, 
 *     distanceMeters, 
 *     distanceMiles,
 *     _meta: { source: 'calculated' | 'estimated' | 'cache' }
 *   }
 */
router.get('/drive-time', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      originPlaceId, originLat, originLng, originAddress,
      destPlaceId, destLat, destLng, destAddress,
      useTraffic = 'true',
      fallbackMinutes
    } = req.query;
    
    // Parse fallback minutes if provided
    const fallbackMinutesNum = fallbackMinutes 
      ? parseFloat(fallbackMinutes as string) 
      : undefined;
    
    // Build origin location
    const origin: RouteLocation = {};
    if (originPlaceId && typeof originPlaceId === 'string') {
      origin.placeId = originPlaceId;
    } else if (originLat && originLng) {
      origin.coordinates = {
        lat: parseFloat(originLat as string),
        lng: parseFloat(originLng as string)
      };
    } else if (originAddress && typeof originAddress === 'string') {
      origin.address = originAddress;
    }
    
    // Build destination location
    const destination: RouteLocation = {};
    if (destPlaceId && typeof destPlaceId === 'string') {
      destination.placeId = destPlaceId;
    } else if (destLat && destLng) {
      destination.coordinates = {
        lat: parseFloat(destLat as string),
        lng: parseFloat(destLng as string)
      };
    } else if (destAddress && typeof destAddress === 'string') {
      destination.address = destAddress;
    }
    
    // Validate we have both locations (unless fallback is provided)
    if (!origin.placeId && !origin.coordinates && !origin.address) {
      if (fallbackMinutesNum !== undefined) {
        // Return fallback immediately if origin missing
        res.json({
          durationMinutes: fallbackMinutesNum,
          durationSeconds: fallbackMinutesNum * 60,
          distanceMeters: 0,
          distanceMiles: 0,
          _meta: { source: 'estimated' }
        });
        return;
      }
      res.status(400).json({
        error: 'Missing origin location. Provide originPlaceId, originLat+originLng, or originAddress',
        type: 'invalid'
      });
      return;
    }
    
    if (!destination.placeId && !destination.coordinates && !destination.address) {
      if (fallbackMinutesNum !== undefined) {
        // Return fallback immediately if destination missing
        res.json({
          durationMinutes: fallbackMinutesNum,
          durationSeconds: fallbackMinutesNum * 60,
          distanceMeters: 0,
          distanceMiles: 0,
          _meta: { source: 'estimated' }
        });
        return;
      }
      res.status(400).json({
        error: 'Missing destination location. Provide destPlaceId, destLat+destLng, or destAddress',
        type: 'invalid'
      });
      return;
    }
    
    // Check cache first
    const cached = getCachedDriveTime(origin, destination);
    if (cached) {
      res.json({
        durationMinutes: Math.ceil(cached.durationSeconds / 60),
        durationSeconds: cached.durationSeconds,
        distanceMeters: cached.distanceMeters,
        distanceMiles: Math.round(cached.distanceMeters / 1609.34 * 10) / 10,
        _meta: { source: 'cache' }
      });
      return;
    }
    
    // Calculate drive time with fallback support
    const result = await calculateDriveTime(
      origin, 
      destination, 
      useTraffic !== 'false',
      fallbackMinutesNum
    );
    
    if (!result) {
      // No route found and no fallback
      res.status(404).json({
        error: 'No route found between locations',
        type: 'not_found'
      });
      return;
    }
    
    // Cache the result only if it's calculated (not estimated)
    if (result.source === 'calculated') {
      cacheDriveTime(origin, destination, result.durationSeconds, result.distanceMeters);
    }
    
    res.json({
      durationMinutes: result.durationMinutes,
      durationSeconds: result.durationSeconds,
      distanceMeters: result.distanceMeters,
      distanceMiles: result.distanceMiles,
      _meta: { source: result.source }
    });
    
  } catch (error) {
    console.error('[MapsRoutes] Drive time error:', error);
    
    // If we have fallback, return it instead of error
    const fallbackMinutes = req.query.fallbackMinutes 
      ? parseFloat(req.query.fallbackMinutes as string) 
      : undefined;
    
    if (fallbackMinutes !== undefined) {
      console.warn('[MapsRoutes] API error, returning fallback value');
      res.json({
        durationMinutes: fallbackMinutes,
        durationSeconds: fallbackMinutes * 60,
        distanceMeters: 0,
        distanceMiles: 0,
        _meta: { source: 'estimated' }
      });
      return;
    }
    
    // No fallback available - return error
    if (error instanceof MapsApiError) {
      const statusCode = getStatusCodeForError(error.type);
      res.status(statusCode).json({
        error: error.getUserMessage(),
        type: error.type,
        retryable: error.retryable
      });
      return;
    }
    
    res.status(500).json({
      error: 'Internal server error',
      type: 'unknown'
    });
  }
});

/**
 * POST /api/v1/external/maps/route-matrix
 * 
 * Calculate drive times between multiple origins and destinations
 * 
 * LEARNING: Batch calculation using Routes API computeRouteMatrix
 * WHY: More efficient than multiple single calls
 * PATTERN: Elements = origins × destinations (max 625)
 * 
 * Request body:
 *   {
 *     origins: RouteLocation[],
 *     destinations: RouteLocation[],
 *     useTraffic?: boolean
 *   }
 * 
 * Where RouteLocation is:
 *   { placeId?: string, coordinates?: { lat, lng }, address?: string }
 * 
 * Response:
 *   { results: RouteMatrixResult[] }
 */
router.post('/route-matrix', async (req: Request, res: Response): Promise<void> => {
  try {
    const { origins, destinations, useTraffic = true } = req.body;
    
    // Validate input
    if (!origins || !Array.isArray(origins) || origins.length === 0) {
      res.status(400).json({
        error: 'Missing or invalid origins array',
        type: 'invalid'
      });
      return;
    }
    
    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      res.status(400).json({
        error: 'Missing or invalid destinations array',
        type: 'invalid'
      });
      return;
    }
    
    // Check element limit
    const elementCount = origins.length * destinations.length;
    if (elementCount > 625) {
      res.status(400).json({
        error: `Element count ${elementCount} exceeds maximum 625 (origins × destinations)`,
        type: 'invalid'
      });
      return;
    }
    
    // Validate each location has required fields
    const validateLocation = (loc: any, index: number, type: string): string | null => {
      if (!loc.placeId && !loc.coordinates && !loc.address) {
        return `${type}[${index}] must have placeId, coordinates, or address`;
      }
      if (loc.coordinates && (typeof loc.coordinates.lat !== 'number' || typeof loc.coordinates.lng !== 'number')) {
        return `${type}[${index}].coordinates must have numeric lat and lng`;
      }
      return null;
    };
    
    for (let i = 0; i < origins.length; i++) {
      const error = validateLocation(origins[i], i, 'origins');
      if (error) {
        res.status(400).json({ error, type: 'invalid' });
        return;
      }
    }
    
    for (let i = 0; i < destinations.length; i++) {
      const error = validateLocation(destinations[i], i, 'destinations');
      if (error) {
        res.status(400).json({ error, type: 'invalid' });
        return;
      }
    }
    
    // Calculate route matrix
    const results = await calculateRouteMatrix(origins, destinations, useTraffic);
    
    // Cache individual results for future single queries
    results.forEach(result => {
      if (result.status === 'OK') {
        const origin = origins[result.originIndex];
        const dest = destinations[result.destinationIndex];
        cacheDriveTime(origin, dest, result.durationSeconds, result.distanceMeters);
      }
    });
    
    res.json({ results });
    
  } catch (error) {
    console.error('[MapsRoutes] Route matrix error:', error);
    
    if (error instanceof MapsApiError) {
      const statusCode = getStatusCodeForError(error.type);
      res.status(statusCode).json({
        error: error.getUserMessage(),
        type: error.type,
        retryable: error.retryable
      });
      return;
    }
    
    res.status(500).json({
      error: 'Internal server error',
      type: 'unknown'
    });
  }
});

// =============================================================================
// DEBUG ENDPOINTS
// =============================================================================

/**
 * GET /api/v1/external/maps/debug/rate-limit
 * 
 * Get rate limit statistics for Google Maps API
 * 
 * LEARNING: Debug endpoint for monitoring API usage
 * WHY: Helps track quota consumption in development
 * 
 * Response:
 *   Rate limit statistics for google-maps API
 */
router.get('/debug/rate-limit', (_req: Request, res: Response): void => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Debug endpoints disabled in production' });
    return;
  }
  
  const stats = getRateLimitStats('google-maps');
  res.json(stats);
});

/**
 * GET /api/v1/external/maps/debug/drive-time-cache
 * 
 * Get drive time cache statistics and entries
 * 
 * LEARNING: Debug endpoint for monitoring cache performance and viewing cached entries
 * WHY: Helps verify caching is working correctly and inspect cached drive times
 * PATTERN: Matches freebusy-cache and events-cache endpoint structure
 * 
 * Response:
 *   {
 *     stats: { totalEntries, oldestEntryAge, memoryEstimateBytes },
 *     entries: [{ key, data: { durationSeconds, distanceMeters }, timestamp, age, expired }],
 *     totalEntries: number
 *   }
 */
router.get('/debug/drive-time-cache', (_req: Request, res: Response): void => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Debug endpoints disabled in production' });
    return;
  }
  
  try {
    const stats = getDriveTimeCacheStats();
    const entries = getAllCachedDriveTimes();
    
    // Convert Map to array for JSON serialization
    const entriesArray = Array.from(entries.entries()).map(([key, entry]) => ({
      key,
      data: {
        durationSeconds: entry.durationSeconds,
        distanceMeters: entry.distanceMeters,
        durationMinutes: Math.ceil(entry.durationSeconds / 60),
        distanceMiles: Math.round(entry.distanceMeters / 1609.34 * 10) / 10
      },
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp,
      expired: (Date.now() - entry.timestamp) > (24 * 60 * 60 * 1000) // 24 hour TTL
    }));
    
    res.json({
      stats: {
        totalEntries: stats.totalEntries,
        oldestEntryAge: stats.oldestEntryAge,
        memoryUsage: stats.memoryEstimateBytes
      },
      entries: entriesArray,
      totalEntries: entries.size
    });
  } catch (error: any) {
    console.error('[MapsRoutes] Error in /debug/drive-time-cache:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/v1/external/maps/debug/clear-drive-time-cache
 * 
 * Clear drive time cache
 * 
 * LEARNING: Debug endpoint for testing
 * WHY: Allows manual cache clearing during development
 */
router.post('/debug/clear-drive-time-cache', (_req: Request, res: Response): void => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Debug endpoints disabled in production' });
    return;
  }
  
  clearDriveTimeCache();
  res.json({ success: true, message: 'Drive time cache cleared' });
});

/**
 * Map error type to HTTP status code
 * LEARNING: Consistent HTTP status codes for error types
 */
function getStatusCodeForError(type: string): number {
  switch (type) {
    case 'auth':
      return 401;
    case 'rate_limit':
      return 429;
    case 'invalid':
      return 400;
    case 'not_found':
      return 404;
    case 'network':
      return 502;
    default:
      return 500;
  }
}

export { router as MapsRouter };
