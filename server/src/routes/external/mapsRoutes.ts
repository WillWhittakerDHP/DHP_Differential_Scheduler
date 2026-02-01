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

/**
 * Maps Routes
 * 
 * LEARNING: API endpoints for Google Maps operations (Places, Distance Matrix)
 * WHY: Proxy Google Maps API calls through server to hide API key
 * PATTERN: Matches calendarRoutes.ts structure
 * 
 * SESSION: 2.2.1 - Address Autocomplete (Places API)
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
