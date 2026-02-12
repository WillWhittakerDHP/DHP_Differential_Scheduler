/**
 * Application Constants
 * 
 * LEARNING: Centralized constants for application-level messages and configuration
 * WHY: Avoids hardcoding strings throughout the codebase, improves maintainability
 * PATTERN: Grouped constants by domain (API, OAuth, Routes)
 */

/**
 * API response messages
 */
export const API_MESSAGES = {
  SERVER_NAME: 'API Server',
  DOCS_MESSAGE: 'See API documentation for available endpoints',
} as const

/**
 * API version
 */
export const API_VERSION = '1.0.0' as const

/**
 * Route paths
 */
export const ROUTE_PATHS = {
  API: '/api',
  OAUTH_CALLBACK: '/oauth2callback',
} as const

/**
 * OAuth error messages
 */
export const OAUTH_ERROR_MESSAGES = {
  AUTHORIZATION_FAILED: 'Authorization failed',
  GOOGLE_ERROR: (error: string | undefined): string => `Google returned error: ${error}`,
  INVALID_REQUEST: 'Invalid request',
  CODE_REQUIRED: 'Authorization code is required',
  AUTHENTICATION_FAILED: 'Authentication failed',
  UNEXPECTED_ERROR: 'An unexpected error occurred during authentication',
} as const

/**
 * OAuth success messages
 */
export const OAUTH_SUCCESS_MESSAGES = {
  TOKENS_SAVED: 'Authentication successful - tokens saved for future sessions',
} as const

/**
 * Node environment (mirror of process.env.NODE_ENV values)
 */
export const NODE_ENV = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const

/**
 * Setting key for availability configuration (shared by appointments and business settings)
 */
export const AVAILABILITY_SETTINGS_KEY = 'availability_settings' as const
