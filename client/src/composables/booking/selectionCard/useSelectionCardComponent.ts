/**
 * useSelectionCardComponent Composable
 * 
 * LEARNING: Extracts selection component name and props logic from SelectionCard component
 * WHY: Moves dynamic component rendering logic to composable
 * PATTERN: Composable that provides component name and props
 */

import { computed, type ComputedRef } from 'vue'
import type { SelectionCardItem, SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { buildSelectionComponentProps, getSelectionComponentName } from '@/utils/booking/selectionCardComponent'

/**
 * useSelectionCardComponent composable parameters
 */
export interface UseSelectionCardComponentParams {
  item: ComputedRef<SelectionCardItem>
  configWithDefaults: ComputedRef<SelectionCardConfig>
  isSelected: ComputedRef<boolean>
  controlClasses: ComputedRef<Record<string, boolean>>
}

/**
 * useSelectionCardComponent composable return type
 */
export interface UseSelectionCardComponentReturn {
  selectionComponentName: ComputedRef<string>
  selectionComponentProps: ComputedRef<Record<string, unknown>>
}

/**
 * useSelectionCardComponent composable
 * 
 * LEARNING: Provides selection component name and props
 * WHY: Extracts component rendering logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useSelectionCardComponent(params: UseSelectionCardComponentParams): UseSelectionCardComponentReturn {
  const {
    item,
    configWithDefaults,
    isSelected,
    controlClasses
  } = params

  /**
   * LEARNING: Selection component name based on config
   * WHY: Allows dynamic component rendering
   * PATTERN: Computed property that returns component name
   */
  const selectionComponentName = computed(() => {
    return getSelectionComponentName(configWithDefaults.value)
  })

  /**
   * LEARNING: Selection component props
   * WHY: Props to pass to dynamic selection component
   * PATTERN: Computed object with component-specific props
   */
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


