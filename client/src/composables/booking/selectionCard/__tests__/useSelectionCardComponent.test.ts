/**
 * USESELECTIONCARDCOMPONENT TESTS
 * 
 * Unit tests for useSelectionCardComponent composable.
 * Tests selection component name and props generation.
 * 
 * What it covers:
 * - selectionComponentName: Dynamic component name based on config
 * - selectionComponentProps: Props for the selection component
 * 
 * How it works:
 * - Tests delegation to utility functions
 * - Tests computed reactivity
 * 
 * Dependencies:
 * - vitest for testing
 * - vue computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { computed } from 'vue'
import { useSelectionCardComponent } from '../useSelectionCardComponent'
import type { SelectionCardItem, SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

// Helper to create mock item
function createItem(id: string): SelectionCardItem {
  return {
    id,
    name: `Item ${id}`,
    description: 'Test item',
  } as SelectionCardItem
}

// Helper to create mock config
function createConfig(overrides: Partial<SelectionCardConfig> = {}): SelectionCardConfig {
  return {
    selectionType: 'radio',
    selectionComponent: 'VRadio',
    selectionGroup: 'VRadioGroup',
    stateSource: 'local',
    statePlugins: [],
    layout: 'row',
    controlPosition: 'bottom',
    gridColumns: { cols: '12', sm: '6', md: '4' },
    appearance: {
      showIcon: true,
      showDescription: true,
      showBorder: true,
      cardPadding: 'pa-6',
      minHeight: 'auto',
    },
    ...overrides,
  }
}

describe('useSelectionCardComponent', () => {
  describe('selectionComponentName', () => {
    it('should return VRadio for radio selection type', () => {
      const { selectionComponentName } = useSelectionCardComponent({
        item: computed(() => createItem('item-1')),
        configWithDefaults: computed(() => createConfig({ selectionComponent: 'VRadio' })),
        isSelected: computed(() => false),
        controlClasses: computed(() => ({})),
      })
      
      expect(selectionComponentName.value).toBe('VRadio')
    })

    it('should return VCheckbox for checkbox selection type', () => {
      const { selectionComponentName } = useSelectionCardComponent({
        item: computed(() => createItem('item-1')),
        configWithDefaults: computed(() => createConfig({ selectionComponent: 'VCheckbox' })),
        isSelected: computed(() => false),
        controlClasses: computed(() => ({})),
      })
      
      expect(selectionComponentName.value).toBe('VCheckbox')
    })
  })

  describe('selectionComponentProps', () => {
    it('should include value prop with item id', () => {
      const { selectionComponentProps } = useSelectionCardComponent({
        item: computed(() => createItem('test-item')),
        configWithDefaults: computed(() => createConfig()),
        isSelected: computed(() => false),
        controlClasses: computed(() => ({})),
      })
      
      expect(selectionComponentProps.value.value).toBe('test-item')
    })

    it('should include class from controlClasses', () => {
      const { selectionComponentProps } = useSelectionCardComponent({
        item: computed(() => createItem('item-1')),
        configWithDefaults: computed(() => createConfig()),
        isSelected: computed(() => false),
        controlClasses: computed(() => ({ 'mt-4': true, 'mb-4': false })),
      })
      
      expect(selectionComponentProps.value.class).toEqual({ 'mt-4': true, 'mb-4': false })
    })

    it('should include modelValue for checkbox component', () => {
      const { selectionComponentProps } = useSelectionCardComponent({
        item: computed(() => createItem('item-1')),
        configWithDefaults: computed(() => createConfig({ selectionComponent: 'VCheckbox' })),
        isSelected: computed(() => true),
        controlClasses: computed(() => ({})),
      })
      
      expect(selectionComponentProps.value.modelValue).toBe(true)
    })
  })
})
