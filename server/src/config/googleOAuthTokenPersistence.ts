/**
 * Google OAuth Token Persistence
 * 
 * LEARNING: File-based token persistence for development convenience
 * WHY: Avoids re-authentication every time server restarts
 * PATTERN: JSON file storage, gitignored for security
 * 
 * Extracted from googleOAuth.ts to reduce complexity and improve cohesion
 */

import fs from 'fs'
import path from 'path'
import { createLogger } from '../utils/logger.js'
import { CALENDAR_ROUTE_MESSAGES } from '../routes/external/calendarRouteConstants.js'

/** Token shape for persistence; shared so callers can set credentials. */
export interface TokenData {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
}

const logger = createLogger('googleOAuth')

/**
 * Token file path for persisting OAuth tokens across server restarts
 * LEARNING: Store tokens in a file for development convenience
 * WHY: Avoids re-authentication on every server restart
 * PATTERN: File stored in server root, gitignored for security
 */
const TOKEN_FILE = path.join(process.cwd(), '.google-tokens.json')

/**
 * Validate that token file exists
 * LEARNING: Helper to check file existence before reading
 * WHY: Separates file validation from parsing logic
 * @param filePath Path to token file
 * @returns File path if exists, null otherwise
 */
function validateTokenFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    logger.info('No saved tokens found - authentication required')
    logger.info(`Visit http://localhost:3001${CALENDAR_ROUTE_MESSAGES.AUTH_URL} to authenticate`)
    return null
  }
  return filePath
}

/**
 * Parse token file and return token data
 * LEARNING: Helper to read and parse JSON file
 * WHY: Separates file I/O from validation logic
 * @param filePath Path to token file
 * @returns Parsed token data or null if parsing fails
 */
function parseTokenFile(filePath: string): TokenData | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const tokens = JSON.parse(fileContent) as TokenData
    return tokens
  } catch (error) {
    logger.error('Failed to parse token file:', error)
    return null
  }
}

/**
 * Validate that tokens have required fields
 * LEARNING: Helper to check token validity
 * WHY: Separates validation logic from main function
 * @param tokens Token data to validate
 * @returns true if tokens are valid, false otherwise
 */
function validateTokens(tokens: TokenData): boolean {
  if (!tokens.refresh_token) {
    logger.warn('Saved tokens missing refresh_token - re-authentication required')
    return false
  }
  return true
}

/**
 * Log token status information
 * LEARNING: Helper to log token status for debugging
 * WHY: Separates logging logic from main function
 * @param tokens Token data to log status for
 */
function logTokenStatus(tokens: TokenData): void {
  logger.info('Tokens loaded from file')
  logger.debug('Has access token:', !!tokens.access_token)
  logger.debug('Has refresh token:', !!tokens.refresh_token)
  
  // Check if access token is expired
  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    logger.info('Access token expired - will auto-refresh on next API call')
  }
}

/**
 * Save tokens to file for persistence across server restarts
 * 
 * LEARNING: File-based persistence for development convenience
 * WHY: Avoids re-authentication every time server restarts
 * PATTERN: JSON file storage, gitignored for security
 * 
 * @param tokens Token object from OAuth flow (Google Credentials type)
 */
export function saveTokensToFile(tokens: object): void {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2))
    logger.info('Tokens saved to file:', TOKEN_FILE)
  } catch (error) {
    logger.error('Failed to save tokens to file:', error)
  }
}

/**
 * Load tokens from file on server startup
 * 
 * LEARNING: Restores authentication state from previous session
 * WHY: No need to re-authenticate after server restart
 * PATTERN: Check file exists, load and set credentials
 * 
 * Refactored to reduce complexity by extracting helper functions:
 * - validateTokenFile: Check file exists
 * - parseTokenFile: Read and parse JSON
 * - validateTokens: Check required fields
 * - logTokenStatus: Log status information
 * 
 * @returns Loaded token data or null if not found/invalid (caller sets credentials)
 */
export function loadTokensFromFile(): TokenData | null {
  const filePath = validateTokenFile(TOKEN_FILE)
  if (!filePath) return null

  const tokens = parseTokenFile(filePath)
  if (!tokens || !validateTokens(tokens)) return null

  logTokenStatus(tokens)
  return tokens
}
