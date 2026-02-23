/**
 * WHY: useSelectionCardState Composable

LEARNING: Extracts selection state man...
 */
import { computed, watch, ref, type ComputedRef } from 'vue'
import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'
import { createLocalStatePlugin } from '@/components/booking/plugins/localStatePlugin'
import {
  getFirstStatePlugin,
  getWatchSourceValue,
  isSelectionCardItemSelected,
  isSelectionCardItemSelectedByPlugin,
} from '@/utils/booking/selectionCardState'

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

/**
 * WHY: useSelectionCardState composable

WHY: Extracts state management logic f...
 */
export function useSelectionCardState(params: UseSelectionCardStateParams): UseSelectionCardStateReturn {
  const {
    item,
    modelValue,
    configWithDefaults,
    emit
  } = params

  /**
   * WHY: Determines which plugin to use for state management
   */
  const activeStatePlugin = computed<StatePlugin | null>(() => {
    const config = configWithDefaults.value
    
    const firstPlugin = getFirstStatePlugin(config.statePlugins)
    if (firstPlugin) return firstPlugin
    
    // Create local plugin for backward compatibility
    if (config.stateSource === 'local' || !config.stateSource) {
      const localModelValue = ref<string | null>(Array.isArray(modelValue.value) ? modelValue.value[0] ?? null : modelValue.value)
      watch(modelValue, (newVal) => {
        localModelValue.value = Array.isArray(newVal) ? newVal[0] ?? null : newVal
      })
      return createLocalStatePlugin(
        localModelValue,
        (value: string | null) => emit('update:modelValue', value)
      )
    }
    
    return null
  })

  /**
   * WHY: /**
LEARNING: Explicit selection state management
WHY: Replaces VRadioGr...
   */
  const isSelected = computed(() => {
    const plugin = activeStatePlugin.value
    if (plugin) {
      return isSelectionCardItemSelectedByPlugin({ plugin, item: item.value })
    }
    
    // Fallback to modelValue for backward compatibility
    return isSelectionCardItemSelected({
      itemId: item.value.id,
      modelValue: modelValue.value,
    })
  })

  /**
   */
  const pluginWatchSource = computed(() => {
    const plugin = activeStatePlugin.value
    return plugin?.watchSource?.()
  })

  /**
   * WHY: /**
LEARNING: Watch state plugin source for reactivity
PATTERN: Watch th...
   */
  watch(() => {
    const watchSourceRef = pluginWatchSource.value
    return getWatchSourceValue(watchSourceRef)
  }, () => {
    void isSelected.value
  }, { immediate: true })

  return {
    activeStatePlugin,
    isSelected,
    pluginWatchSource
  }
}


