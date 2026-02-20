/**
 * Shared Property Enrichment Types
 *
 * LEARNING: Types shared between client and server for property enrichment (e.g. Bright MLS)
 * WHY: Single source of truth for API response shape, prevents type drift
 * PATTERN: Shared types directory for cross-cutting concerns (Phase 1.3 type-similarity remediation)
 */

import type { PropertyDetailsBase } from './propertyTypes'

/**
 * Property enrichment response from Bright MLS / RESO-style APIs
 * LEARNING: Transformed property data returned to client after server enrichment
 * WHY: Consistent shape for bedrooms, bathrooms, foundation, etc.; extends shared base
 * PATTERN: Nullable fields for optional MLS data
 */
export interface PropertyEnrichmentResponse extends PropertyDetailsBase {
  suggestedBlockInstanceIds: string[]
}
