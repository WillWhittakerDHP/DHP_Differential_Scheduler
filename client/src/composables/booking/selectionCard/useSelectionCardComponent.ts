/**
 * WHY: useSelectionCardComponent Composable

WHY: Moves dynamic component rende...
 */
import { computed } from 'vue'
import { buildSelectionComponentProps, getSelectionComponentName } from '@/utils/booking/selectionCardComponent'
import type { UseSelectionCardComponentParams, UseSelectionCardComponentReturn } from '@/types/booking/selectionCard/selectionCardComponent'

export type { UseSelectionCardComponentParams, UseSelectionCardComponentReturn } from '@/types/booking/selectionCard/selectionCardComponent'

/**
 * WHY: useSelectionCardComponent composable

WHY: Extracts component rendering ...
 */
export function useSelectionCardComponent(params: UseSelectionCardComponentParams): UseSelectionCardComponentReturn {
  const {
    item,
    configWithDefaults,
    isSelected,
    controlClasses
  } = params

  const selectionComponentName = computed(() => {
    return getSelectionComponentName(configWithDefaults.value)
  })

  const selectionComponentProps = computed(() => {
    return buildSelectionComponentProps({
      itemId: item.value.id,
      selectionComponent: configWithDefaults.value.selectionComponent,
      controlPosition: configWithDefaults.value.controlPosition,
      controlClasses: controlClasses.value,
      isSelected: isSelected.value,
    })
  })

  return {
    selectionComponentName,
    selectionComponentProps
  }
}


