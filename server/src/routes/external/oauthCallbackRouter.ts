import { Router, Request, Response } from 'express'
import Joi from 'joi'
import { getTokens, setCredentials, saveTokensToFile } from '../../config/googleOAuth.js'
import { createLogger } from '../../utils/logger.js'
import { isProduction } from '../../utils/envHelpers.js' // NODE_ENV production: error message not sent to client
import {
  OAUTH_ERROR_MESSAGES,
  OAUTH_SUCCESS_MESSAGES,
  ROUTE_PATHS,
} from '../../constants/appConstants.js'

const callbackQuerySchema = Joi.object({
  code: Joi.string().optional(),
  error: Joi.string().optional(),
  error_description: Joi.string().optional(),
}).unknown(true)

/**
 * OAuth Callback Router
 * 
 * 
 * Extracted from app.ts to reduce complexity and improve separation of concerns
 */

const logger = createLogger('oauthCallback')
const router = Router()

router.get(ROUTE_PATHS.OAUTH_CALLBACK, async (req: Request, res: Response) => {
  logger.debug('Callback route hit')
  logger.debug('Query params:', JSON.stringify(req.query))
  logger.debug('Full URL:', req.url)
  logger.debug('Request headers:', JSON.stringify(req.headers))
  logger.debug('Raw query string:', req.url.split('?')[1] || 'none')

  try {
    const validation = callbackQuerySchema.validate(req.query, { abortEarly: false })
    if (validation.error) {
      res.status(400).json({
        error: OAUTH_ERROR_MESSAGES.INVALID_REQUEST,
        message: validation.error.message,
        received_params: Object.keys(req.query),
      })
      return
    }
    const { code, error, error_description } = validation.value

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

    const tokens = await getTokens(code)

    setCredentials(tokens)

    saveTokensToFile(tokens)

    logger.info('OAuth authentication successful')
    logger.debug('Has access token:', !!tokens.access_token)
    logger.debug('Has refresh token:', !!tokens.refresh_token)

    res.json({
      success: true,
      message: OAUTH_SUCCESS_MESSAGES.TOKENS_SAVED,
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : OAUTH_ERROR_MESSAGES.UNEXPECTED_ERROR;
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error('Error in callback:', error);
    if (!isProduction()) logger.error('Error stack:', stack);
    const safeMessage = isProduction() ? OAUTH_ERROR_MESSAGES.UNEXPECTED_ERROR : (message || OAUTH_ERROR_MESSAGES.UNEXPECTED_ERROR);
    res.status(500).json({
      error: OAUTH_ERROR_MESSAGES.AUTHENTICATION_FAILED,
      message: safeMessage,
    });
  }
})

export { router as OAuthCallbackRouter }
