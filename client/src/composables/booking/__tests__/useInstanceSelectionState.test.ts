/**
 * USEINSTANCESELECTIONSTATE TESTS
 * 
 * Unit tests for useInstanceSelectionState composable.
 * Tests v-model bridges for single and multi-select block instance selection.
 * 
 * Coverage:
 * - selectedId computed (single-select v-model bridge)
 * - selectedIds computed (multi-select v-model bridge)
 * - Getter returns correct IDs
 * - Setter calls toggleSelection with resolved instances
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { 
  useInstanceSelectionState, 
  type UseInstanceSelectionStateParams,
} from '../useInstanceSelectionState'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Mock findById and resolveByIds
vi.mock('@/utils/collections/findById', () => ({
  findById: vi.fn((instances: BookingBlockInstance[], id: string) => 
    instances.find(i => i.id === id) || null
  ),
}))

vi.mock('@/utils/collections/resolveByIds', () => ({
  resolveByIds: vi.fn((instances: BookingBlockInstance[], ids: string[]) => ({
    resolved: instances.filter(i => ids.includes(i.id)),
    missing: ids.filter(id => !instances.find(i => i.id === id)),
  })),
}))

describe('useInstanceSelectionState', () => {
  // Test fixtures
  const mockInstances: BookingBlockInstance[] = [
    { id: 'block-1', name: 'Block 1' } as BookingBlockInstance,
    { id: 'block-2', name: 'Block 2' } as BookingBlockInstance,
    { id: 'block-3', name: 'Block 3' } as BookingBlockInstance,
  ]

  let toggleSelection: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    toggleSelection = vi.fn()
  })

  describe('selectedId (single-select)', () => {
    it('should return null when no instance is selected', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => []),
        toggleSelection,
      }

      const { selectedId } = useInstanceSelectionState(params)
      expect(selectedId.value).toBeNull()
    })

    it('should return first selected instance ID', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => [mockInstances[0]]),
        toggleSelection,
      }

      const { selectedId } = useInstanceSelectionState(params)
      expect(selectedId.value).toBe('block-1')
    })

    it('should call toggleSelection when setting ID', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => []),
        toggleSelection,
      }

      const { selectedId } = useInstanceSelectionState(params)
      selectedId.value = 'block-2'

      expect(toggleSelection).toHaveBeenCalledWith(mockInstances[1])
    })

    it('should not call toggleSelection when setting null ID', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => [mockInstances[0]]),
        toggleSelection,
      }

      const { selectedId } = useInstanceSelectionState(params)
      selectedId.value = null

      expect(toggleSelection).not.toHaveBeenCalled()
    })

    it('should handle non-array selectedInstances', () => {
      // When selectedInstances is a single value (not array)
      const selectedInstance = ref<BookingBlockInstance | null>(mockInstances[0])
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => selectedInstance.value ? [selectedInstance.value] : []),
        toggleSelection,
      }

      const { selectedId } = useInstanceSelectionState(params)
      expect(selectedId.value).toBe('block-1')
    })
  })

  describe('selectedIds (multi-select)', () => {
    it('should return empty array when no instances selected', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => []),
        toggleSelection,
      }

      const { selectedIds } = useInstanceSelectionState(params)
      expect(selectedIds.value).toEqual([])
    })

    it('should return array of selected instance IDs', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => [mockInstances[0], mockInstances[2]]),
        toggleSelection,
      }

      const { selectedIds } = useInstanceSelectionState(params)
      expect(selectedIds.value).toEqual(['block-1', 'block-3'])
    })

    it('should call toggleSelection for each instance when setting IDs', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => []),
        toggleSelection,
      }

      const { selectedIds } = useInstanceSelectionState(params)
      selectedIds.value = ['block-1', 'block-2']

      // Should call toggle for each resolved instance with skipCascade=true
      expect(toggleSelection).toHaveBeenCalledTimes(2)
      expect(toggleSelection).toHaveBeenCalledWith(mockInstances[0], true)
      expect(toggleSelection).toHaveBeenCalledWith(mockInstances[1], true)
    })

    it('should handle empty IDs array', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => [mockInstances[0]]),
        toggleSelection,
      }

      const { selectedIds } = useInstanceSelectionState(params)
      selectedIds.value = []

      expect(toggleSelection).not.toHaveBeenCalled()
    })
  })

  describe('without toggleSelection', () => {
    it('should not throw when toggleSelection is not provided', () => {
      const params: UseInstanceSelectionStateParams = {
        availableInstances: computed(() => mockInstances),
        selectedInstances: computed(() => []),
      }

      const { selectedId, selectedIds } = useInstanceSelectionState(params)

      // Setting values should not throw
      expect(() => { selectedId.value = 'block-1' }).not.toThrow()
      expect(() => { selectedIds.value = ['block-1'] }).not.toThrow()
    })
  })
})
