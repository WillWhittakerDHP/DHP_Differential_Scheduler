
export const API_MESSAGES = {
  SERVER_NAME: 'API Server',
  DOCS_MESSAGE: 'See API documentation for available endpoints',
} as const

export const API_VERSION = '1.0.0' as const

export const ROUTE_PATHS = {
  API: '/api',
  OAUTH_CALLBACK: '/oauth2callback',
} as const

export const OAUTH_ERROR_MESSAGES = {
  AUTHORIZATION_FAILED: 'Authorization failed',
  GOOGLE_ERROR: (error: string | undefined): string => `Google returned error: ${error}`,
  INVALID_REQUEST: 'Invalid request',
  CODE_REQUIRED: 'Authorization code is required',
  AUTHENTICATION_FAILED: 'Authentication failed',
  UNEXPECTED_ERROR: 'An unexpected error occurred during authentication',
} as const

export const OAUTH_SUCCESS_MESSAGES = {
  TOKENS_SAVED: 'Authentication successful - tokens saved for future sessions',
} as const

export const NODE_ENV = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const

export const APP_STAGE = {
  LOCAL: 'local',
  STAGING: 'staging',
  ALPHA: 'alpha',
  BETA: 'beta',
  PRODUCTION: 'production',
} as const

export type AppStageValue = (typeof APP_STAGE)[keyof typeof APP_STAGE]

export const AVAILABILITY_SETTINGS_KEY = 'availability_settings' as const
