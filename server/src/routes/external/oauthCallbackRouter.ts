import { Router, Request, Response } from 'express'
import { getTokens, setCredentials, saveTokensToFile } from '../../config/googleOAuth.js'
import { createLogger } from '../../utils/logger.js'
import {
  OAUTH_ERROR_MESSAGES,
  OAUTH_SUCCESS_MESSAGES,
} from '../../constants/appConstants.js'

/**
 * OAuth Callback Router
 * 
 * LEARNING: Handles Google OAuth callback at root level for compatibility
 * WHY: Google OAuth requires simpler redirect URI paths (not nested under /api)
 * PATTERN: Express router with OAuth flow handling and structured logging
 * 
 * Extracted from app.ts to reduce complexity and improve separation of concerns
 */

const logger = createLogger('oauthCallback')
const router = Router()

/**
 * GET /oauth2callback
 * Handle OAuth callback - exchanges authorization code for tokens
 * 
 * LEARNING: Root-level route for OAuth callback compatibility
 * WHY: Google OAuth redirect URIs work better with simpler paths
 * 
 * Query parameters:
 * - code: Authorization code from Google
 * - error: Error code if authorization failed
 * - error_description: Description of authorization error
 */
router.get('/oauth2callback', async (req: Request, res: Response) => {
  logger.debug('Callback route hit')
  logger.debug('Query params:', JSON.stringify(req.query))
  logger.debug('Full URL:', req.url)
  logger.debug('Request headers:', JSON.stringify(req.headers))
  logger.debug('Raw query string:', req.url.split('?')[1] || 'none')

  try {
    const { code, error, error_description } = req.query

    // Handle authorization errors
    if (error) {
      logger.error('OAuth error:', error)
      logger.error('Error description:', error_description)
      res.status(400).json({
        error: OAUTH_ERROR_MESSAGES.AUTHORIZATION_FAILED,
        message: OAUTH_ERROR_MESSAGES.GOOGLE_ERROR(error as string | undefined),
        error_description: error_description || null,
      })
      return
    }

    // Validate authorization code
    if (!code || typeof code !== 'string') {
      logger.warn('No authorization code received')
      logger.debug('Query keys:', Object.keys(req.query))
      res.status(400).json({
        error: OAUTH_ERROR_MESSAGES.INVALID_REQUEST,
        message: OAUTH_ERROR_MESSAGES.CODE_REQUIRED,
        received_params: Object.keys(req.query),
      })
      return
    }

    logger.info('Authorization code received, exchanging for tokens...')

    // Exchange code for tokens
    const tokens = await getTokens(code)

    // Set credentials on OAuth client
    setCredentials(tokens)

    // Save tokens to file for persistence across restarts
    // SESSION: 2.1.3b - Persist tokens across server restarts
    saveTokensToFile(tokens)

    logger.info('OAuth authentication successful')
    logger.debug('Has access token:', !!tokens.access_token)
    logger.debug('Has refresh token:', !!tokens.refresh_token)

    // Return success response
    res.json({
      success: true,
      message: OAUTH_SUCCESS_MESSAGES.TOKENS_SAVED,
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
    })
  } catch (error: any) {
    logger.error('Error in callback:', error)
    logger.error('Error stack:', error.stack)
    res.status(500).json({
      error: OAUTH_ERROR_MESSAGES.AUTHENTICATION_FAILED,
      message: error.message || OAUTH_ERROR_MESSAGES.UNEXPECTED_ERROR,
    })
  }
})

export { router as OAuthCallbackRouter }
