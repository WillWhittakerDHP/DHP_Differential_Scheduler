/**
 * Maps API Error Message Constants
 *
 * LEARNING: Centralized user-facing error messages for Maps/Places API
 * WHY: Eliminates hardcoding, single source of truth
 */

import type { MapsApiErrorType } from '@shared/types/mapsTypes'

export const MAPS_ERROR_MESSAGES: Record<MapsApiErrorType, string> = {
  auth: 'Address lookup is not configured.',
  rate_limit: 'Too many requests. Please try again in a moment.',
  invalid: 'Invalid address lookup request.',
  not_found: 'Address not found.',
  network: 'Could not reach address service. Check your connection.',
  unknown: 'An unexpected error occurred.'
} as const
