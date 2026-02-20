/**
 * Entity Field Patch Utility
 *
 * LEARNING: Strongly-typed helper for dynamic `{ [key]: value }` patch objects.
 * WHY: Many CRUD mutation APIs accept "partial entity" updates, but TypeScript can't always infer
 *      the correct object type from computed property keys without unsafe casts.
 * PATTERN: Create a typed single-field patch object for an entity type.
 */

export function createEntityFieldPatch<
  GlobalEntityType extends Record<string, unknown>,
  GlobalPropertyKey extends keyof GlobalEntityType
>(fieldKey: GlobalPropertyKey, value: GlobalEntityType[GlobalPropertyKey]): Partial<GlobalEntityType> {
  const patch: Partial<GlobalEntityType> = {}
  patch[fieldKey] = value
  return patch
}


