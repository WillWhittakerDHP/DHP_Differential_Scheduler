/**
 * WHY: useBlockInstanceSelection Composable

 */
import { computed } from 'vue'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import type {
  UseBlockInstanceSelectionParams,
  UseBlockInstanceSelectionReturnSingle,
  UseBlockInstanceSelectionReturnMultiple,
} from '@/types/booking/blockInstanceSelection'

export function useBlockInstanceSelection(
  params: UseBlockInstanceSelectionParams & { selectionMode: 'single' }
): UseBlockInstanceSelectionReturnSingle
export function useBlockInstanceSelection(
  params: UseBlockInstanceSelectionParams & { selectionMode: 'multiple' }
): UseBlockInstanceSelectionReturnMultiple
export function useBlockInstanceSelection(
  params: UseBlockInstanceSelectionParams
): UseBlockInstanceSelectionReturnSingle | UseBlockInstanceSelectionReturnMultiple {
  const {
    selectedBlocks,
    availableBlocks,
    toggleBlock,
    selectionMode
  } = params

  if (selectionMode === 'single') {
    const selectedBlockId = computed({
      get: () => selectedBlocks.value.length > 0
        ? selectedBlocks.value[0].id
        : null,
      set: (id: string | null) => {
        if (id) {
          const selected = findById(availableBlocks.value, id)
          selectedBlocks.value = selected ? [selected] : []
        } else {
          selectedBlocks.value = []
        }
      }
    })

    return { selectedBlockId }
  } else {
    const selectedBlockIds = computed({
      get: () => selectedBlocks.value.map(b => b.id),
      set: (ids: string[]) => {
        const { resolved: blocks } = resolveByIds(availableBlocks.value, ids)

        if (toggleBlock) {
          selectedBlocks.value = []
          for (const block of blocks) {
            toggleBlock(block)
          }
        } else {
          selectedBlocks.value = blocks
        }
      }
    })

    return { selectedBlockIds }
  }
}
