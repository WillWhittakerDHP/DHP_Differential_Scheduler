import type { IdentifiableById } from './appendIfMissingById'
import { findById } from './findById'

export interface ResolveByIdsResult<CollectionItem extends IdentifiableById> {
  resolved: CollectionItem[]
  missingIds: string[]
}

export function resolveByIds<CollectionItem extends IdentifiableById>(
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


