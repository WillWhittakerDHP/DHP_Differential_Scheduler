
export const GOOGLE_MAPS_API_BASE = 'https://maps.googleapis.com/maps/api'

export const ROUTES_API_BASE = 'https://routes.googleapis.com'

export function getGoogleMapsApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('Google Maps API key not configured (GOOGLE_API_KEY environment variable)')
  }
  return apiKey
}
