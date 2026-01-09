export type EntityWithStringId = { id: string }

/**
 * Minimal optimistic helpers for list caches keyed by entity `id`.
 *
 * PATTERN: For list-style Vue Query caches (e.g. `['users']`, `['properties']`, `['appointments']`):
 * - Use `onMutate` to snapshot + apply an optimistic change
 * - Use `onError` to rollback to the snapshot
 * - Use `onSuccess` to reconcile with the server response (source of truth)
 *
 * LEARNING: Keep these helpers tiny and reusable; the domain-specific composables decide *what* to patch.
 */
export function optimisticUpsertById<TItem extends EntityWithStringId>(
  items: TItem[] | undefined,
  next: TItem
): TItem[] {
  const current = items ?? []
  const index = current.findIndex((item) => String(item.id) === String(next.id))
  if (index === -1) return [...current, next]
  const updated = [...current]
  updated[index] = next
  return updated
}

export function optimisticRemoveById<TItem extends EntityWithStringId>(
  items: TItem[] | undefined,
  id: string
): TItem[] {
  const current = items ?? []
  return current.filter((item) => String(item.id) !== String(id))
}


