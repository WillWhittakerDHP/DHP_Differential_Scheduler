/**
 * useBlockInstanceSelection Composable
 * 
 * LEARNING: Generic composable for block instance selection (single or multi-select)
 * WHY: Eliminates code duplication across different block type selections
 * PATTERN: Generic helper that adapts to single or multi-select modes
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'

export type SelectionMode = 'single' | 'multiple'

interface UseBlockInstanceSelectionParams {
  selectedBlocks: Ref<BookingBlockInstance[]>
  availableBlocks: ComputedRef<BookingBlockInstance[]>
  toggleBlock?: (block: BookingBlockInstance) => void
  selectionMode: SelectionMode
}

interface UseBlockInstanceSelectionReturnSingle {
  selectedBlockId: ComputedRef<string | null>
}

interface UseBlockInstanceSelectionReturnMultiple {
  selectedBlockIds: ComputedRef<string[]>
}

type UseBlockInstanceSelectionReturn<Mode extends SelectionMode> = 
  Mode extends 'single' 
    ? UseBlockInstanceSelectionReturnSingle 
    : UseBlockInstanceSelectionReturnMultiple

/**
 * Generic block instance selection composable
 * 
 * LEARNING: Handles both single and multi-select for any block type
 * WHY: Eliminates duplication between option/property/service selection
 * PATTERN: Mode-based typing with discriminated unions
 */
export function useBlockInstanceSelection<Mode extends SelectionMode>(
  params: UseBlockInstanceSelectionParams & { selectionMode: Mode }
): UseBlockInstanceSelectionReturn<Mode> {
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

    return { selectedBlockId } as unknown as UseBlockInstanceSelectionReturn<Mode>
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

    return { selectedBlockIds } as unknown as UseBlockInstanceSelectionReturn<Mode>
  }
}

