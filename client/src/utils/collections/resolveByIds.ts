import { findById } from './findById'

/** Constraint is { id: string } so both IdentifiableById and BookingBlockInstance work. */
export interface ResolveByIdsResult<CollectionItem extends { id: string }> {
  resolved: CollectionItem[]
  missingIds: string[]
}

export function resolveByIds<CollectionItem extends { id: string }>(
  items: readonly CollectionItem[],
  ids: readonly string[],
): ResolveByIdsResult<CollectionItem> {
  return ids.reduce<ResolveByIdsResult<CollectionItem>>(
    (acc, id) => {
      const resolved = findById(items, id)
      return resolved
        ? { resolved: [...acc.resolved, resolved], missingIds: acc.missingIds }
        : { resolved: acc.resolved, missingIds: [...acc.missingIds, id] }
    },
    { resolved: [], missingIds: [] },
  )
}


