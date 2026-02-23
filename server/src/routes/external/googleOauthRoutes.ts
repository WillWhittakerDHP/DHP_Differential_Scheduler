import { Router, Request, Response } from 'express'
import Joi from 'joi'
import { getAuthUrl, getTokens, setCredentials, getCredentials, saveTokensToFile, hasCredentials } from '../../config/googleOAuth.js'
import { createLogger } from '../../utils/logger.js'
import { CALENDAR_ROUTE_MESSAGES } from './calendarRouteConstants.js'
import { GOOGLE_OAUTH_MESSAGES, NODE_ENV } from './googleOauthConstants.js'

const logger = createLogger('GoogleOAuthRoutes');


const router = Router();

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

const callbackQuerySchema = Joi.object({
  code: Joi.string().optional(),
  error: Joi.string().optional(),
}).unknown(true);

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const validation = callbackQuerySchema.validate(req.query, { abortEarly: false });
    if (validation.error) {
      res.status(400).json({
        error: GOOGLE_OAUTH_MESSAGES.INVALID_REQUEST,
        message: validation.error.message,
      });
      return;
    }
    const { code, error } = validation.value;

    if (error) {
      logger.error('OAuth error:', error);
      res.status(400).json({
        error: GOOGLE_OAUTH_MESSAGES.AUTH_FAILED,
        message: GOOGLE_OAUTH_MESSAGES.AUTH_FAILED_GOOGLE(String(error))
      });
      return;
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: GOOGLE_OAUTH_MESSAGES.INVALID_REQUEST,
        message: GOOGLE_OAUTH_MESSAGES.AUTH_CODE_REQUIRED
      });
      return;
    }

    const tokens = await getTokens(code);

    setCredentials(tokens);
    
    saveTokensToFile(tokens);
    
    logger.info('OAuth authentication successful');
    
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

router.get('/status', (_req: Request, res: Response): void => {
  try {
    let credentials;
    let authenticated = false;
    
    try {
      credentials = getCredentials();
      authenticated = hasCredentials();
    } catch (credError: unknown) {
      const credMessage = credError instanceof Error ? credError.message : String(credError);
      logger.error('Error getting credentials:', credError);
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
