/**
 * Google Maps API Constants
 * 
 * LEARNING: Centralized constants for Google Maps API operations
 * WHY: Single source of truth for Maps API constants, eliminates magic strings
 * PATTERN: Constants module
 */

import { DEFAULT_RETRY_CONFIG, type RetryConfig } from '../shared/googleApiRetry.js'

/**
 * Default retry configuration for Maps API operations
 * LEARNING: Exponential backoff retry configuration
 * WHY: Handles transient errors (rate limits, network issues) automatically
 */
export const MAPS_RETRY_CONFIG: RetryConfig = DEFAULT_RETRY_CONFIG

/**
 * Error messages for Maps API operations
 * LEARNING: User-friendly error messages
 * WHY: Consistent error messaging across Maps API operations
 */
export const ERROR_MESSAGES = {
  AUTH: 'Address lookup service is not configured.',
  RATE_LIMIT: 'Too many requests. Please try again in a moment.',
  INVALID: 'Invalid address lookup request.',
  NOT_FOUND: 'Address not found.',
  NETWORK: 'Could not reach address lookup service.',
  UNKNOWN: 'An unexpected error occurred.',
} as const
