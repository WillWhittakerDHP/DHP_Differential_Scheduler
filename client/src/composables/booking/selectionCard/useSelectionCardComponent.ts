/**
 * WHY: useSelectionCardComponent Composable

WHY: Moves dynamic component rende...
 */
import { computed, type ComputedRef } from 'vue'
import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import { buildSelectionComponentProps, getSelectionComponentName } from '@/utils/booking/selectionCardComponent'
import type { UseSelectionCardStylesParamsBase } from './useSelectionCardStyles'

/** Extends shared styles params base (P2 type-similarity). */
export interface UseSelectionCardComponentParams extends UseSelectionCardStylesParamsBase {
  item: ComputedRef<SelectionCardItem>
  controlClasses: ComputedRef<Record<string, boolean>>
}

export interface UseSelectionCardComponentReturn {
  selectionComponentName: ComputedRef<string>
  selectionComponentProps: ComputedRef<Record<string, unknown>>
}

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


