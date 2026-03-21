/**
 * Pure resolvers for select config (option label key, etc.).
 * WHY: Extracted from useSelectConfig to reduce branching and keep composable thin.
 */

/**
 * Resolve the entity field key used as option label in selects.
 * All current entity types use 'name' as display field (annotation instances use name for text content).
 */
export function resolveOptionLabelKey(): string {
  return 'name'
}
