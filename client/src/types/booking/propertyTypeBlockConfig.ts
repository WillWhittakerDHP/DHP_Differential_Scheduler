import type { Ref, ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export interface UsePropertyTypeBlockConfigParams {
  selectedPropertyTypeBlocks: Ref<unknown[]>
  propertyTypeBlocksStatePlugin: unknown | null
  availablePropertyTypeBlocks?: Ref<unknown[]>
}

export interface UsePropertyTypeBlockConfigReturn {
  rowSelectionConfig: ComputedRef<SelectionCardConfig>
}
