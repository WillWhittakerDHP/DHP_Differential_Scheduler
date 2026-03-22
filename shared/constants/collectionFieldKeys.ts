/**
 * Relationship fieldKeys that render as RelationshipCollection (add/remove from a pool).
 *
 * WHY: `computeRenderAs` uses this set so collection fields stay aligned across UI routing
 * and persisted metadata. Rendering does not trust stored `renderAs` alone.
 *
 * Shape-level `valid*` fields (validParts, validCascades, validAnnotations, validEvents,
 * validPricingCascades) use **multiselect** + relationship `inputConfig`, not this set.
 */
export const RELATIONSHIP_COLLECTION_FIELD_KEYS: ReadonlySet<string> = new Set([
  'partAssignments',
  'annotationAssignments',
])
