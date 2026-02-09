/**
 * Google API Configuration
 * 
 * LEARNING: Centralized configuration for Google API services
 * WHY: Single source of truth for API keys and base URLs
 * PATTERN: Configuration module for shared constants
 */

/**
 * Google Maps API base URL
 * LEARNING: Base URL for Places API endpoints
 */
export const GOOGLE_MAPS_API_BASE = 'https://maps.googleapis.com/maps/api'

/**
 * Google Routes API base URL
 * LEARNING: Routes API uses a different base URL than Places API
 */
export const ROUTES_API_BASE = 'https://routes.googleapis.com'

/**
 * Get Google Maps API key from environment
 * LEARNING: Uses existing GOOGLE_API_KEY from .env.development
 * WHY: Centralized API key retrieval with error handling
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
