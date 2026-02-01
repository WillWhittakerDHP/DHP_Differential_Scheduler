/**
 * Property Transformer Utilities
 * 
 * LEARNING: Config-driven field mappings for property transformation
 * WHY: Eliminates hardcoded field names in property transformation logic
 * PATTERN: Const object with field mappings, utility function for transformation
 */

/**
 * Property field mappings
 * LEARNING: Maps database field names to API response field names
 * WHY: Single source of truth for field mappings, enables easier maintenance
 * PATTERN: Const object with field name mappings
 */
export const PROPERTY_FIELD_MAPPINGS = {
  ADDRESS: 'address',
  UNIT: 'unit',
  CITY: 'city',
  STATE: 'state',
  ZIP_CODE: 'zipCode',
  PLACE_ID: 'placeId',
  LATITUDE: 'latitude',
  LONGITUDE: 'longitude',
  MLS_NUMBER: 'mlsNumber',
  SQUARE_FOOTAGE: 'squareFootage',
  BEDROOMS: 'bedrooms',
  BATHROOMS: 'bathrooms',
  FOUNDATION_ACCESS: 'foundationAccess',
  ADDITIONAL_UNITS: 'additionalUnits',
  SOURCE: 'source',
  PROPERTY_VERSION_ID: 'propertyVersionId',
  ADDRESS_ID: 'addressId',
} as const

/**
 * Transform PropertyVersion with relationships to flat property object
 * LEARNING: Combines Address, PropertyVersion, and PropertyDetails into single response
 * WHY: Maintains backward compatibility with existing API consumers
 * PATTERN: Pure function that transforms nested structure to flat object
 */
export function transformPropertyVersion(propertyVersion: any) {
  const address = propertyVersion.address
  const propertyDetails = propertyVersion.propertyDetails?.[0] || propertyVersion.propertyDetails // Handle array or single object

  return {
    id: propertyVersion.id,
    [PROPERTY_FIELD_MAPPINGS.PROPERTY_VERSION_ID]: propertyVersion.id,
    [PROPERTY_FIELD_MAPPINGS.ADDRESS_ID]: propertyVersion.addressId,
    [PROPERTY_FIELD_MAPPINGS.ADDRESS]: address?.[PROPERTY_FIELD_MAPPINGS.ADDRESS],
    [PROPERTY_FIELD_MAPPINGS.UNIT]: address?.[PROPERTY_FIELD_MAPPINGS.UNIT],
    [PROPERTY_FIELD_MAPPINGS.CITY]: address?.[PROPERTY_FIELD_MAPPINGS.CITY],
    [PROPERTY_FIELD_MAPPINGS.STATE]: address?.[PROPERTY_FIELD_MAPPINGS.STATE],
    [PROPERTY_FIELD_MAPPINGS.ZIP_CODE]: address?.[PROPERTY_FIELD_MAPPINGS.ZIP_CODE],
    [PROPERTY_FIELD_MAPPINGS.PLACE_ID]: address?.[PROPERTY_FIELD_MAPPINGS.PLACE_ID] || null,
    [PROPERTY_FIELD_MAPPINGS.LATITUDE]: address?.[PROPERTY_FIELD_MAPPINGS.LATITUDE] || null,
    [PROPERTY_FIELD_MAPPINGS.LONGITUDE]: address?.[PROPERTY_FIELD_MAPPINGS.LONGITUDE] || null,
    [PROPERTY_FIELD_MAPPINGS.MLS_NUMBER]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.MLS_NUMBER],
    [PROPERTY_FIELD_MAPPINGS.SQUARE_FOOTAGE]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.SQUARE_FOOTAGE],
    [PROPERTY_FIELD_MAPPINGS.BEDROOMS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.BEDROOMS],
    [PROPERTY_FIELD_MAPPINGS.BATHROOMS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.BATHROOMS],
    [PROPERTY_FIELD_MAPPINGS.FOUNDATION_ACCESS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.FOUNDATION_ACCESS],
    [PROPERTY_FIELD_MAPPINGS.ADDITIONAL_UNITS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.ADDITIONAL_UNITS],
    [PROPERTY_FIELD_MAPPINGS.SOURCE]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.SOURCE],
    createdAt: propertyVersion.createdAt,
    updatedAt: propertyVersion.updatedAt,
  }
}
