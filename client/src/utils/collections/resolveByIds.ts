import { findById } from './findById'
import type { ResolveByIdsResult } from '@/types/collections/resolveByIds'

export type { ResolveByIdsResult } from '@/types/collections/resolveByIds'

export function resolveByIds<CollectionItem extends { id: string }>(
  items: readonly CollectionItem[],
  ids: readonly string[],
): ResolveByIdsResult<CollectionItem> {
  return ids.reduce<ResolveByIdsResult<CollectionItem>>(
    (acc, id) => {
      const resolved = findById(items, id)
      return resolved
        ? { resolved: [...acc.resolved, resolved], missingIds: acc.missingIds }
        : // @audit-allow:hardcoding:fieldMapping - Reducer accumulator shape
          { resolved: acc.resolved, missingIds: [...acc.missingIds, id] }
    },
    { resolved: [], missingIds: [] },
  )
}


