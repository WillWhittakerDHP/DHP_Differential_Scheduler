/**
 * WHY: Transformer Collections
LEARNING: Generic entity lookup, grouping, and i...
 */
import { findById as findByIdBase } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'

/** Entity shape used by findById/findByIds. Accepts { id: string } for compatibility with BookingBlockInstance and API responses. */
type WithId = { id: string }

export function findById<EntityType extends WithId>(
  items: readonly EntityType[],
  id: string | null | undefined
): EntityType | null {
  if (id === null || id === undefined) return null
  const found = findByIdBase(items, id)
  return found ?? null
}

export function findByIds<EntityType extends WithId>(
  items: readonly EntityType[],
  ids: string[] | null | undefined
): EntityType[] {
  if (!ids || ids.length === 0) return []
  const { resolved } = resolveByIds(items, ids)
  return resolved
}

export function groupByParentId<Item>(
  items: readonly Item[],
  getParentId: (item: Item) => string,
  getChildId: (item: Item) => string
): Map<string, string[]> {
  return items.reduce((map, item) => {
    const parentId = getParentId(item)
    const childId = getChildId(item)
    const raw = map.get(parentId)
    const existing = raw !== undefined ? raw : []
    map.set(parentId, [...existing, childId])
    return map
  }, new Map<string, string[]>())
}

export function immutableSort<ItemType>(
  items: readonly ItemType[],
  compareFn: (a: ItemType, b: ItemType) => number
): ItemType[] {
  return [...items].sort(compareFn)
}

export function collectIds(...sources: (readonly string[] | Set<string>)[]): Set<string> {
  const result = new Set<string>()
  for (const src of sources) {
    if (src instanceof Set) {
      src.forEach((id) => result.add(String(id)))
    } else if (Array.isArray(src)) {
      src.forEach((id) => result.add(String(id)))
    }
  }
  return result
}
