export const FIELD_NAMES = {
  ORDER_INDEX: 'orderIndex',
  ORCHESTRATOR: 'orchestrator',
  WIZARD_VISIBLE: 'wizardVisible',
  AGENT_PERMISSIONS: 'agentPermissions',
  ID: 'id',
  ENTITY_KEY: 'entityKey',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  ANNOTATIONS: 'annotations',
  /** Matches server entityConstants FIELD_NAMES.DIFFERENTIAL_ROLE (event shape / API). */
  DIFFERENTIAL_ROLE: 'differentialRole',
  PLACEMENT_KIND: 'placementKind',
  ANCHOR_EDGE: 'anchorEdge',
} as const

export const TEMPORARY_ID_PATTERNS = {
  NEW_PREFIX: 'new-',
} as const

export const DEFAULT_VALUES = {
  /** Default when API omits wizardVisible (main grid / non–add-on-only). */
  WIZARD_VISIBLE: true as const,
  /** Default when API omits orchestrator. */
  ORCHESTRATOR: false as const,
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
