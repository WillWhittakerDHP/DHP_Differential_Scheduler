/**
 * WHY: Keys treated as composer-computed in entity CRUD (pure set lookup).
 */

const ENTITY_COMPUTED_PROPERTY_KEYS = [
  'baseFee',
  'baseTime',
  'rateOverBaseFee',
  'rateOverBaseTime',
  'partAssignments',
] as const

export function isComputedEntityPropertyKey(propertyKey: string): boolean {
  return ENTITY_COMPUTED_PROPERTY_KEYS.includes(propertyKey as (typeof ENTITY_COMPUTED_PROPERTY_KEYS)[number])
}
