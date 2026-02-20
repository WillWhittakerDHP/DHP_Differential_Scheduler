/**
 * Transformer Collections
 *
 * LEARNING: Generic entity lookup, grouping, and immutable sort for transformers.
 * WHY: DRY - replaces duplicated Map accumulation, Set building, and sort patterns.
 * PATTERN: Pure functions; reuses existing @/utils/collections where applicable.
 */

import { findById as findByIdBase } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'

/** Entity shape used by findById/findByIds. Accepts { id: string } for compatibility with BookingBlockInstance and API responses. */
type WithId = { id: string }

/**
 * Find a single entity by ID. Returns null for null/undefined id or when not found.
 */
export function findById<EntityType extends WithId>(
  items: readonly EntityType[],
  id: string | null | undefined
): EntityType | null {
  if (id === null || id === undefined) return null
  const found = findByIdBase(items, id)
  return found ?? null
}

/**
 * Find multiple entities by IDs, preserving order of the requested ids.
 * Missing IDs are skipped; returns only resolved entities.
 */
export function findByIds<EntityType extends WithId>(
  items: readonly EntityType[],
  ids: string[] | null | undefined
): EntityType[] {
  if (!ids || ids.length === 0) return []
  const { resolved } = resolveByIds(items, ids)
  return resolved
}

/**
 * Group relationships by parent ID into a Map<parentId, childId[]>. Generic so it works
 * with both snake_case (parent_id, child_id) and camelCase (parentId, childId) sources.
 */
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

/**
 * Immutable sort: returns a new array. Use instead of mutating [...arr].sort() at call sites.
 */
export function immutableSort<ItemType>(
  items: readonly ItemType[],
  compareFn: (a: ItemType, b: ItemType) => number
): ItemType[] {
  return [...items].sort(compareFn)
}

/**
 * Collect unique IDs from multiple sources (arrays or Sets) into a single Set.
 * Replaces for...of loops that build a Set from multiple id arrays.
 */
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
