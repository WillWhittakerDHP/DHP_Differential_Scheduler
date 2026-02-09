import { Router, Request, Response } from 'express';
import { 
  getAutocompleteSuggestions, 
  getPlaceDetails,
  generateSessionToken,
  MapsApiError,
  type AutocompletePrediction,
  type PlaceDetails
} from '../../services/googleMapsService.js';
import { getRateLimitStats } from '../../services/rateLimiter.js';
import { 
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

// Phase 10: Removed GET /drive-time and POST /route-matrix endpoints
// WHY: These booking-flow-only endpoints are replaced by POST /computed-data
// Drive times are now calculated server-side via the orchestrator

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
