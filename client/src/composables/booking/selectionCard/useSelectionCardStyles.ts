/**
 * useSelectionCardStyles Composable
 * 
 * LEARNING: Extracts CSS class computation logic from SelectionCard component
 * WHY: Moves class calculation logic to composable
 * PATTERN: Composable that provides computed class strings
 */

import { computed, type ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import {
  buildSelectionCardClasses,
  buildSelectionContentContainerClasses,
  buildSelectionControlClasses,
} from '@/utils/booking/selectionCardStyles'

/** Base shared with UseSelectionCardComponentParams (P2 type-similarity). */
export interface UseSelectionCardStylesParamsBase {
  configWithDefaults: ComputedRef<SelectionCardConfig>
  isSelected: ComputedRef<boolean>
}

export type UseSelectionCardStylesParams = UseSelectionCardStylesParamsBase

export interface UseSelectionCardStylesReturn {
  cardClasses: ComputedRef<string>
  controlClasses: ComputedRef<Record<string, boolean>>
  contentContainerClasses: ComputedRef<string>
}

/**
 * useSelectionCardStyles composable
 * 
 * LEARNING: Provides CSS class computations
 * WHY: Extracts class calculation logic from component to composable
 * PATTERN: Composable that returns reactive computed class strings
 */
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


