import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UseOptionTypeBlockSelectionParams {
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  availableOptionTypeBlocks: ComputedRef<BookingBlockInstance[]>
}

export interface UseOptionTypeBlockSelectionReturn {
  selectedOptionTypeBlockId: ComputedRef<string | null>
}
