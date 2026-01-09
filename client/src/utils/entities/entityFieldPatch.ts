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
  // TS can't infer computed key object literal shape here without help; this cast is safe and localized.
  return { [fieldKey]: value } as unknown as Partial<GlobalEntityType>
}


