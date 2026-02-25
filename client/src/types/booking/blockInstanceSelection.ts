import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export type SelectionMode = 'single' | 'multiple'

export interface UseBlockInstanceSelectionParams {
  selectedBlocks: Ref<BookingBlockInstance[]>
  availableBlocks: ComputedRef<BookingBlockInstance[]>
  toggleBlock?: (block: BookingBlockInstance) => void
  selectionMode: SelectionMode
}

export interface UseBlockInstanceSelectionReturnSingle {
  selectedBlockId: ComputedRef<string | null>
}

export interface UseBlockInstanceSelectionReturnMultiple {
  selectedBlockIds: ComputedRef<string[]>
}
