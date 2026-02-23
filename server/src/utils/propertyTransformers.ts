
import { normalizeToSingle } from './arrayNormalize.js'

const PROPERTY_FIELD_MAPPINGS = {
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

export function transformPropertyVersion(propertyVersion: unknown): Record<string, unknown> {
  const pv = propertyVersion as Record<string, unknown> & {
    id?: string
    addressId?: string
    address?: Record<string, unknown>
    propertyDetails?: Record<string, unknown> | Record<string, unknown>[]
    createdAt?: unknown
    updatedAt?: unknown
  }
  const address = pv.address
  const rawDetails = pv.propertyDetails
  const propertyDetails =
    rawDetails != null
      ? (normalizeToSingle(rawDetails) as Record<string, unknown>)
      : undefined

  return {
    id: pv.id,
    [PROPERTY_FIELD_MAPPINGS.PROPERTY_VERSION_ID]: pv.id,
    [PROPERTY_FIELD_MAPPINGS.ADDRESS_ID]: pv.addressId,
    [PROPERTY_FIELD_MAPPINGS.ADDRESS]: address?.[PROPERTY_FIELD_MAPPINGS.ADDRESS],
    [PROPERTY_FIELD_MAPPINGS.UNIT]: address?.[PROPERTY_FIELD_MAPPINGS.UNIT],
    [PROPERTY_FIELD_MAPPINGS.CITY]: address?.[PROPERTY_FIELD_MAPPINGS.CITY],
    [PROPERTY_FIELD_MAPPINGS.STATE]: address?.[PROPERTY_FIELD_MAPPINGS.STATE],
    [PROPERTY_FIELD_MAPPINGS.ZIP_CODE]: address?.[PROPERTY_FIELD_MAPPINGS.ZIP_CODE],
    [PROPERTY_FIELD_MAPPINGS.PLACE_ID]: address?.[PROPERTY_FIELD_MAPPINGS.PLACE_ID],
    [PROPERTY_FIELD_MAPPINGS.LATITUDE]: address?.[PROPERTY_FIELD_MAPPINGS.LATITUDE],
    [PROPERTY_FIELD_MAPPINGS.LONGITUDE]: address?.[PROPERTY_FIELD_MAPPINGS.LONGITUDE],
    [PROPERTY_FIELD_MAPPINGS.MLS_NUMBER]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.MLS_NUMBER],
    [PROPERTY_FIELD_MAPPINGS.SQUARE_FOOTAGE]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.SQUARE_FOOTAGE],
    [PROPERTY_FIELD_MAPPINGS.BEDROOMS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.BEDROOMS],
    [PROPERTY_FIELD_MAPPINGS.BATHROOMS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.BATHROOMS],
    [PROPERTY_FIELD_MAPPINGS.FOUNDATION_ACCESS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.FOUNDATION_ACCESS],
    [PROPERTY_FIELD_MAPPINGS.ADDITIONAL_UNITS]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.ADDITIONAL_UNITS],
    [PROPERTY_FIELD_MAPPINGS.SOURCE]: propertyDetails?.[PROPERTY_FIELD_MAPPINGS.SOURCE],
    createdAt: pv.createdAt,
    updatedAt: pv.updatedAt,
  }
}
