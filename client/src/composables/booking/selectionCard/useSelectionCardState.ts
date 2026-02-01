/**
 * useSelectionCardState Composable
 * 
 * LEARNING: Extracts selection state management logic from SelectionCard component
 * WHY: Moves state plugin selection and selection state calculation to composable
 * PATTERN: Composable that provides selection state management
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
 * useSelectionCardState composable
 * 
 * LEARNING: Provides selection state management
 * WHY: Extracts state management logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useSelectionCardState(params: UseSelectionCardStateParams): UseSelectionCardStateReturn {
  const {
    item,
    modelValue,
    configWithDefaults,
    emit
  } = params

  /**
   * LEARNING: Get active state plugin
   * WHY: Determines which plugin to use for state management
   * PATTERN: Use first plugin if available, otherwise create local plugin
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
   * LEARNING: Explicit selection state management
   * WHY: Replaces VRadioGroup's internal state management for better reactivity
   * PATTERN: Computed property that uses state plugin to determine selection state
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
   * LEARNING: Get watchSource ref from plugin
   * WHY: Stores the watchSource ref once to avoid recreating it on each watch evaluation
   * PATTERN: Computed property that gets the watchSource ref from the plugin
   */
  const pluginWatchSource = computed(() => {
    const plugin = activeStatePlugin.value
    return plugin?.watchSource?.()
  })

  /**
   * LEARNING: Watch state plugin source for reactivity
   * WHY: Ensures SelectionCard reacts to external state changes
   * PATTERN: Watch the computed ref's value directly - Vue will track the computed ref dependency
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


