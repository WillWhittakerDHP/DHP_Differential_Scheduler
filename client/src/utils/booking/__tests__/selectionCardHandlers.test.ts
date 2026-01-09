/**
 * SELECTION CARD HANDLERS TESTS
 * 
 * Unit tests for selectionCardHandlers utility functions.
 * Tests selection toggling, nested child updates, and click detection.
 * 
 * What it covers:
 * - toggleSelectionModelValue: Single-select and multi-select toggle logic
 * - updateNestedChildSelections: Adding/removing child IDs from selection arrays
 * - isNestedComponentsClick: Detecting clicks on nested components
 * 
 * How it works:
 * - Pure function tests with various input combinations
 * - Tests both single-select (string | null) and multi-select (string[]) modes
 * - Tests edge cases like empty arrays, duplicates, and DOM element detection
 * 
 * What it validates:
 * - Correct toggle behavior for selected/unselected states
 * - Array immutability (returns new arrays, doesn't mutate)
 * - DOM traversal for nested component detection
 * 
 * Dependencies:
 * - vitest for testing
 * - selectionCardHandlers utility functions
 */

import { describe, it, expect } from 'vitest'
import {
  toggleSelectionModelValue,
  updateNestedChildSelections,
  isNestedComponentsClick,
} from '../selectionCardHandlers'

describe('selectionCardHandlers', () => {
  describe('toggleSelectionModelValue', () => {
    describe('single-select mode (string | null)', () => {
      it('should select item when nothing is selected', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-1',
          modelValue: null,
          isSelected: false,
        })
        
        expect(result).toBe('item-1')
      })

      it('should deselect item when it is already selected', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-1',
          modelValue: 'item-1',
          isSelected: true,
        })
        
        expect(result).toBeNull()
      })

      it('should select new item when different item is selected', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-2',
          modelValue: 'item-1',
          isSelected: false,
        })
        
        expect(result).toBe('item-2')
      })
    })

    describe('multi-select mode (string[])', () => {
      it('should add item to empty array', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-1',
          modelValue: [],
          isSelected: false,
        })
        
        expect(result).toEqual(['item-1'])
      })

      it('should add item to existing selections', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-2',
          modelValue: ['item-1'],
          isSelected: false,
        })
        
        expect(result).toEqual(['item-1', 'item-2'])
      })

      it('should remove item from selections when deselecting', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-1',
          modelValue: ['item-1', 'item-2'],
          isSelected: true,
        })
        
        expect(result).toEqual(['item-2'])
      })

      it('should return empty array when removing last item', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-1',
          modelValue: ['item-1'],
          isSelected: true,
        })
        
        expect(result).toEqual([])
      })

      it('should not mutate original array', () => {
        const original = ['item-1', 'item-2']
        const originalCopy = [...original]
        
        toggleSelectionModelValue({
          itemId: 'item-3',
          modelValue: original,
          isSelected: false,
        })
        
        expect(original).toEqual(originalCopy)
      })

      it('should preserve order of existing items when adding', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-3',
          modelValue: ['item-1', 'item-2'],
          isSelected: false,
        })
        
        expect(result).toEqual(['item-1', 'item-2', 'item-3'])
      })

      it('should preserve order when removing from middle', () => {
        const result = toggleSelectionModelValue({
          itemId: 'item-2',
          modelValue: ['item-1', 'item-2', 'item-3'],
          isSelected: true,
        })
        
        expect(result).toEqual(['item-1', 'item-3'])
      })
    })
  })

  describe('updateNestedChildSelections', () => {
    it('should add child ID when selecting', () => {
      const result = updateNestedChildSelections({
        current: [],
        childId: 'child-1',
        selected: true,
      })
      
      expect(result).toEqual(['child-1'])
    })

    it('should add child ID to existing selections', () => {
      const result = updateNestedChildSelections({
        current: ['child-1'],
        childId: 'child-2',
        selected: true,
      })
      
      expect(result).toEqual(['child-1', 'child-2'])
    })

    it('should remove child ID when deselecting', () => {
      const result = updateNestedChildSelections({
        current: ['child-1', 'child-2'],
        childId: 'child-1',
        selected: false,
      })
      
      expect(result).toEqual(['child-2'])
    })

    it('should return empty array when removing last item', () => {
      const result = updateNestedChildSelections({
        current: ['child-1'],
        childId: 'child-1',
        selected: false,
      })
      
      expect(result).toEqual([])
    })

    it('should not add duplicate when already selected', () => {
      const result = updateNestedChildSelections({
        current: ['child-1', 'child-2'],
        childId: 'child-1',
        selected: true,
      })
      
      expect(result).toEqual(['child-1', 'child-2'])
    })

    it('should handle removing non-existent child gracefully', () => {
      const result = updateNestedChildSelections({
        current: ['child-1', 'child-2'],
        childId: 'child-3',
        selected: false,
      })
      
      expect(result).toEqual(['child-1', 'child-2'])
    })

    it('should not mutate original array', () => {
      const original = ['child-1', 'child-2']
      const originalCopy = [...original]
      
      updateNestedChildSelections({
        current: original,
        childId: 'child-3',
        selected: true,
      })
      
      expect(original).toEqual(originalCopy)
    })

    it('should work with readonly array', () => {
      const original: readonly string[] = ['child-1', 'child-2']
      
      const result = updateNestedChildSelections({
        current: original,
        childId: 'child-3',
        selected: true,
      })
      
      expect(result).toEqual(['child-1', 'child-2', 'child-3'])
    })
  })

  describe('isNestedComponentsClick', () => {
    it('should return true when target is inside .nested-components', () => {
      // Create DOM structure
      const container = document.createElement('div')
      container.className = 'nested-components'
      const button = document.createElement('button')
      container.appendChild(button)
      
      expect(isNestedComponentsClick(button)).toBe(true)
    })

    it('should return true when target is the .nested-components element itself', () => {
      const element = document.createElement('div')
      element.className = 'nested-components'
      
      expect(isNestedComponentsClick(element)).toBe(true)
    })

    it('should return false when target is outside .nested-components', () => {
      const element = document.createElement('div')
      element.className = 'some-other-class'
      
      expect(isNestedComponentsClick(element)).toBe(false)
    })

    it('should return false for null target', () => {
      expect(isNestedComponentsClick(null)).toBe(false)
    })

    it('should return false for elements without .nested-components ancestor', () => {
      const parent = document.createElement('div')
      parent.className = 'card-container'
      const child = document.createElement('span')
      parent.appendChild(child)
      
      expect(isNestedComponentsClick(child)).toBe(false)
    })

    it('should work with deeply nested elements', () => {
      const container = document.createElement('div')
      container.className = 'nested-components'
      const level1 = document.createElement('div')
      const level2 = document.createElement('div')
      const target = document.createElement('button')
      
      container.appendChild(level1)
      level1.appendChild(level2)
      level2.appendChild(target)
      
      expect(isNestedComponentsClick(target)).toBe(true)
    })
  })
})
