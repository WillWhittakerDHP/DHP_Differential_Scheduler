import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'

export function getFirstStatePlugin(statePlugins: StatePlugin[] | undefined): StatePlugin | null {
  if (!statePlugins || statePlugins.length === 0) return null
  return statePlugins[0] ?? null
}

export function isSelectionCardItemSelected(params: {
  itemId: SelectionCardItem['id']
  modelValue: string | null | string[]
}): boolean {
  const { itemId, modelValue } = params

  if (Array.isArray(modelValue)) {
    return modelValue.includes(itemId)
  }

  return modelValue === itemId
}

export function isSelectionCardItemSelectedByPlugin(params: {
  plugin: StatePlugin
  item: SelectionCardItem
}): boolean {
  return params.plugin.getValue(params.item) === true
}

export function getWatchSourceValue(watchSourceRef: unknown): unknown {
  if (watchSourceRef && typeof watchSourceRef === 'object' && 'value' in watchSourceRef) {
    return (watchSourceRef as { value: unknown }).value
  }
  return undefined
}


