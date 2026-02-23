/**
 * PATTERN: useOptionTypeBlockSelection Composable

PATTERN: Delegates to generic co...
 */
import { type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useBlockInstanceSelection } from './useBlockInstanceSelection'

export interface UseOptionTypeBlockSelectionParams {
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  availableOptionTypeBlocks: ComputedRef<BookingBlockInstance[]>
}

export interface UseOptionTypeBlockSelectionReturn {
  selectedOptionTypeBlockId: ComputedRef<string | null>
}

/**
 * PATTERN: useOptionTypeBlockSelection composable

PATTERN: Delegates to generic co...
 */
export function useOptionTypeBlockSelection(
  params: UseOptionTypeBlockSelectionParams
): UseOptionTypeBlockSelectionReturn {
  const { selectedBlockId } = useBlockInstanceSelection({
    selectedBlocks: params.selectedOptionTypeBlocks,
    availableBlocks: params.availableOptionTypeBlocks,
    selectionMode: 'single'
  })

  return {
    selectedOptionTypeBlockId: selectedBlockId
  }
}

