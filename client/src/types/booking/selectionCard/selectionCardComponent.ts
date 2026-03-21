import type { ComputedRef } from 'vue'
import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import type { UseSelectionCardStylesParamsBase } from '@/types/booking/selectionCard/selectionCardStyles'

export interface UseSelectionCardComponentParams extends UseSelectionCardStylesParamsBase {
  item: ComputedRef<SelectionCardItem>
  controlClasses: ComputedRef<Record<string, boolean>>
}

export interface UseSelectionCardComponentReturn {
  selectionComponentName: ComputedRef<string>
  selectionComponentProps: ComputedRef<Record<string, unknown>>
}
