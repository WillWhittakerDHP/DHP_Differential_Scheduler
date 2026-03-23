
import fs from 'fs'
import path from 'path'
import { createLogger } from '../utils/logger.js'
import { CALENDAR_ROUTE_MESSAGES } from '../routes/external/calendarRouteConstants.js'

/** Token shape for persistence; shared so callers can set credentials. */
interface TokenData {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
}

const logger = createLogger('googleOAuth')

const TOKEN_FILE = path.join(process.cwd(), '.google-tokens.json')

/**
 * Validate that token file exists
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

function logTokenStatus(tokens: TokenData): void {
  logger.info('Tokens loaded from file')
  logger.debug('Has access token:', !!tokens.access_token)
  logger.debug('Has refresh token:', !!tokens.refresh_token)
  
  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    logger.info('Access token expired - will auto-refresh on next API call')
  }
}

export function saveTokensToFile(tokens: object): void {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2))
    logger.info('Tokens saved to file:', TOKEN_FILE)
  } catch (error) {
    logger.error('Failed to save tokens to file:', error)
  }
}

export function loadTokensFromFile(): TokenData | null {
  const filePath = validateTokenFile(TOKEN_FILE)
  if (!filePath) return null

  const tokens = parseTokenFile(filePath)
  if (!tokens || !validateTokens(tokens)) return null

  logTokenStatus(tokens)
  return tokens
}
