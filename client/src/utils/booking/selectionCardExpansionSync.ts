import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

export function computeNextExpandedCardIds(params: {
  expandedCardIds: string[]
  previousSelectedIds: string[]
  selectedIds: string[]
  items: SelectionCardItem[]
  shouldExpand: (item: SelectionCardItem) => boolean
}): { nextExpanded: string[]; autoExpandIds: string[] } | null {
  const { expandedCardIds, previousSelectedIds, selectedIds, items, shouldExpand } = params

  if (selectedIds.length === 0 && previousSelectedIds.length > 0) {
    return null
  }

  const idsToAdd: string[] = []
  selectedIds.forEach((id) => {
    const item = items.find((entry) => entry.id === id)
    if (item && shouldExpand(item) && !expandedCardIds.includes(id)) {
      idsToAdd.push(id)
    }
  })

  const idsToRemove = previousSelectedIds.filter((prevId) => !selectedIds.includes(prevId))

  if (idsToAdd.length === 0 && idsToRemove.length === 0) {
    return null
  }

  const nextExpanded = expandedCardIds
    .filter((id) => !idsToRemove.includes(id))
    .concat(idsToAdd.filter((id) => !expandedCardIds.includes(id)))

  return { nextExpanded, autoExpandIds: idsToAdd }
}
