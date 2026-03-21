
import {
  createRequiredFields,
  RELATIONSHIP_METADATA_REQUIRED_FIELDS_CREATE_UPDATE,
} from '../admin-metadata/adminMetadataConstants.js'

export const VALID_ENTITY_TYPES = [
  'blockShape',
  'partShape',
  'blockInstance',
  'partInstance',
] as const

export const ERROR_MESSAGES = {
  FETCH_METADATA: 'Failed to fetch relationship metadata',
  CREATE_UPDATE_METADATA: 'Failed to create/update relationship metadata',
  DELETE_METADATA: 'Failed to delete relationship metadata',
  
  INVALID_ENTITY_TYPE: 'Invalid entityType',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  MISSING_INPUT_CONFIG: 'Missing inputConfig',
  METADATA_NOT_FOUND: 'Relationship metadata not found',
} as const

/** Required fields for metadata creation/update (same shape as admin metadata, relationshipKey-based) */
export const REQUIRED_FIELDS = createRequiredFields(RELATIONSHIP_METADATA_REQUIRED_FIELDS_CREATE_UPDATE)

export const RENDER_AS_REQUIRING_INPUT_CONFIG = [
  'select',
  'multiselect',
  'reference',
  'relationshipCollection',
] as const
