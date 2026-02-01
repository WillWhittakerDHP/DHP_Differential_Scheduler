/**
 * USEPROPERTYTYPEBLOCKSELECTION TESTS
 * 
 * Unit tests for usePropertyTypeBlockSelection composable.
 * Tests property type block selection logic.
 * 
 * What it covers:
 * - selectedPropertyTypeBlockId: Computed ID of selected property type
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
import { usePropertyTypeBlockSelection } from '../usePropertyTypeBlockSelection'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

function createBlock(id: string, name?: string): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: name || `Block ${id}`,
    description: 'Test block',
    icon: 'home',
    baseSqFt: 1000,
    active: true,
    bookingMode: 'standalone',
    differential: false,
    orderIndex: 0,
    blockShape: 'Property Type',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

describe('usePropertyTypeBlockSelection', () => {
  describe('selectedPropertyTypeBlockId', () => {
    it('should return ID of first selected block', () => {
      const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([
        createBlock('block-1'),
      ])
      const availablePropertyTypeBlocks = computed(() => [
        createBlock('block-1'),
        createBlock('block-2'),
      ])
      const togglePropertyTypeBlock = () => {}

      const { selectedPropertyTypeBlockId } = usePropertyTypeBlockSelection({
        selectedPropertyTypeBlocks,
        availablePropertyTypeBlocks,
        togglePropertyTypeBlock,
      })

      expect(selectedPropertyTypeBlockId.value).toBe('block-1')
    })

    it('should return null when no blocks selected', () => {
      const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([])
      const availablePropertyTypeBlocks = computed(() => [
        createBlock('block-1'),
      ])
      const togglePropertyTypeBlock = () => {}

      const { selectedPropertyTypeBlockId } = usePropertyTypeBlockSelection({
        selectedPropertyTypeBlocks,
        availablePropertyTypeBlocks,
        togglePropertyTypeBlock,
      })

      expect(selectedPropertyTypeBlockId.value).toBeNull()
    })

    it('should update when selection changes', async () => {
      const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([])
      const availablePropertyTypeBlocks = computed(() => [
        createBlock('block-1'),
        createBlock('block-2'),
      ])
      const togglePropertyTypeBlock = () => {}

      const { selectedPropertyTypeBlockId } = usePropertyTypeBlockSelection({
        selectedPropertyTypeBlocks,
        availablePropertyTypeBlocks,
        togglePropertyTypeBlock,
      })

      expect(selectedPropertyTypeBlockId.value).toBeNull()

      selectedPropertyTypeBlocks.value = [createBlock('block-2')]

      await nextTick()

      expect(selectedPropertyTypeBlockId.value).toBe('block-2')
    })

    it('should return first block ID when multiple selected', () => {
      const selectedPropertyTypeBlocks = ref<BookingBlockInstance[]>([
        createBlock('block-1'),
        createBlock('block-2'),
      ])
      const availablePropertyTypeBlocks = computed(() => [
        createBlock('block-1'),
        createBlock('block-2'),
      ])
      const togglePropertyTypeBlock = () => {}

      const { selectedPropertyTypeBlockId } = usePropertyTypeBlockSelection({
        selectedPropertyTypeBlocks,
        availablePropertyTypeBlocks,
        togglePropertyTypeBlock,
      })

      expect(selectedPropertyTypeBlockId.value).toBe('block-1')
    })
  })
})
