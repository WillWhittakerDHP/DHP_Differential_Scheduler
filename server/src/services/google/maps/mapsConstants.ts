/**
 * Google Maps API Constants
 * 
 */

import { DEFAULT_RETRY_CONFIG, type RetryConfig } from '../shared/googleApiRetry.js'

/**
 * Default retry configuration for Maps API operations
 */
export const MAPS_RETRY_CONFIG: RetryConfig = DEFAULT_RETRY_CONFIG

/**
 * Google Places/Find Place API status strings
 */
export const GOOGLE_API_STATUS = {
  OK: 'OK',
  REQUEST_DENIED: 'REQUEST_DENIED',
  OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
  INVALID_REQUEST: 'INVALID_REQUEST',
  ZERO_RESULTS: 'ZERO_RESULTS',
  NOT_FOUND: 'NOT_FOUND',
} as const

/**
 * Error messages for Maps API operations
 */
export const ERROR_MESSAGES = {
  AUTH: 'Address lookup service is not configured.',
  RATE_LIMIT: 'Too many requests. Please try again in a moment.',
  INVALID: 'Invalid address lookup request.',
  NOT_FOUND: 'Address not found.',
  NETWORK: 'Could not reach address lookup service.',
  UNKNOWN: 'An unexpected error occurred.',
} as const

/** Routes API response condition value for missing route */
export const ROUTES_CONDITION_NOT_FOUND = 'ROUTE_NOT_FOUND' as const

/** Google Places address_components type values (single source of truth) */
export const ADDRESS_COMPONENT_TYPES = {
  STREET_NUMBER: 'street_number',
  ROUTE: 'route',
  LOCALITY: 'locality',
  ADMINISTRATIVE_AREA_LEVEL_1: 'administrative_area_level_1',
  POSTAL_CODE: 'postal_code',
  COUNTRY: 'country',
} as const
