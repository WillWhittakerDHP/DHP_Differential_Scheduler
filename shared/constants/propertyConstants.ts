/**
 * Shared Property Constants
 *
 * LEARNING: Single source of truth for property source value used by client and server
 * WHY: Consolidates inline 'client' literal for constants consolidation audit
 * PATTERN: Exported const; client and server use for default property source
 */

/** Default property source value when source is client-provided */
export const DEFAULT_PROPERTY_SOURCE = 'client' as const
