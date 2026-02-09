import { Router, Request, Response } from 'express';
import { getAuthUrl, getTokens, setCredentials, getCredentials, saveTokensToFile, hasCredentials } from '../../config/googleOAuth.js';
import { createLogger } from '../../utils/logger.js';

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
  } catch (error: any) {
    logger.error('Error generating auth URL:', error);
    res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message
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
        error: 'Authorization failed',
        message: `Google returned error: ${error}`
      });
      return;
    }
    
    // Validate authorization code
    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Authorization code is required'
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
      message: 'Authentication successful - tokens saved for future sessions',
      // Don't return tokens in response for security
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });
    
  } catch (error: any) {
    logger.error('Error in callback:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message || 'An unexpected error occurred during authentication'
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
    } catch (credError: any) {
      logger.error('Error getting credentials:', credError);
      // Return unauthenticated status if credentials check fails
      res.json({
        authenticated: false,
        authUrl: '/api/v1/external/oauth',
        message: 'Visit the authUrl to authenticate with Google',
        error: credError.message
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
      authUrl: '/api/v1/external/oauth',
      message: 'Visit the authUrl to authenticate with Google'
    });
    
  } catch (error: any) {
    logger.error('Error checking status:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to check authentication status',
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      message: 'Copy this URL and paste it in your browser to test the OAuth flow',
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
  } catch (error: any) {
    logger.error('Error generating test URL:', error);
    res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message
    });
  }
});

export { router as GoogleOAuthRouter };
