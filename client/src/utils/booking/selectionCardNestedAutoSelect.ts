import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

/**
 * WHY: Pure function so the auto-select logic is testable outside of Vue reactivity.
 * Returns a map of itemId → componentId[] for newly-selected composite services
 * whose nested selections have not yet been populated.
 */
export function computeAutoSelectedNestedIds(params: {
  selectedIds: string[]
  items: SelectionCardItem[]
  currentNestedSelections: Record<string, string[]>
}): Record<string, string[]> | null {
  const { selectedIds, items, currentNestedSelections } = params

  let additions: Record<string, string[]> | null = null

  for (const id of selectedIds) {
    if (currentNestedSelections[id] !== undefined) continue

    const item = items.find(i => i.id === id)
    if (!item?.composite || !item.instanceComponents) continue

    const activeComponentIds = item.instanceComponents
      .filter(c => c.active)
      .map(c => c.id)

    if (activeComponentIds.length > 0) {
      additions ??= {}
      additions[id] = activeComponentIds
    }
  }

  return additions
}

/**
 * WHY: When a service is deselected, remove its nested entry so re-selecting
 * the same service triggers a fresh "select all" on next selection.
 * Returns the set of IDs to clean, or null if nothing to do.
 */
export function computeDeselectedNestedIds(params: {
  selectedIds: string[]
  currentNestedSelections: Record<string, string[]>
}): string[] | null {
  const { selectedIds, currentNestedSelections } = params
  const selectedSet = new Set(selectedIds)
  let removals: string[] | null = null

  for (const key of Object.keys(currentNestedSelections)) {
    if (!selectedSet.has(key)) {
      removals ??= []
      removals.push(key)
    }
  }

  return removals
}
