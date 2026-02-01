import { Router, Request, Response } from 'express';
import { getAuthUrl, getTokens, setCredentials, getCredentials } from '../../config/googleOAuth.js';

/**
 * Google OAuth Routes
 * 
 * LEARNING: Routes for Google OAuth 2.0 authentication flow
 * WHY: Provides HTTP endpoints for OAuth authentication
 * PATTERN: Express router with OAuth flow handling
 * 
 * NOTE: Token storage is currently in-memory (oauth2Client). For production,
 * tokens should be stored securely in database (encrypted).
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
    console.error('[GoogleOAuthRoutes] Error generating auth URL:', error);
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
      console.error('[GoogleOAuthRoutes] OAuth error:', error);
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
    
    // Set credentials on OAuth client (stored in-memory for now)
    // TODO: Store tokens securely in database for production
    setCredentials(tokens);
    
    console.log('[GoogleOAuthRoutes] OAuth authentication successful');
    
    // Return success response
    res.json({
      success: true,
      message: 'Authentication successful',
      // Don't return tokens in response for security
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });
    
  } catch (error: any) {
    console.error('[GoogleOAuthRoutes] Error in callback:', error);
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
router.get('/status', (_req: Request, res: Response) => {
  try {
    // Check OAuth client credentials (in-memory storage)
    const credentials = getCredentials();
    
    if (credentials?.access_token) {
      res.json({
        authenticated: true,
        hasRefreshToken: !!credentials.refresh_token,
        expiryDate: credentials.expiry_date || null
      });
      return;
    }
    
    res.json({
      authenticated: false,
      authUrl: '/api/v1/external/oauth'
    });
    
  } catch (error: any) {
    console.error('[GoogleOAuthRoutes] Error checking status:', error);
    res.status(500).json({
      error: 'Failed to check authentication status',
      message: error.message
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
    console.error('[GoogleOAuthRoutes] Error generating test URL:', error);
    res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message
    });
  }
});

export { router as GoogleOAuthRouter };
