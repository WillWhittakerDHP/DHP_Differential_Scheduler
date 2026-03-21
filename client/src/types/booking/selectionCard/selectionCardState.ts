import type { ComputedRef } from 'vue'
import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'

export interface UseSelectionCardStateParams {
  item: ComputedRef<SelectionCardItem>
  modelValue: ComputedRef<string | null | string[]>
  configWithDefaults: ComputedRef<{ stateSource?: string; statePlugins?: StatePlugin[] }>
  emit: (event: 'update:modelValue', value: string | null | string[]) => void
}

export interface UseSelectionCardStateReturn {
  activeStatePlugin: ComputedRef<StatePlugin | null>
  isSelected: ComputedRef<boolean>
  pluginWatchSource: ComputedRef<unknown>
}
