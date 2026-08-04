/**
 * Shared Property Address Types
 *
 * WHY: Single source of truth for property payloads; prevents type drift (TYPE_SIMILARITY_PROPOSAL § 1.4)
 * PATTERN: Shared types directory for cross-cutting concerns
 */

/**
 * Minimal property address shape (address, city, state, zipCode, optional unit).
 * WHY: PropertyRequest, PropertyResponse, PropertyDetailsData, ParsedProperty extend or intersect this.
 */
export interface PropertyAddressBase {
  address: string
  city: string
  state: string
  zipCode: string
  unit?: string | null
}

/**
 * Optional property detail fields (MLS-style).
 * WHY: PropertyEnrichmentResponse, ParsedProperty, PartialPropertyDetails share this slice.
 */
export interface PropertyDetailsBase {
  mlsNumber?: string | null
  squareFootage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits?: number | null
  hvacCount?: number | null
  waterHeaterCount?: number | null
  kitchenApplianceCount?: number | null
}
