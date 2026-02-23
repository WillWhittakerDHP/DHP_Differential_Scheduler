/**
 * WHY: useSelectionCardGroupConfig Composable

WHY: Moves group wrapper and com...
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
 * WHY: useSelectionCardGroupConfig composable

WHY: Extracts group config logic...
 */
export function useSelectionCardGroupConfig(params: UseSelectionCardGroupConfigParams): UseSelectionCardGroupConfigReturn {
  const { configWithDefaults } = useSelectionCardConfig(params)

  const useGroupWrapper = computed(() => {
    return shouldUseSelectionGroupWrapper(configWithDefaults.value)
  })

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

