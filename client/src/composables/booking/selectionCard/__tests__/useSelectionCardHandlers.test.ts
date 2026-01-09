/**
 * USESELECTIONCARDHANDLERS TESTS
 * 
 * Unit tests for useSelectionCardHandlers composable.
 * Tests selection handling, nested child updates, and click handling.
 * 
 * What it covers:
 * - handleSelection: Toggle selection via plugin or emit
 * - handleNestedChildUpdate: Update nested child selections
 * - handleParentClick: Handle card click with nested component detection
 * - toggleExpansion: Toggle card expansion state
 * 
 * How it works:
 * - Tests plugin-based selection handling
 * - Tests emit-based fallback selection handling
 * - Tests nested child selection updates
 * - Tests expansion toggling
 * 
 * What it validates:
 * - Plugin setValue called with correct args when available
 * - Emit called when no plugin
 * - Nested click detection prevents selection
 * - Expansion toggle works for controlled and uncontrolled modes
 * 
 * Dependencies:
 * - vitest for testing
 * - vue computed for reactive state
 */

import { describe, it, expect, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useSelectionCardHandlers } from '../useSelectionCardHandlers'
import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'

// Helper to create mock item
function createItem(id: string): SelectionCardItem {
  return {
    id,
    name: `Item ${id}`,
    description: 'Test item',
    icon: 'star',
  } as SelectionCardItem
}

// Helper to create mock plugin
function createMockPlugin(): StatePlugin {
  return {
    id: 'test-plugin',
    getValue: vi.fn(() => false),
    setValue: vi.fn(),
  }
}

// Helper to create mock emit
function createMockEmit() {
  return vi.fn() as unknown as {
    (e: 'update:modelValue', value: string | null | string[]): void
    (e: 'update:nestedChildSelections', childIds: string[]): void
    (e: 'toggle-expansion'): void
  }
}

describe('useSelectionCardHandlers', () => {
  describe('handleSelection', () => {
    it('should use plugin setValue when plugin available', () => {
      const plugin = createMockPlugin()
      const emit = createMockEmit()
      
      const { handleSelection } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => plugin),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleSelection()
      
      expect(plugin.setValue).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'item-1' }),
        true // Not selected, so selecting
      )
      expect(emit).not.toHaveBeenCalled()
    })

    it('should toggle to deselect when already selected', () => {
      const plugin = createMockPlugin()
      const emit = createMockEmit()
      
      const { handleSelection } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => 'item-1'),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => plugin),
        isSelected: computed(() => true),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleSelection()
      
      expect(plugin.setValue).toHaveBeenCalledWith(
        expect.anything(),
        false // Already selected, so deselecting
      )
    })

    it('should emit update:modelValue when no plugin', () => {
      const emit = createMockEmit()
      
      const { handleSelection } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleSelection()
      
      expect(emit).toHaveBeenCalledWith('update:modelValue', 'item-1')
    })

    it('should emit null to deselect when already selected (no plugin)', () => {
      const emit = createMockEmit()
      
      const { handleSelection } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => 'item-1'),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => true),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleSelection()
      
      expect(emit).toHaveBeenCalledWith('update:modelValue', null)
    })
  })

  describe('handleNestedChildUpdate', () => {
    it('should emit updated selections when adding child', () => {
      const emit = createMockEmit()
      
      const { handleNestedChildUpdate } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => ['child-1']),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleNestedChildUpdate('child-2', true)
      
      expect(emit).toHaveBeenCalledWith(
        'update:nestedChildSelections',
        ['child-1', 'child-2']
      )
    })

    it('should emit updated selections when removing child', () => {
      const emit = createMockEmit()
      
      const { handleNestedChildUpdate } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => ['child-1', 'child-2']),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleNestedChildUpdate('child-1', false)
      
      expect(emit).toHaveBeenCalledWith(
        'update:nestedChildSelections',
        ['child-2']
      )
    })

    it('should handle empty initial selections', () => {
      const emit = createMockEmit()
      
      const { handleNestedChildUpdate } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleNestedChildUpdate('child-1', true)
      
      expect(emit).toHaveBeenCalledWith(
        'update:nestedChildSelections',
        ['child-1']
      )
    })
  })

  describe('toggleExpansion', () => {
    it('should emit toggle-expansion when isExpanded is controlled', () => {
      const emit = createMockEmit()
      
      const { toggleExpansion } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => false), // Controlled
        localExpanded: ref(false),
      })
      
      toggleExpansion()
      
      expect(emit).toHaveBeenCalledWith('toggle-expansion')
    })

    it('should toggle localExpanded when isExpanded is undefined', () => {
      const emit = createMockEmit()
      const localExpanded = ref(false)
      
      const { toggleExpansion } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined), // Uncontrolled
        localExpanded,
      })
      
      expect(localExpanded.value).toBe(false)
      
      toggleExpansion()
      
      expect(localExpanded.value).toBe(true)
      expect(emit).not.toHaveBeenCalled()
    })

    it('should toggle localExpanded back to false', () => {
      const emit = createMockEmit()
      const localExpanded = ref(true)
      
      const { toggleExpansion } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded,
      })
      
      toggleExpansion()
      
      expect(localExpanded.value).toBe(false)
    })
  })

  describe('handleParentClick', () => {
    it('should call handleSelection for non-nested clicks', () => {
      const emit = createMockEmit()
      const mockEvent = {
        target: document.createElement('div'),
        stopPropagation: vi.fn(),
      } as unknown as Event
      
      const { handleParentClick } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleParentClick(mockEvent)
      
      // Should have called emit (handleSelection fallback)
      expect(emit).toHaveBeenCalledWith('update:modelValue', 'item-1')
    })

    it('should stop propagation for nested component clicks', () => {
      const emit = createMockEmit()
      // Create a parent with nested-components class
      const parentElement = document.createElement('div')
      parentElement.classList.add('nested-components')
      const childElement = document.createElement('button')
      parentElement.appendChild(childElement)
      
      const mockEvent = {
        target: childElement,
        stopPropagation: vi.fn(),
      } as unknown as Event
      
      const { handleParentClick } = useSelectionCardHandlers({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        nestedChildSelections: computed(() => []),
        activeStatePlugin: computed(() => null),
        isSelected: computed(() => false),
        emit,
        isExpanded: computed(() => undefined),
        localExpanded: ref(false),
      })
      
      handleParentClick(mockEvent)
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(emit).not.toHaveBeenCalled()
    })
  })
})
