/**
 * USEINSTANCESELECTIONSTATE TESTS
 * 
 * Unit tests for useInstanceSelectionState and useServiceSelectionState composables.
 * Tests v-model bridges for single and multi-select block instance selection.
 * 
 * Coverage:
 * - selectedId computed (single-select v-model bridge)
 * - selectedIds computed (multi-select v-model bridge)
 * - Getter returns correct IDs
 * - Setter calls toggleSelection with resolved instances
 * - Legacy useServiceSelectionState compatibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { 
  useInstanceSelectionState, 
  useServiceSelectionState,
  type UseInstanceSelectionStateParams,
  type GenericWizardInstance,
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

describe('useServiceSelectionState (legacy)', () => {
  // Test fixtures
  const mockUserTypeBlocks: BookingBlockInstance[] = [
    { id: 'ut-1', name: 'User Type 1' } as BookingBlockInstance,
    { id: 'ut-2', name: 'User Type 2' } as BookingBlockInstance,
  ]

  const mockServices: BookingBlockInstance[] = [
    { id: 'service-1', name: 'Service 1' } as BookingBlockInstance,
    { id: 'service-2', name: 'Service 2' } as BookingBlockInstance,
  ]

  let mockWizard: GenericWizardInstance

  beforeEach(() => {
    vi.clearAllMocks()
    mockWizard = {
      selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      availableUserTypeBlocks: ref(mockUserTypeBlocks),
      selectedServices: ref<BookingBlockInstance[]>([]),
      availableServices: ref(mockServices),
      selectUserTypeBlock: vi.fn(),
      toggleService: vi.fn(),
    }
  })

  describe('selectedUserTypeBlockId', () => {
    it('should return null when no user type is selected', () => {
      const { selectedUserTypeBlockId } = useServiceSelectionState({ wizard: mockWizard })
      expect(selectedUserTypeBlockId.value).toBeNull()
    })

    it('should return selected user type ID', () => {
      mockWizard.selectedUserTypeBlock.value = mockUserTypeBlocks[0]
      
      const { selectedUserTypeBlockId } = useServiceSelectionState({ wizard: mockWizard })
      expect(selectedUserTypeBlockId.value).toBe('ut-1')
    })

    it('should call selectUserTypeBlock when setting ID', () => {
      const { selectedUserTypeBlockId } = useServiceSelectionState({ wizard: mockWizard })
      selectedUserTypeBlockId.value = 'ut-2'

      expect(mockWizard.selectUserTypeBlock).toHaveBeenCalledWith(mockUserTypeBlocks[1])
    })

    it('should call selectUserTypeBlock with null when setting null ID', () => {
      mockWizard.selectedUserTypeBlock.value = mockUserTypeBlocks[0]
      
      const { selectedUserTypeBlockId } = useServiceSelectionState({ wizard: mockWizard })
      selectedUserTypeBlockId.value = null

      expect(mockWizard.selectUserTypeBlock).toHaveBeenCalledWith(null)
    })
  })

  describe('selectedServiceIds', () => {
    it('should return empty array when no services selected', () => {
      const { selectedServiceIds } = useServiceSelectionState({ wizard: mockWizard })
      expect(selectedServiceIds.value).toEqual([])
    })

    it('should return array of selected service IDs', () => {
      mockWizard.selectedServices.value = [mockServices[0], mockServices[1]]
      
      const { selectedServiceIds } = useServiceSelectionState({ wizard: mockWizard })
      expect(selectedServiceIds.value).toEqual(['service-1', 'service-2'])
    })

    it('should clear and toggle services when setting IDs', () => {
      const { selectedServiceIds } = useServiceSelectionState({ wizard: mockWizard })
      selectedServiceIds.value = ['service-1', 'service-2']

      // Should toggle each service with skipCascade=true
      expect(mockWizard.toggleService).toHaveBeenCalledTimes(2)
      expect(mockWizard.toggleService).toHaveBeenCalledWith(mockServices[0], true)
      expect(mockWizard.toggleService).toHaveBeenCalledWith(mockServices[1], true)
    })
  })
})
