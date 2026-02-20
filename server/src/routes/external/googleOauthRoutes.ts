import { Router, Request, Response } from 'express'
import { getAuthUrl, getTokens, setCredentials, getCredentials, saveTokensToFile, hasCredentials } from '../../config/googleOAuth.js'
import { createLogger } from '../../utils/logger.js'
import { CALENDAR_ROUTE_MESSAGES } from './calendarRouteConstants.js'
import { GOOGLE_OAUTH_MESSAGES, NODE_ENV } from './googleOauthConstants.js'

const logger = createLogger('GoogleOAuthRoutes');

/**
 * Google OAuth Routes
 * 
 * LEARNING: Routes for Google OAuth 2.0 authentication flow
 * WHY: Provides HTTP endpoints for OAuth authentication
 * PATTERN: Express router with OAuth flow handling
 * 
 * SESSION: 2.1.3b - Added file-based token persistence for development
 * NOTE: Tokens are saved to .google-tokens.json (gitignored) for persistence
 */

const router = Router();

/**
 * GET /api/v1/external/oauth
 * Initiate OAuth flow - redirects to Google consent screen
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error generating auth URL:', error);
    res.status(500).json({
      error: GOOGLE_OAUTH_MESSAGES.AUTH_URL_GENERATE_FAILED,
      message
    });
  }
});

/**
 * GET /api/v1/external/oauth/callback
 * Handle OAuth callback - exchanges authorization code for tokens
 * 
 * Query parameters:
 * - code: Authorization code from Google
 * - error: Error code if authorization failed
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;
    
    // Handle authorization errors
    if (error) {
      logger.error('OAuth error:', error);
      res.status(400).json({
        error: GOOGLE_OAUTH_MESSAGES.AUTH_FAILED,
        message: GOOGLE_OAUTH_MESSAGES.AUTH_FAILED_GOOGLE(String(error))
      });
      return;
    }
    
    // Validate authorization code
    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: GOOGLE_OAUTH_MESSAGES.INVALID_REQUEST,
        message: GOOGLE_OAUTH_MESSAGES.AUTH_CODE_REQUIRED
      });
      return;
    }
    
    // Exchange code for tokens
    const tokens = await getTokens(code);
    
    // Set credentials on OAuth client
    setCredentials(tokens);
    
    // Save tokens to file for persistence across restarts
    // SESSION: 2.1.3b - Persist tokens across server restarts
    saveTokensToFile(tokens);
    
    logger.info('OAuth authentication successful');
    
    // Return success response
    res.json({
      success: true,
      message: GOOGLE_OAUTH_MESSAGES.AUTH_SUCCESS,
      // Don't return tokens in response for security
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : GOOGLE_OAUTH_MESSAGES.AUTH_UNEXPECTED_ERROR;
    logger.error('Error in callback:', error);
    res.status(500).json({
      error: GOOGLE_OAUTH_MESSAGES.AUTH_FAILED_GENERIC,
      message: message || GOOGLE_OAUTH_MESSAGES.AUTH_UNEXPECTED_ERROR
    });
  }
});

/**
 * GET /api/v1/external/oauth/status
 * Check OAuth authentication status
 */
router.get('/status', (_req: Request, res: Response): void => {
  try {
    // Check OAuth client credentials (loaded from file on startup)
    let credentials;
    let authenticated = false;
    
    try {
      credentials = getCredentials();
      authenticated = hasCredentials();
    } catch (credError: unknown) {
      const credMessage = credError instanceof Error ? credError.message : String(credError);
      logger.error('Error getting credentials:', credError);
      // Return unauthenticated status if credentials check fails
      res.json({
        authenticated: false,
        authUrl: CALENDAR_ROUTE_MESSAGES.AUTH_URL,
        message: GOOGLE_OAUTH_MESSAGES.VISIT_AUTH_URL,
        error: credMessage
      });
      return;
    }
    
    if (authenticated) {
      res.json({
        authenticated: true,
        hasAccessToken: !!credentials.access_token,
        hasRefreshToken: !!credentials.refresh_token,
        expiryDate: credentials.expiry_date || null,
        tokenExpired: credentials.expiry_date ? credentials.expiry_date < Date.now() : null
      });
      return;
    }
    
    res.json({
      authenticated: false,
      authUrl: CALENDAR_ROUTE_MESSAGES.AUTH_URL,
      message: GOOGLE_OAUTH_MESSAGES.VISIT_AUTH_URL
    })
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : GOOGLE_OAUTH_MESSAGES.UNKNOWN_ERROR;
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error('Error checking status:', error);
    logger.error('Error stack:', stack);
    res.status(500).json({
      error: GOOGLE_OAUTH_MESSAGES.CHECK_STATUS_FAILED,
      message: message || GOOGLE_OAUTH_MESSAGES.UNKNOWN_ERROR,
      stack: process.env.NODE_ENV === NODE_ENV.DEVELOPMENT ? stack : undefined
    });
  }
});

/**
 * GET /api/v1/external/oauth/test-url
 * Get OAuth authorization URL as JSON (for testing/debugging)
 * LEARNING: Returns URL without redirecting, useful for debugging
 * WHY: Allows copying URL directly to browser to test OAuth flow
 */
router.get('/test-url', (_req: Request, res: Response) => {
  try {
    const authUrl = getAuthUrl();
    res.json({
      authUrl,
      message: GOOGLE_OAUTH_MESSAGES.TEST_URL_MESSAGE,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error generating test URL:', error);
    res.status(500).json({
      error: GOOGLE_OAUTH_MESSAGES.AUTH_URL_GENERATE_FAILED,
      message
    });
  }
});

export { router as GoogleOAuthRouter };
