/**
 * USEOPTIONTYPEBLOCKSELECTION TESTS
 * 
 * Unit tests for useOptionTypeBlockSelection composable.
 * Tests option type block selection logic.
 * 
 * What it covers:
 * - selectedOptionTypeBlockId: Computed ID of selected option type
 * 
 * How it works:
 * - Tests delegation to useBlockInstanceSelection
 * - Tests single selection mode behavior
 * 
 * What it validates:
 * - Returns ID of first selected block
 * - Returns null when no selection
 * - Properly delegates to generic composable
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 * - useBlockInstanceSelection composable
 */

import { describe, it, expect } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useOptionTypeBlockSelection } from '../useOptionTypeBlockSelection'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Helper to create mock block instance
function createBlock(id: string, name?: string): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: name || `Block ${id}`,
    description: 'Test block',
    icon: 'star',
    baseSqFt: 0,
    active: true,
    dependent: false,
    differential: false,
    orderIndex: 0,
    blockShape: 'Option Type',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

describe('useOptionTypeBlockSelection', () => {
  describe('selectedOptionTypeBlockId', () => {
    it('should return ID of first selected block', () => {
      const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([
        createBlock('option-1'),
      ])
      const availableOptionTypeBlocks = computed(() => [
        createBlock('option-1'),
        createBlock('option-2'),
      ])

      const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
        selectedOptionTypeBlocks,
        availableOptionTypeBlocks,
      })

      expect(selectedOptionTypeBlockId.value).toBe('option-1')
    })

    it('should return null when no blocks selected', () => {
      const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([])
      const availableOptionTypeBlocks = computed(() => [
        createBlock('option-1'),
      ])

      const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
        selectedOptionTypeBlocks,
        availableOptionTypeBlocks,
      })

      expect(selectedOptionTypeBlockId.value).toBeNull()
    })

    it('should update when selection changes', async () => {
      const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([])
      const availableOptionTypeBlocks = computed(() => [
        createBlock('option-1'),
        createBlock('option-2'),
      ])

      const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
        selectedOptionTypeBlocks,
        availableOptionTypeBlocks,
      })

      expect(selectedOptionTypeBlockId.value).toBeNull()

      // Select an option
      selectedOptionTypeBlocks.value = [createBlock('option-2')]

      await nextTick()

      expect(selectedOptionTypeBlockId.value).toBe('option-2')
    })

    it('should return first block ID when multiple selected', () => {
      const selectedOptionTypeBlocks = ref<BookingBlockInstance[]>([
        createBlock('option-1'),
        createBlock('option-2'),
      ])
      const availableOptionTypeBlocks = computed(() => [
        createBlock('option-1'),
        createBlock('option-2'),
      ])

      const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
        selectedOptionTypeBlocks,
        availableOptionTypeBlocks,
      })

      // Single selection mode - returns first
      expect(selectedOptionTypeBlockId.value).toBe('option-1')
    })
  })
})
