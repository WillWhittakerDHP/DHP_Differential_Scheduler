/**
 * Bright MLS / RESO Property Response Types
 *
 * Type similarity UNIFY: PropertyEnrichmentResponse from shared (Phase 1.3).
 */

import type { PropertyEnrichmentResponse } from '../../../shared/types/propertyEnrichmentTypes.js'

export type { PropertyEnrichmentResponse }

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
