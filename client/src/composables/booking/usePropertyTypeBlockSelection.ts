/**
 * PATTERN: usePropertyTypeBlockSelection Composable

PATTERN: Delegates to generic ...
 */
import { type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useBlockInstanceSelection } from './useBlockInstanceSelection'

export interface UsePropertyTypeBlockSelectionParams {
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
  availablePropertyTypeBlocks: ComputedRef<BookingBlockInstance[]>
  togglePropertyTypeBlock: (block: BookingBlockInstance) => void
}

export interface UsePropertyTypeBlockSelectionReturn {
  selectedPropertyTypeBlockId: ComputedRef<string | null>
}

/**
 * PATTERN: usePropertyTypeBlockSelection composable

PATTERN: Delegates to generic ...
 */
export function usePropertyTypeBlockSelection(
  params: UsePropertyTypeBlockSelectionParams
): UsePropertyTypeBlockSelectionReturn {
  const { selectedBlockId } = useBlockInstanceSelection({
    selectedBlocks: params.selectedPropertyTypeBlocks,
    availableBlocks: params.availablePropertyTypeBlocks,
    selectionMode: 'single'
  })

  return {
    selectedPropertyTypeBlockId: selectedBlockId
  }
}

