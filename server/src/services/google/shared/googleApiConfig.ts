/**
 * Google API Configuration
 * 
 */

/**
 * Google Maps API base URL
 */
export const GOOGLE_MAPS_API_BASE = 'https://maps.googleapis.com/maps/api'

/**
 * Google Routes API base URL
 */
export const ROUTES_API_BASE = 'https://routes.googleapis.com'

/**
 * Get Google Maps API key from environment
 * 
 * @returns API key string
 * @throws Error if API key is not configured
 */
export function getGoogleMapsApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('Google Maps API key not configured (GOOGLE_API_KEY environment variable)')
  }
  return apiKey
}
