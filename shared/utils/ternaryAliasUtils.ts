import {
  BOOKING_MODE_DOMAIN_TO_TERNARY,
  BOOKING_MODE_TERNARY_TO_DOMAIN,
  type BookingModeDomain,
} from '../constants/ternaryFieldMappings'
import type { TernaryBoolean } from '../types/ternary'

export function isTernaryBoolean(value: unknown): value is TernaryBoolean {
  return value === 'true' || value === 'false' || value === 'override'
}

export function ternaryToBookingMode(
  t: TernaryBoolean | string | undefined | null,
  defaultValue: BookingModeDomain = 'standalone'
): BookingModeDomain {
  if (t === 'true' || t === 'false' || t === 'override') {
    return BOOKING_MODE_TERNARY_TO_DOMAIN[t]
  }
  return defaultValue
}

export function bookingModeToTernary(m: BookingModeDomain | string | undefined | null): TernaryBoolean {
  if (m === 'standalone' || m === 'addOn' || m === 'both') {
    return BOOKING_MODE_DOMAIN_TO_TERNARY[m]
  }
  return 'false'
}

export function isAddOnOnly(mode: TernaryBoolean | string | undefined | null): boolean {
  return mode === 'true'
}

export function isStandaloneOnly(mode: TernaryBoolean | string | undefined | null): boolean {
  return mode === 'false'
}

/** Accepts stored ternary or legacy domain strings (pre-migration API/cache). */
export function rawBookingModeIsAddOnOnly(value: unknown): boolean {
  return value === 'true' || value === 'addOn'
}

/** Accepts stored ternary or legacy domain strings (pre-migration API/cache). */
export function rawBookingModeIsStandaloneOnly(value: unknown): boolean {
  return value === 'false' || value === 'standalone' || value === undefined || value === null
}

/** Add-on-only or both (line items / dependents), not standalone-only. */
export function rawBookingModeAllowsDependentLineItems(value: unknown): boolean {
  return value === 'true' || value === 'override' || value === 'addOn' || value === 'both'
}
