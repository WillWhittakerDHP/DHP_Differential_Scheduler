/**
 * WHY: useDynamicGridConfig Composable

WHY: Moves grid configuration logic out...
 */
import { computed, type ComputedRef } from 'vue'
import { calculateGridColumnsForItemCount } from '@/utils/booking/selectionCardGroupConfig'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export interface UseDynamicGridConfigOptions {
  baseConfig: ComputedRef<SelectionCardConfig>
  
  itemCount: ComputedRef<number>
}

export interface UseDynamicGridConfigReturn {
  dynamicConfig: ComputedRef<SelectionCardConfig>
}

/**
 * WHY: Dynamic grid config composable
WHY: Extracts grid column calculation log...
 */
export function useDynamicGridConfig(
  options: UseDynamicGridConfigOptions
): UseDynamicGridConfigReturn {
  const { baseConfig, itemCount } = options

  /**
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
