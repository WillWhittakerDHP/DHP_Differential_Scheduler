/**
 * Google Maps API Helper Functions
 * 
 * LEARNING: Utility functions for Google Maps API operations
 * WHY: Reusable helper functions for data transformation and utilities
 * PATTERN: Pure helper functions
 */

import { AddressComponents, RouteLocation, Coordinates } from './mapsTypes.js'
import { MapsApiError } from './mapsErrorHandler.js'

/**
 * Parse address components from Google Places API response
 * LEARNING: Maps Google's address_components to our structured format
 * WHY: Provides normalized address fields for storage
 * PATTERN: Functional approach - map over components
 * 
 * @param components - Array of address components from Google Places API
 * @returns Parsed address components
 */
export function parseAddressComponents(components: Array<{
  types: string[]
  long_name: string
  short_name: string
}>): AddressComponents {
  const result: AddressComponents = {}
  
  for (const component of components) {
    const types = component.types
    
    if (types.includes('street_number')) {
      result.streetNumber = component.long_name
    } else if (types.includes('route')) {
      result.streetName = component.long_name
    } else if (types.includes('locality')) {
      result.city = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.short_name // Use abbreviation for state
    } else if (types.includes('postal_code')) {
      result.postalCode = component.long_name
    } else if (types.includes('country')) {
      result.country = component.short_name // Use country code
    }
  }
  
  return result
}

/**
 * Convert our location format to Routes API waypoint format
 * 
 * LEARNING: Routes API has specific waypoint format
 * WHY: Different from Places API, uses nested structure
 * PATTERN: Priority: placeId > coordinates > address
 * 
 * @param location - Our location format
 * @returns Routes API waypoint format
 * @throws MapsApiError if location has no valid fields
 */
export function toRoutesWaypoint(location: RouteLocation): object {
  if (location.placeId) {
    // Best accuracy - uses exact place identifier
    return { placeId: location.placeId }
  }
  
  if (location.coordinates) {
    // Good accuracy - uses lat/lng
    return {
      location: {
        latLng: {
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng
        }
      }
    }
  }
  
  if (location.address) {
    // Fallback - requires geocoding
    return { address: location.address }
  }
  
  throw new MapsApiError('invalid', 'Location must have placeId, coordinates, or address')
}

/**
 * Generate a session token for billing optimization
 * 
 * LEARNING: Session tokens group autocomplete + details into one billing session
 * WHY: Google charges per session, not per request, when using tokens
 * PATTERN: Generate UUID v4 for session token
 * 
 * @returns UUID v4 string for session token
 */
export function generateSessionToken(): string {
  // Simple UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
