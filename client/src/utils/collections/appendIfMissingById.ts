/**
 * Append an item to a collection only if its `id` is not already present.
 *
 * WHY: Multiple composables optimistically append created items to `globalData` cache.
 */
export function appendIfMissingById<CollectionItem extends { id: string }>(
  existing: readonly CollectionItem[],
  item: CollectionItem
): CollectionItem[] {
  const alreadyExists = existing.some((existingItem) => existingItem.id === item.id)
  return alreadyExists ? [...existing] : [...existing, item]
}
