/**
 * Find an item by string id (normalizes both sides to string for safety).
 *
 * LEARNING: Pure helper (no Vue reactivity) for consistent id matching.
 * WHY: Our caches store ids as strings; callers sometimes pass numeric-like values.
 * NOTE: Constraint is { id: string } so both IdentifiableById and BookingBlockInstance work.
 */
export function findById<CollectionItem extends { id: string }>(
  items: readonly CollectionItem[],
  id: string
): CollectionItem | undefined {
  const normalizedId = String(id)
  return items.find((item) => String(item.id) === normalizedId)
}


