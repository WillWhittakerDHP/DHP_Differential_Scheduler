/**
 * useDynamicGridConfig Composable
 * 
 * LEARNING: Extracts dynamic grid column calculation logic from ServiceSelectionStep component
 * WHY: Moves grid configuration logic out of component into reusable composable
 * PATTERN: Composable that calculates grid columns based on item count
 */

import { computed, type ComputedRef } from 'vue'
import { calculateGridColumnsForItemCount } from '@/utils/booking/selectionCardGroupConfig'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export interface UseDynamicGridConfigOptions {
  /**
   * Base selection card config
   */
  baseConfig: ComputedRef<SelectionCardConfig>
  
  /**
   * Item count for grid column calculation
   */
  itemCount: ComputedRef<number>
}

export interface UseDynamicGridConfigReturn {
  /**
   * Selection card config with dynamic grid columns
   */
  dynamicConfig: ComputedRef<SelectionCardConfig>
}

/**
 * LEARNING: Dynamic grid config composable
 * WHY: Extracts grid column calculation logic from component to composable
 * PATTERN: Composable that merges base config with dynamic grid columns
 */
export function useDynamicGridConfig(
  options: UseDynamicGridConfigOptions
): UseDynamicGridConfigReturn {
  const { baseConfig, itemCount } = options

  /**
   * LEARNING: Override grid columns dynamically based on item count
   * WHY: Cards should fit on one row when there are fewer than 5 items
   * PATTERN: Merge base config with dynamic grid columns
   */
  const dynamicConfig = computed<SelectionCardConfig>(() => {
    const base = baseConfig.value
    const count = itemCount.value
    const dynamicGridColumns = calculateGridColumnsForItemCount(count)
    
    return {
      ...base,
      gridColumns: dynamicGridColumns
    }
  })

  return {
    dynamicConfig
  }
}
