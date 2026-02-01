import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

/**
 * Google OAuth Configuration
 * 
 * LEARNING: OAuth2Client setup for Google Calendar API authentication
 * WHY: Provides secure authentication flow for accessing Google Calendar API
 * PATTERN: Centralized OAuth configuration module for Google APIs
 * 
 * SESSION: 2.1.3b - Added file-based token persistence for development
 * WHY: Tokens survive server restarts, no need to re-authenticate repeatedly
 */

/**
 * Token file path for persisting OAuth tokens across server restarts
 * LEARNING: Store tokens in a file for development convenience
 * WHY: Avoids re-authentication on every server restart
 * PATTERN: File stored in server root, gitignored for security
 */
const TOKEN_FILE = path.join(process.cwd(), '.google-tokens.json');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
/**
 * LEARNING: Google Calendar API scopes determine what operations are allowed
 * WHY: Different scopes for read-only vs write operations
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
 * LEARNING: Configured with client credentials from environment variables
 * WHY: Reusable client instance for all OAuth operations
 */
export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

/**
 * Generate authorization URL for OAuth flow
 * LEARNING: Creates URL that redirects user to Google consent screen
 * WHY: First step in OAuth 2.0 authorization code flow
 * @returns Authorization URL string
 */
export function getAuthUrl(): string {
  // Debug: Log all configuration values
  console.log('[GoogleOAuth] Client ID:', GOOGLE_CLIENT_ID);
  console.log('[GoogleOAuth] Redirect URI configured:', GOOGLE_REDIRECT_URI);
  console.log('[GoogleOAuth] Scopes:', GOOGLE_SCOPES);
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: GOOGLE_SCOPES,
    prompt: 'consent' // Force consent screen to get refresh token
  });
  
  // Debug: Parse and log the redirect_uri from the generated URL
  const urlObj = new URL(authUrl);
  const redirectUriParam = urlObj.searchParams.get('redirect_uri');
  console.log('[GoogleOAuth] Redirect URI in auth URL:', redirectUriParam);
  console.log('[GoogleOAuth] Full generated auth URL:', authUrl);
  
  return authUrl;
}

/**
 * Exchange authorization code for access and refresh tokens
 * LEARNING: Completes OAuth flow by exchanging code for tokens
 * WHY: Required to get access token for API calls
 * @param code Authorization code from OAuth callback
 * @returns Token response with access_token, refresh_token, etc.
 */
export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * Refresh expired access token using refresh token
 * LEARNING: Uses refresh token to get new access token without user interaction
 * WHY: Access tokens expire, refresh tokens allow automatic renewal
 * @param refreshToken Refresh token from previous OAuth flow
 * @returns New token response
 */
export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

/**
 * Get authenticated calendar client using access token
 * LEARNING: Creates calendar API client with authenticated OAuth2Client
 * WHY: Provides authenticated client for making Calendar API calls
 * @param accessToken Access token for authentication
 * @returns Authenticated calendar client
 */
export function getAuthenticatedClient(accessToken: string): OAuth2Client {
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

/**
 * Set credentials on OAuth2Client
 * LEARNING: Updates client with new tokens
 * WHY: Allows updating tokens without creating new client instance
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
 * LEARNING: Retrieves current tokens from client
 * WHY: Useful for storing tokens in session/database
 * @returns Current credentials object
 */
export function getCredentials() {
  return oauth2Client.credentials;
}

// =============================================================================
// TOKEN PERSISTENCE (Development)
// =============================================================================

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
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    console.log('[GoogleOAuth] Tokens saved to file:', TOKEN_FILE);
  } catch (error) {
    console.error('[GoogleOAuth] Failed to save tokens to file:', error);
  }
}

/**
 * Load tokens from file on server startup
 * 
 * LEARNING: Restores authentication state from previous session
 * WHY: No need to re-authenticate after server restart
 * PATTERN: Check file exists, load and set credentials
 * 
 * @returns true if tokens were loaded, false otherwise
 */
export function loadTokensFromFile(): boolean {
  try {
    if (!fs.existsSync(TOKEN_FILE)) {
      console.log('[GoogleOAuth] No saved tokens found - authentication required');
      console.log('[GoogleOAuth] Visit http://localhost:3001/api/v1/external/oauth to authenticate');
      return false;
    }

    const fileContent = fs.readFileSync(TOKEN_FILE, 'utf-8');
    const tokens = JSON.parse(fileContent) as {
      access_token?: string | null;
      refresh_token?: string | null;
      expiry_date?: number | null;
    };

    if (!tokens.refresh_token) {
      console.warn('[GoogleOAuth] Saved tokens missing refresh_token - re-authentication required');
      return false;
    }

    oauth2Client.setCredentials(tokens);
    console.log('[GoogleOAuth] Tokens loaded from file');
    console.log('[GoogleOAuth] Has access token:', !!tokens.access_token);
    console.log('[GoogleOAuth] Has refresh token:', !!tokens.refresh_token);
    
    // Check if access token is expired
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      console.log('[GoogleOAuth] Access token expired - will auto-refresh on next API call');
    }

    return true;
  } catch (error) {
    console.error('[GoogleOAuth] Failed to load tokens from file:', error);
    return false;
  }
}

/**
 * Check if we have valid credentials (either in memory or on file)
 * 
 * LEARNING: Convenience check for authentication status
 * WHY: Allows code to check if re-authentication is needed
 * 
 * @returns true if credentials are available
 */
export function hasCredentials(): boolean {
  const creds = oauth2Client.credentials;
  return !!(creds.access_token || creds.refresh_token);
}
