/**
 * WHY: useSelectionCardStyles Composable

WHY: Moves class calculation logic to...
 */
import { computed } from 'vue'
import {
  buildSelectionCardClasses,
  buildSelectionContentContainerClasses,
  buildSelectionControlClasses,
} from '@/utils/booking/selectionCardStyles'
import type { UseSelectionCardStylesParams, UseSelectionCardStylesReturn } from '@/types/booking/selectionCard/selectionCardStyles'

export type { UseSelectionCardStylesParams, UseSelectionCardStylesParamsBase, UseSelectionCardStylesReturn } from '@/types/booking/selectionCard/selectionCardStyles'

export function useSelectionCardStyles(params: UseSelectionCardStylesParams): UseSelectionCardStylesReturn {
  const {
    configWithDefaults,
    isSelected
  } = params

  const cardClasses = computed(() => {
    return buildSelectionCardClasses(configWithDefaults.value, isSelected.value)
  })

  const controlClasses = computed(() => {
    return buildSelectionControlClasses(configWithDefaults.value.controlPosition)
  })

  const contentContainerClasses = computed(() => {
    return buildSelectionContentContainerClasses(configWithDefaults.value)
  })

  return {
    cardClasses,
    controlClasses,
    contentContainerClasses
  }
}


