import { google } from 'googleapis'
import { createLogger } from '../utils/logger.js'
import {
  saveTokensToFile as saveTokensToFileImpl,
  loadTokensFromFile as loadTokensFromFileImpl
} from './googleOAuthTokenPersistence.js'

/**
 * Google OAuth Configuration
 * 
 * 
 * SESSION: 2.1.3b - Added file-based token persistence for development
 */

const logger = createLogger('googleOAuth')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
/**
 * - calendar.readonly: Read calendar data (events, free-busy)
 * - calendar.freebusy: Read free-busy information
 * - calendar.events: Create, update, delete events (required for booking)
 */
const GOOGLE_SCOPES = process.env.GOOGLE_SCOPES?.split(',') || [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events'
];

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error('Missing required Google OAuth environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI');
}

/**
 * OAuth2Client instance for Google Calendar API
 */
export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

/**
 * Generate authorization URL for OAuth flow
 * @returns Authorization URL string
 */
export function getAuthUrl(): string {
  logger.debug('Client ID:', GOOGLE_CLIENT_ID)
  logger.debug('Redirect URI configured:', GOOGLE_REDIRECT_URI)
  logger.debug('Scopes:', GOOGLE_SCOPES)
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: GOOGLE_SCOPES,
    prompt: 'consent' // Force consent screen to get refresh token
  })
  
  // Debug: Parse and log the redirect_uri from the generated URL
  const urlObj = new URL(authUrl)
  const redirectUriParam = urlObj.searchParams.get('redirect_uri')
  logger.debug('Redirect URI in auth URL:', redirectUriParam)
  logger.debug('Full generated auth URL:', authUrl)
  
  return authUrl
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param code Authorization code from OAuth callback
 * @returns Token response with access_token, refresh_token, etc.
 */
export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens
}

/**
 * Set credentials on OAuth2Client
 * @param tokens Token object with access_token, refresh_token, etc.
 */
export function setCredentials(tokens: {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
}) {
  oauth2Client.setCredentials(tokens);
}

/**
 * Get current credentials from OAuth2Client
 * @returns Current credentials object
 */
export function getCredentials() {
  return oauth2Client.credentials;
}

/**
 * Re-export for backward compatibility; persistence has no dependency on t...
 */
export const saveTokensToFile = saveTokensToFileImpl

/**
 * Load tokens from file and set on oauth2Client
 */
export function loadTokensFromFile(): boolean {
  const tokens = loadTokensFromFileImpl()
  if (!tokens) return false
  oauth2Client.setCredentials(tokens)
  return true
}

/**
 * Check if we have valid credentials (either in memory or on file)
 * 
 * 
 * @returns true if credentials are available
 */
export function hasCredentials(): boolean {
  const creds = oauth2Client.credentials;
  return !!(creds.access_token || creds.refresh_token);
}
