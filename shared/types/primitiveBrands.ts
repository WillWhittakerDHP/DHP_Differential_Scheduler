/**
 * Canonical branded primitive types shared by client and server.
 * WHY: Single source of truth for string-like concepts; branding prevents mixing at type level.
 * PATTERN: Branded types + re-exports; conversion helpers live in client/server at boundaries.
 */

/** Branded date-only string (YYYY-MM-DD). Use at API boundaries with toISO8601Date. */
export type ISO8601Date = string & { readonly __brand: 'ISO8601Date' }

/** Branded global entity ID. Use at boundaries with toGlobalEntityId (client) or equivalent. */
export type GlobalEntityId = string & { readonly __brand: 'GlobalEntityId' }

/** Re-export so primitiveBrands is the single import for all three. */
export type { RFC3339DateTime } from './availabilityTypes'
