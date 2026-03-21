import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UseOptionTypeBlockSelectionParams {
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  availableOptionTypeBlocks: ComputedRef<BookingBlockInstance[]>
}

export interface UseOptionTypeBlockSelectionReturn {
  /** Writable so callers can set selected option type block id (e.g. from dropdown). */
  selectedOptionTypeBlockId: WritableComputedRef<string | null>
}
