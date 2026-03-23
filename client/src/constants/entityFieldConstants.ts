export const FIELD_NAMES = {
  ORDER_INDEX: 'orderIndex',
  BOOKING_MODE: 'bookingMode',
  AGENT_PERMISSIONS: 'agentPermissions',
  ID: 'id',
  ENTITY_KEY: 'entityKey',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  ANNOTATIONS: 'annotations',
  /** blockInstance → booking transformer / API field key */
  DIFFERENTIAL_EVENT_ROLE_OVERRIDES: 'differentialEventRoleOverrides',
  /** Matches server entityConstants FIELD_NAMES.DIFFERENTIAL_ROLE (event shape / API). */
  DIFFERENTIAL_ROLE: 'differentialRole',
} as const

export const TEMPORARY_ID_PATTERNS = {
  NEW_PREFIX: 'new-',
} as const

export const DEFAULT_VALUES = {
  /** Domain default for BookingBlockInstance / wizard. */
  BOOKING_MODE: 'standalone' as const,
  /** API/storage default for blockInstance.bookingMode (ternary_boolean). */
  DEFAULT_TERNARY_BOOKING_MODE: 'false' as const,
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
