
export { GLOBAL_CONFIG_IDS } from '../../../../../shared/constants/globalConfigIds.js'

export const VALID_ENTITY_TYPES = [
  'blockShape',
  'partShape',
  'blockInstance',
  'partInstance',
  'eventShape',
  'eventInstance',
  'annotationShape',
  'annotationInstance',
] as const

export const ERROR_MESSAGES = {
  FETCH_BATCH_METADATA: 'Failed to fetch batch metadata',
  FETCH_METADATA: 'Failed to fetch metadata',
  CREATE_UPDATE_METADATA: 'Failed to create/update metadata',
  DELETE_METADATA: 'Failed to delete metadata',
  
  INVALID_ENTITY_TYPE: 'Invalid entityType',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_RENDER_AS: 'Invalid renderAs',
  MISSING_INPUT_CONFIG: 'Missing inputConfig',
  METADATA_NOT_FOUND: 'Metadata not found',
} as const

export const METADATA_REQUIRED_FIELDS_CREATE_UPDATE = ['fieldKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'] as const

export const RELATIONSHIP_METADATA_REQUIRED_FIELDS_CREATE_UPDATE = ['relationshipKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'] as const

export function createRequiredFields<T extends readonly string[]>(createUpdate: T): { readonly CREATE_UPDATE: T } {
  return { CREATE_UPDATE: createUpdate }
}

/** Required fields for metadata creation/update */
export const REQUIRED_FIELDS = createRequiredFields(METADATA_REQUIRED_FIELDS_CREATE_UPDATE)

export const RENDER_AS_REQUIRING_INPUT_CONFIG = [
  'select',
  'multiselect',
  'reference',
  'relationshipCollection',
] as const
