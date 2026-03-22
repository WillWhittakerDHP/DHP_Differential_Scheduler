import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UsePropertyTypeBlockSelectionParams {
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
  availablePropertyTypeBlocks: ComputedRef<BookingBlockInstance[]>
  togglePropertyTypeBlock: (block: BookingBlockInstance) => void
}

export interface UsePropertyTypeBlockSelectionReturn {
  selectedPropertyTypeBlockId: ComputedRef<string | null>
}
