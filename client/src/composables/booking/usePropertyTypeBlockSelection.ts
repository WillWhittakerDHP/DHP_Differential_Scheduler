/**
 * usePropertyTypeBlockSelection Composable
 * 
 * LEARNING: Thin wrapper around generic useBlockInstanceSelection
 * WHY: Provides backward compatibility with existing code
 * PATTERN: Delegates to generic composable
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
 * usePropertyTypeBlockSelection composable
 * 
 * LEARNING: Thin wrapper around generic useBlockInstanceSelection
 * WHY: Provides backward compatibility with existing code
 * PATTERN: Delegates to generic composable
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

