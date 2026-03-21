/**
 * PATTERN: usePropertyTypeBlockSelection Composable

PATTERN: Delegates to generic ...
 */
import { useBlockInstanceSelection } from './useBlockInstanceSelection'
import type { UsePropertyTypeBlockSelectionParams, UsePropertyTypeBlockSelectionReturn } from '@/types/booking/propertyTypeBlockSelection'


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

