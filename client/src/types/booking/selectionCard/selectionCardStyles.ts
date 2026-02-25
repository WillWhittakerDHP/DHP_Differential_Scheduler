import type { ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

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
