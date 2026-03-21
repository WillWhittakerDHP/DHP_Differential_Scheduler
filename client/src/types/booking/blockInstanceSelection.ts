import type { Ref, ComputedRef, WritableComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export type SelectionMode = 'single' | 'multiple'

export interface UseBlockInstanceSelectionParams {
  selectedBlocks: Ref<BookingBlockInstance[]>
  availableBlocks: ComputedRef<BookingBlockInstance[]>
  toggleBlock?: (block: BookingBlockInstance) => void
  selectionMode: SelectionMode
}

export interface UseBlockInstanceSelectionReturnSingle {
  selectedBlockId: WritableComputedRef<string | null>
}

export interface UseBlockInstanceSelectionReturnMultiple {
  selectedBlockIds: ComputedRef<string[]>
}
