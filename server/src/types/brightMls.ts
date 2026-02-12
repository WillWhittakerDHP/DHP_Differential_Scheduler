/**
 * Bright MLS / RESO Property Response Types
 *
 * LEARNING: RESO Data Dictionary uses PascalCase field names
 * WHY: OData responses from Bright MLS align with RESO Property resource
 * RESOURCE: https://ddwiki.reso.org/display/DDW17/Property+Resource
 */

/**
 * RESO Property resource response (partial; only fields we consume)
 */
export interface BrightMlsPropertyResponse {
  ListingKey?: string | null;
  ListingId?: string | null;
  LivingArea?: number | null;
  AboveGradeFinishedArea?: number | null;
  BelowGradeFinishedArea?: number | null;
  BedroomsTotal?: number | null;
  BathroomsFull?: number | null;
  BathroomsHalf?: number | null;
  FoundationDetails?: string[] | string | null;
  PoolFeatures?: string[] | string | null;
  PatioAndPorchFeatures?: string[] | string | null;
  OtherStructures?: string[] | string | null;
  GarageSpaces?: number | null;
  StreetNumber?: string | null;
  StreetName?: string | null;
  City?: string | null;
  StateOrProvince?: string | null;
  PostalCode?: string | null;
  PropertySubType?: string | null;
  UnitTypes?: string[] | string | null;
  FireplaceFeatures?: string[] | string | null;
}

/**
 * OData response wrapper (value array)
 */
export interface BrightMlsODataResponse {
  value?: BrightMlsPropertyResponse[];
}

/**
 * Transformed property enrichment response for client
 */
export interface PropertyEnrichmentResponse {
  mlsNumber: string | null;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits: number | null;
  suggestedBlockInstanceIds: string[];
}
