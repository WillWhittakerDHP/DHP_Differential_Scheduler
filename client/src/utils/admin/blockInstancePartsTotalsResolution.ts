import type { GlobalEntity } from '@/types/entities'
import { resolveByIds } from '@/utils/collections/resolveByIds'

export function blockShapeAllowsParts(blockShapeEntity: GlobalEntity<'blockShape'> | null | undefined): boolean {
  return blockShapeEntity?.canHaveParts === true
}

export interface RelationshipLike {
  parentId: unknown
  childId: unknown
  disabled?: boolean
}

export interface ActiveChildIdsResult {
  childIds: string[]
  hadDuplicates: boolean
  beforeDedup: string[]
}

export function activeChildIdsForBlockParent(
  relationships: RelationshipLike[] | null | undefined,
  entityId: string
): ActiveChildIdsResult {
  if (!relationships) {
    return { childIds: [], hadDuplicates: false, beforeDedup: [] }
  }
  const filtered = relationships.filter(
    (rel) => String(rel.parentId) === entityId && !rel.disabled
  )
  const beforeDedup = filtered.map((rel) => String(rel.childId))
  const childIds = [...new Set(beforeDedup)]
  return {
    childIds,
    hadDuplicates: beforeDedup.length !== childIds.length,
    beforeDedup,
  }
}

export function resolvePartInstancesByChildIds(
  partInstances: GlobalEntity<'partInstance'>[],
  childIds: string[]
): { resolved: GlobalEntity<'partInstance'>[]; missingIds: string[] } {
  return resolveByIds(partInstances, childIds)
}
