
export const VALID_ENTITY_TYPES = [
  'blockShape',
  'partShape',
  'blockInstance',
  'partInstance',
] as const

export const ERROR_MESSAGES = {
  FETCH_METADATA: 'Failed to fetch primitive metadata',
  CREATE_UPDATE_METADATA: 'Failed to create/update primitive metadata',
  DELETE_METADATA: 'Failed to delete primitive metadata',
  
  INVALID_ENTITY_TYPE: 'Invalid entityType',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_RENDER_AS: 'Invalid renderAs',
  MISSING_INPUT_CONFIG: 'Missing inputConfig',
  METADATA_NOT_FOUND: 'Primitive metadata not found',
} as const

/** Required fields for metadata creation/update (re-export from admin metadata). */
export { REQUIRED_FIELDS } from '../admin-metadata/adminMetadataConstants.js'

export const RENDER_AS_REQUIRING_INPUT_CONFIG = [
  'select',
  'multiselect',
  'reference',
  'relationshipCollection',
] as const
