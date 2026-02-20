/**
 * useSelectionCardGroupConfig Composable
 * 
 * LEARNING: Extracts group config logic from SelectionCardGroup component
 * WHY: Moves group wrapper and component name logic to composable
 * PATTERN: Composable that provides group configuration
 */

import { computed, type ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { useSelectionCardConfig, type UseSelectionCardConfigParams } from './useSelectionCardConfig'
import {
  buildSelectionCardGridColumnProps,
  getSelectionGroupComponentName,
  shouldUseSelectionGroupWrapper,
} from '@/utils/booking/selectionCardGroupConfig'

/** Same shape as UseSelectionCardConfigParams; use for group context. */
export type UseSelectionCardGroupConfigParams = UseSelectionCardConfigParams

export interface UseSelectionCardGroupConfigReturn {
  configWithDefaults: ComputedRef<SelectionCardConfig>
  useGroupWrapper: ComputedRef<boolean>
  groupComponentName: ComputedRef<string>
  gridColumnProps: ComputedRef<Record<string, string | number>>
}

/**
 * useSelectionCardGroupConfig composable
 * 
 * LEARNING: Provides group configuration
 * WHY: Extracts group config logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useSelectionCardGroupConfig(params: UseSelectionCardGroupConfigParams): UseSelectionCardGroupConfigReturn {
  const { configWithDefaults } = useSelectionCardConfig(params)

  /**
   * LEARNING: Whether to use group wrapper
   * WHY: Determines if VRadioGroup/VCheckboxGroup wrapper is needed
   * PATTERN: Check config.selectionGroup
   */
  const useGroupWrapper = computed(() => {
    return shouldUseSelectionGroupWrapper(configWithDefaults.value)
  })

  /**
   * LEARNING: Group component name
   * WHY: Determines which group component to use
   * PATTERN: Based on config.selectionGroup
   */
  const groupComponentName = computed(() => {
    return getSelectionGroupComponentName(configWithDefaults.value)
  })

  const gridColumnProps = computed(() => {
    return buildSelectionCardGridColumnProps(configWithDefaults.value)
  })

  return {
    configWithDefaults,
    useGroupWrapper,
    groupComponentName,
    gridColumnProps
  }
}

