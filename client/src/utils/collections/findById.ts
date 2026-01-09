import type { IdentifiableById } from './appendIfMissingById'

/**
 * Find an item by string id (normalizes both sides to string for safety).
 *
 * LEARNING: Pure helper (no Vue reactivity) for consistent id matching.
 * WHY: Our caches store ids as strings; callers sometimes pass numeric-like values.
 */
export function findById<CollectionItem extends IdentifiableById>(
  items: readonly CollectionItem[],
  id: string
): CollectionItem | undefined {
  const normalizedId = String(id)
  return items.find((item) => String(item.id) === normalizedId)
}


