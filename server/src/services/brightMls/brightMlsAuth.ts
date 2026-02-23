/**
 * Bright MLS Authentication
 *
 *
 * Env vars:
 * - BRIGHT_MLS_ACCESS_TOKEN: Direct Bearer token (if provided)
 * - BRIGHT_MLS_CLIENT_ID, BRIGHT_MLS_CLIENT_SECRET: OAuth client credentials
 * - BRIGHT_MLS_TOKEN_URL: OAuth token endpoint (vendor-specific)
 */

import { createLogger } from '../../utils/logger.js';

const logger = createLogger('BrightMlsAuth');

/**
 * Check if Bright MLS is configured with any auth method
 */
export function isBrightMlsConfigured(): boolean {
  const token = process.env.BRIGHT_MLS_ACCESS_TOKEN;
  const clientId = process.env.BRIGHT_MLS_CLIENT_ID;
  const clientSecret = process.env.BRIGHT_MLS_CLIENT_SECRET;

  return !!(token?.trim() || (clientId?.trim() && clientSecret?.trim()));
}

/**
 * Get access token for Bright MLS API
 * Prefers direct BRIGHT_MLS_ACCESS_TOKEN; falls back to OAuth client credentials
 *
 * @returns Access token string, or null if not configured
 */
export async function getAccessToken(): Promise<string | null> {
  const directToken = process.env.BRIGHT_MLS_ACCESS_TOKEN?.trim();
  if (directToken) {
    return directToken;
  }

  const clientId = process.env.BRIGHT_MLS_CLIENT_ID?.trim();
  const clientSecret = process.env.BRIGHT_MLS_CLIENT_SECRET?.trim();
  const tokenUrl = process.env.BRIGHT_MLS_TOKEN_URL?.trim();

  if (!clientId || !clientSecret || !tokenUrl) {
    logger.debug('Bright MLS not configured: missing ACCESS_TOKEN or OAuth credentials');
    return null;
  }

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      logger.error('Bright MLS token request failed', {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = (await response.json()) as { access_token?: string };
    const token = data.access_token;
    if (!token || typeof token !== 'string') {
      logger.error('Bright MLS token response missing access_token');
      return null;
    }

    return token;
  } catch (error) {
    logger.error('Bright MLS token request error', { error });
    return null;
  }
}
