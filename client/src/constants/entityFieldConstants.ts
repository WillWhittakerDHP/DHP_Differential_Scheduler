/**
 * Entity Field Constants (client mirror of server entityConstants)
 *
 * WHY: Single source of truth for field names and temporary-id patterns; aligns with server contract
 * PATTERN: Mirror of server/src/routes/internal/entities/entityConstants.ts for client-only usage
 * @audit-allow:hardcoding:magicLabel - Canonical source; string literals are the constant definitions.
 */

export const FIELD_NAMES = {
  ORDER_INDEX: 'orderIndex',
  BOOKING_MODE: 'bookingMode',
  ID: 'id',
  ENTITY_KEY: 'entityKey',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  ANNOTATIONS: 'annotations',
} as const

export const TEMPORARY_ID_PATTERNS = {
  NEW_PREFIX: 'new-',
} as const

export const DEFAULT_VALUES = {
  BOOKING_MODE: 'standalone' as const,
} as const

/** Status labels for entity active/inactive (display and form defaults). */
export const ENTITY_STATUS = {
  ACTIVE: 'Active' as const,
  INACTIVE: 'Inactive' as const,
} as const

/** Common display labels for entity fields. */
export const DISPLAY_LABELS = {
  NAME: 'Name' as const,
} as const
