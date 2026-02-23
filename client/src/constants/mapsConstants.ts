
import type { MapsApiErrorType } from '@shared/types/mapsTypes'

export const GOOGLE_API_STATUS = {
  OK: 'OK',
  NOT_FOUND: 'NOT_FOUND',
  ZERO_RESULTS: 'ZERO_RESULTS',
} as const

export type RouteMatrixStatus =
  | typeof GOOGLE_API_STATUS.OK
  | typeof GOOGLE_API_STATUS.NOT_FOUND
  | typeof GOOGLE_API_STATUS.ZERO_RESULTS

export const MAPS_ERROR_MESSAGES: Record<MapsApiErrorType, string> = {
  auth: 'Address lookup is not configured.',
  rate_limit: 'Too many requests. Please try again in a moment.',
  invalid: 'Invalid address lookup request.',
  not_found: 'Address not found.',
  network: 'Could not reach address service. Check your connection.',
  unknown: 'An unexpected error occurred.'
} as const
