
import { DEFAULT_PROPERTY_SOURCE } from '../../../../../shared/constants/propertyConstants.js'

export const BLOCK_SHAPE_NAMES = {
  PROPERTIES: 'Properties',
} as const

export const ERROR_MESSAGES = {
  FETCH_PROPERTIES: 'Failed to fetch properties',
  FETCH_PROPERTY: 'Error fetching property',
  PROPERTY_NOT_FOUND: 'Property not found',
  CREATE_PROPERTY: 'Failed to create property',
  UPDATE_PROPERTY: 'Failed to update property',
  PATCH_PROPERTY: 'Failed to patch property',
  DELETE_PROPERTY: 'Failed to delete property',
  
  FETCH_PROPERTY_TYPES: 'Failed to fetch property types',
  PROPERTY_VERSION_NOT_FOUND: 'Property version not found',
  ADD_PROPERTY_TYPE: 'Failed to add property type',
  UPDATE_PROPERTY_TYPE: 'Failed to update property type',
  REMOVE_PROPERTY_TYPE: 'Failed to remove property type',
  REPLACE_PROPERTY_TYPES: 'Failed to replace property types',
  PROPERTY_TYPE_NOT_FOUND: 'Property type not found',
  PROPERTY_TYPE_ALREADY_ASSIGNED: 'Property type already assigned to this property version',
  
  INVALID_PATCH_BODY: 'Invalid PATCH body: only allowed property detail fields may be updated',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  MISSING_BLOCK_INSTANCE_ID: 'Missing required field: blockInstanceId',
  BLOCK_INSTANCE_NOT_FOUND: 'Block instance not found',
  INVALID_BLOCK_SHAPE: 'Block instance must have "Properties" block_shape',
  INVALID_BLOCK_SHAPES_BULK: 'All block instances must have "Properties" block_shape',
  BLOCK_INSTANCES_NOT_FOUND: 'Some block instances not found',
} as const

export const REQUIRED_FIELDS = {
  ADDRESS: ['address', 'city', 'state', 'zipCode'] as const,
  PROPERTY_TYPE: ['blockInstanceId'] as const,
} as const

export const PATCH_PROPERTY_DETAILS_FIELDS = [
  'mlsNumber',
  'squareFootage',
  'bedrooms',
  'bathrooms',
  'foundationAccess',
  'additionalUnits',
  'source',
] as const

export const PATCH_PROPERTY_FIELD_KEY = {
  MLS_NUMBER: 'mlsNumber',
  SQUARE_FOOTAGE: 'squareFootage',
  BEDROOMS: 'bedrooms',
  BATHROOMS: 'bathrooms',
  FOUNDATION_ACCESS: 'foundationAccess',
  ADDITIONAL_UNITS: 'additionalUnits',
  SOURCE: 'source',
} as const

export const FOUNDATION_ACCESS_VALUES = ['basement', 'crawlspace', 'slab'] as const

export const PROPERTY_SOURCE_VALUES = ['api', 'manual', DEFAULT_PROPERTY_SOURCE] as const

export const DEFAULT_VALUES = {
  SOURCE: DEFAULT_PROPERTY_SOURCE,
  ORDER_INDEX: 0 as const,
} as const

export { UNKNOWN_ERROR_MESSAGE } from '../../../constants/router.js'
