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
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

function applyResolvedBlocksToMultipleSelection(
  blocks: BookingBlockInstance[],
  selectedBlocks: UseBlockInstanceSelectionParams['selectedBlocks'],
  toggleBlock: UseBlockInstanceSelectionParams['toggleBlock']
): void {
  if (toggleBlock) {
    selectedBlocks.value = []
    for (const block of blocks) {
      toggleBlock(block)
    }
    return
  }
  selectedBlocks.value = blocks
}

function useBlockInstanceSelectionSingle(
  params: UseBlockInstanceSelectionParams
): UseBlockInstanceSelectionReturnSingle {
  const { selectedBlocks, availableBlocks } = params

  const selectedBlockId = computed({
    get: () => (selectedBlocks.value.length > 0 ? selectedBlocks.value[0].id : null),
    set: (id: string | null) => {
      if (id) {
        const selected = findById(availableBlocks.value, id)
        if (selected) {
          selectedBlocks.value = [selected]
        }
        // WHY: Cascade list can be empty briefly on remount; do not clear a valid in-memory selection.
        return
      }
      selectedBlocks.value = []
    },
  })

  return { selectedBlockId }
}

function useBlockInstanceSelectionMultiple(
  params: UseBlockInstanceSelectionParams
): UseBlockInstanceSelectionReturnMultiple {
  const { selectedBlocks, availableBlocks, toggleBlock } = params

  const selectedBlockIds = computed({
    get: () => selectedBlocks.value.map((b) => b.id),
    set: (ids: string[]) => {
      const { resolved: blocks } = resolveByIds(availableBlocks.value, ids)
      applyResolvedBlocksToMultipleSelection(blocks, selectedBlocks, toggleBlock)
    },
  })

  return { selectedBlockIds }
}

export function useBlockInstanceSelection(
  params: UseBlockInstanceSelectionParams & { selectionMode: 'single' }
): UseBlockInstanceSelectionReturnSingle
export function useBlockInstanceSelection(
  params: UseBlockInstanceSelectionParams & { selectionMode: 'multiple' }
): UseBlockInstanceSelectionReturnMultiple
export function useBlockInstanceSelection(
  params: UseBlockInstanceSelectionParams
): UseBlockInstanceSelectionReturnSingle | UseBlockInstanceSelectionReturnMultiple {
  if (params.selectionMode === 'single') {
    return useBlockInstanceSelectionSingle(params)
  }
  return useBlockInstanceSelectionMultiple(params)
}
