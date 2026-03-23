/**
 * PATTERN: useInstanceSelectionState Composable
 * PATTERN: Composable that provides ...
 */
import type { UseInstanceSelectionStateParams, UseInstanceSelectionStateReturn } from '@/types/booking/instanceSelectionState'
import { buildInstanceSelectionBindingModels } from '@/composables/booking/buildInstanceSelectionBindingModels'

/**
 * PATTERN: useInstanceSelectionState composable
 * PATTERN: Composable that provides ...
 */
export function useInstanceSelectionState(
  params: UseInstanceSelectionStateParams
): UseInstanceSelectionStateReturn {
  const { availableInstances, selectedInstances, toggleSelection } = params

  const { selectedId, selectedIds } = buildInstanceSelectionBindingModels({
    availableInstances,
    selectedInstances,
    toggleSelection,
  })

  return {
    selectedId,
    selectedIds,
  }
}
