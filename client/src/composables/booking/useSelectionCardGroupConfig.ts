/**
 * WHY: useSelectionCardGroupConfig Composable

WHY: Moves group wrapper and com...
 */
import { computed } from 'vue'
import { useSelectionCardConfig } from './useSelectionCardConfig'
import {
  buildSelectionCardGridColumnProps,
  getSelectionGroupComponentName,
  shouldUseSelectionGroupWrapper,
} from '@/utils/booking/selectionCardGroupConfig'
import type {
  UseSelectionCardGroupConfigParams,
  UseSelectionCardGroupConfigReturn,
} from '@/types/booking/selectionCardGroupConfig'

export type {
  UseSelectionCardGroupConfigParams,
  UseSelectionCardGroupConfigReturn,
} from '@/types/booking/selectionCardGroupConfig'

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

