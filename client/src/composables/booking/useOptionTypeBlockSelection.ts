/**
 * PATTERN: useOptionTypeBlockSelection Composable

PATTERN: Delegates to generic co...
 */
import { useBlockInstanceSelection } from './useBlockInstanceSelection'
import type { UseOptionTypeBlockSelectionParams, UseOptionTypeBlockSelectionReturn } from '@/types/booking/optionTypeBlockSelection'


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

