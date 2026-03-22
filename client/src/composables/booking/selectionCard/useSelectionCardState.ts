/**
 * WHY: useSelectionCardState Composable

 */
import { computed, watch, ref } from 'vue'
import type { StatePlugin } from '@/components/booking/types/selectionCardTypes'
import { createLocalStatePlugin } from '@/components/booking/plugins/localStatePlugin'
import { APP_STAGE } from '@shared/constants/appStageConstants'
import {
  getFirstStatePlugin,
  getWatchSourceValue,
  isSelectionCardItemSelected,
  isSelectionCardItemSelectedByPlugin,
} from '@/utils/booking/selectionCardState'
import type { UseSelectionCardStateParams, UseSelectionCardStateReturn } from '@/types/booking/selectionCard/selectionCardState'

export type { UseSelectionCardStateParams, UseSelectionCardStateReturn } from '@/types/booking/selectionCard/selectionCardState'

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
    
    if (config.stateSource === APP_STAGE.LOCAL || !config.stateSource) {
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

  const isSelected = computed(() => {
    const plugin = activeStatePlugin.value
    if (plugin) {
      return isSelectionCardItemSelectedByPlugin({ plugin, item: item.value })
    }
    
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
