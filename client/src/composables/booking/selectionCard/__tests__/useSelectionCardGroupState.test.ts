/**
 * USESELECTIONCARDGROUPSTATE TESTS
 * 
 * Unit tests for useSelectionCardGroupState composable.
 * Tests group state management for selection cards.
 * 
 * What it covers:
 * - expandedCardIds: Track expanded cards
 * - nestedSelections: Track nested selections per card
 * - expansionStates: Computed expansion state object
 * - internalValue: Computed model value
 * - handleNestedSelection: Update nested selections
 * - toggleCardExpansion: Toggle card expansion
 * 
 * How it works:
 * - Tests state management logic
 * - Tests auto-expansion on selection
 * - Tests computed reactivity
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect, vi } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useSelectionCardGroupState } from '../useSelectionCardGroupState'
import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

// Helper to create mock item
function createItem(id: string, options: Partial<SelectionCardItem> = {}): SelectionCardItem {
  return {
    id,
    name: `Item ${id}`,
    description: 'Test item',
    ...options,
  } as SelectionCardItem
}

describe('useSelectionCardGroupState', () => {
  describe('expandedCardIds', () => {
    it('should start empty', () => {
      const { expandedCardIds } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      expect(expandedCardIds.value).toEqual([])
    })
  })

  describe('nestedSelections', () => {
    it('should start empty', () => {
      const { nestedSelections } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      expect(nestedSelections.value).toEqual({})
    })
  })

  describe('internalValue', () => {
    it('should return model value', () => {
      const { internalValue } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => 'item-1'),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      expect(internalValue.value).toBe('item-1')
    })

    it('should handle array model value', () => {
      const { internalValue } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1'), createItem('item-2')]),
        modelValue: computed(() => ['item-1', 'item-2']),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      expect(internalValue.value).toEqual(['item-1', 'item-2'])
    })

    it('should handle null model value', () => {
      const { internalValue } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      expect(internalValue.value).toBeNull()
    })
  })

  describe('expansionStates', () => {
    it('should return empty object when no cards expanded', () => {
      const { expansionStates } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      expect(expansionStates.value).toEqual({})
    })

    it('should track expanded card IDs', async () => {
      const { expansionStates, toggleCardExpansion } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      toggleCardExpansion('item-1')
      await nextTick()
      
      expect(expansionStates.value['item-1']).toBe(true)
    })
  })

  describe('handleNestedSelection', () => {
    it('should store nested selections for item', () => {
      const { nestedSelections, handleNestedSelection } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      handleNestedSelection('item-1', ['comp-1', 'comp-2'])
      
      expect(nestedSelections.value['item-1']).toEqual(['comp-1', 'comp-2'])
    })

    it('should update existing nested selections', () => {
      const { nestedSelections, handleNestedSelection } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      handleNestedSelection('item-1', ['comp-1'])
      handleNestedSelection('item-1', ['comp-2', 'comp-3'])
      
      expect(nestedSelections.value['item-1']).toEqual(['comp-2', 'comp-3'])
    })
  })

  describe('toggleCardExpansion', () => {
    it('should add card to expanded list', async () => {
      const { expandedCardIds, toggleCardExpansion } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      toggleCardExpansion('item-1')
      await nextTick()
      
      expect(expandedCardIds.value).toContain('item-1')
    })

    it('should remove card from expanded list on second toggle', async () => {
      const { expandedCardIds, toggleCardExpansion } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({})),
        shouldExpand: () => false,
      })
      
      toggleCardExpansion('item-1')
      await nextTick()
      expect(expandedCardIds.value).toContain('item-1')
      
      toggleCardExpansion('item-1')
      await nextTick()
      expect(expandedCardIds.value).not.toContain('item-1')
    })
  })

  describe('auto-expansion', () => {
    it('should auto-expand when card selected and expansion enabled', async () => {
      const modelValueRef = ref<string | null>(null)
      
      const { expandedCardIds } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => modelValueRef.value),
        configWithDefaults: computed(() => ({ expansion: { enabled: true } })),
        shouldExpand: () => true,
      })
      
      modelValueRef.value = 'item-1'
      await nextTick()
      
      expect(expandedCardIds.value).toContain('item-1')
    })

    it('should not auto-expand when expansion disabled', async () => {
      const modelValueRef = ref<string | null>(null)
      
      const { expandedCardIds } = useSelectionCardGroupState({
        items: computed(() => [createItem('item-1')]),
        modelValue: computed(() => modelValueRef.value),
        configWithDefaults: computed(() => ({ expansion: { enabled: false } })),
        shouldExpand: () => true,
      })
      
      modelValueRef.value = 'item-1'
      await nextTick()
      
      expect(expandedCardIds.value).not.toContain('item-1')
    })
  })
})
