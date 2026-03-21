import type { TernaryBoolean } from '../types/ternary'

/** Domain booking mode (wizard / BookingBlockInstance). */
export type BookingModeDomain = 'standalone' | 'addOn' | 'both'

/**
 * WHY: booking_mode column stores TernaryBoolean; booking UI uses domain aliases.
 */
export const BOOKING_MODE_TERNARY_TO_DOMAIN: Record<TernaryBoolean, BookingModeDomain> = {
  false: 'standalone',
  true: 'addOn',
  override: 'both',
}

export const BOOKING_MODE_DOMAIN_TO_TERNARY: Record<BookingModeDomain, TernaryBoolean> = {
  standalone: 'false',
  addOn: 'true',
  both: 'override',
}
