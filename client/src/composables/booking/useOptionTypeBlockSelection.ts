/**
 * useOptionTypeBlockSelection Composable
 * 
 * LEARNING: Thin wrapper around generic useBlockInstanceSelection
 * WHY: Provides backward compatibility with existing code
 * PATTERN: Delegates to generic composable
 */

import { type ComputedRef, type Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useBlockInstanceSelection } from './useBlockInstanceSelection'

/**
 * useOptionTypeBlockSelection composable parameters
 */
export interface UseOptionTypeBlockSelectionParams {
  selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
  availableOptionTypeBlocks: ComputedRef<BookingBlockInstance[]>
}

/**
 * useOptionTypeBlockSelection composable return type
 */
export interface UseOptionTypeBlockSelectionReturn {
  selectedOptionTypeBlockId: ComputedRef<string | null>
}

/**
 * useOptionTypeBlockSelection composable
 * 
 * LEARNING: Thin wrapper around generic useBlockInstanceSelection
 * WHY: Provides backward compatibility with existing code
 * PATTERN: Delegates to generic composable
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

