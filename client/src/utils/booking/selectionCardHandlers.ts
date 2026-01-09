import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

export function toggleSelectionModelValue(params: {
  itemId: SelectionCardItem['id']
  modelValue: string | null | string[]
  isSelected: boolean
}): string | null | string[] {
  const current = params.modelValue

  if (Array.isArray(current)) {
    return params.isSelected ? current.filter((id) => id !== params.itemId) : [...current, params.itemId]
  }

  return params.isSelected ? null : params.itemId
}

export function updateNestedChildSelections(params: {
  current: readonly string[]
  childId: string
  selected: boolean
}): string[] {
  return params.selected
    ? params.current.includes(params.childId)
      ? [...params.current]
      : [...params.current, params.childId]
    : params.current.filter((id) => id !== params.childId)
}

export function isNestedComponentsClick(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  return !!element?.closest?.('.nested-components')
}


