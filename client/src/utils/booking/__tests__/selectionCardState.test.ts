/**
 * SELECTION CARD STATE TESTS
 * 
 * Unit tests for selectionCardState utility functions.
 * Tests state management helpers for selection cards.
 * 
 * What it covers:
 * - getFirstStatePlugin: Extract first plugin from array
 * - isSelectionCardItemSelected: Check if item is selected (modelValue)
 * - isSelectionCardItemSelectedByPlugin: Check selection via plugin
 * - getWatchSourceValue: Extract value from ref-like objects
 * 
 * How it works:
 * - Tests both array (multi-select) and string (single-select) modes
 * - Tests plugin getValue delegation
 * - Tests ref value extraction
 * 
 * What it validates:
 * - Correct selection detection for single and multi-select
 * - Plugin-based selection state
 * - Safe handling of null/undefined/empty inputs
 * 
 * Dependencies:
 * - vitest for testing
 * - SelectionCardItem, StatePlugin types
 */

import { describe, it, expect, vi } from 'vitest'
import {
  getFirstStatePlugin,
  isSelectionCardItemSelected,
  isSelectionCardItemSelectedByPlugin,
  getWatchSourceValue,
} from '../selectionCardState'
import type { StatePlugin, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

function createMockPlugin(id: string, getValue = vi.fn(() => false)): StatePlugin {
  return {
    id,
    getValue,
    setValue: vi.fn(),
  }
}

function createMockItem(id: string): SelectionCardItem {
  return {
    id,
    name: `Item ${id}`,
    description: 'Test item',
  } as SelectionCardItem
}

describe('selectionCardState', () => {
  describe('getFirstStatePlugin', () => {
    it('should return first plugin from array', () => {
      const plugin1 = createMockPlugin('plugin-1')
      const plugin2 = createMockPlugin('plugin-2')
      
      const result = getFirstStatePlugin([plugin1, plugin2])
      
      expect(result).toBe(plugin1)
    })

    it('should return null for empty array', () => {
      const result = getFirstStatePlugin([])
      
      expect(result).toBeNull()
    })

    it('should return null for undefined', () => {
      const result = getFirstStatePlugin(undefined)
      
      expect(result).toBeNull()
    })

    it('should return single plugin from single-element array', () => {
      const plugin = createMockPlugin('only-plugin')
      
      const result = getFirstStatePlugin([plugin])
      
      expect(result).toBe(plugin)
    })
  })

  describe('isSelectionCardItemSelected', () => {
    describe('single-select mode (string | null)', () => {
      it('should return true when item matches modelValue', () => {
        const result = isSelectionCardItemSelected({
          itemId: 'item-1',
          modelValue: 'item-1',
        })
        
        expect(result).toBe(true)
      })

      it('should return false when item does not match modelValue', () => {
        const result = isSelectionCardItemSelected({
          itemId: 'item-1',
          modelValue: 'item-2',
        })
        
        expect(result).toBe(false)
      })

      it('should return false when modelValue is null', () => {
        const result = isSelectionCardItemSelected({
          itemId: 'item-1',
          modelValue: null,
        })
        
        expect(result).toBe(false)
      })
    })

    describe('multi-select mode (string[])', () => {
      it('should return true when item is in array', () => {
        const result = isSelectionCardItemSelected({
          itemId: 'item-1',
          modelValue: ['item-1', 'item-2'],
        })
        
        expect(result).toBe(true)
      })

      it('should return false when item is not in array', () => {
        const result = isSelectionCardItemSelected({
          itemId: 'item-3',
          modelValue: ['item-1', 'item-2'],
        })
        
        expect(result).toBe(false)
      })

      it('should return false for empty array', () => {
        const result = isSelectionCardItemSelected({
          itemId: 'item-1',
          modelValue: [],
        })
        
        expect(result).toBe(false)
      })

      it('should return true for single-item array match', () => {
        const result = isSelectionCardItemSelected({
          itemId: 'only-item',
          modelValue: ['only-item'],
        })
        
        expect(result).toBe(true)
      })
    })
  })

  describe('isSelectionCardItemSelectedByPlugin', () => {
    it('should return true when plugin getValue returns true', () => {
      const plugin = createMockPlugin('test', vi.fn(() => true))
      const item = createMockItem('item-1')
      
      const result = isSelectionCardItemSelectedByPlugin({ plugin, item })
      
      expect(result).toBe(true)
      expect(plugin.getValue).toHaveBeenCalledWith(item)
    })

    it('should return false when plugin getValue returns false', () => {
      const plugin = createMockPlugin('test', vi.fn(() => false))
      const item = createMockItem('item-1')
      
      const result = isSelectionCardItemSelectedByPlugin({ plugin, item })
      
      expect(result).toBe(false)
    })

    it('should pass item to plugin getValue', () => {
      const mockGetValue = vi.fn(() => true)
      const plugin = createMockPlugin('test', mockGetValue)
      const item = createMockItem('specific-item')
      
      isSelectionCardItemSelectedByPlugin({ plugin, item })
      
      expect(mockGetValue).toHaveBeenCalledWith(item)
    })
  })

  describe('getWatchSourceValue', () => {
    it('should extract value from ref-like object', () => {
      const refLike = { value: 'extracted-value' }
      
      const result = getWatchSourceValue(refLike)
      
      expect(result).toBe('extracted-value')
    })

    it('should return undefined for null', () => {
      const result = getWatchSourceValue(null)
      
      expect(result).toBeUndefined()
    })

    it('should return undefined for undefined', () => {
      const result = getWatchSourceValue(undefined)
      
      expect(result).toBeUndefined()
    })

    it('should return undefined for object without value property', () => {
      const result = getWatchSourceValue({ other: 'property' })
      
      expect(result).toBeUndefined()
    })

    it('should return undefined for primitive values', () => {
      expect(getWatchSourceValue('string')).toBeUndefined()
      expect(getWatchSourceValue(123)).toBeUndefined()
      expect(getWatchSourceValue(true)).toBeUndefined()
    })

    it('should handle nested value correctly', () => {
      const refLike = { value: { nested: 'data' } }
      
      const result = getWatchSourceValue(refLike)
      
      expect(result).toEqual({ nested: 'data' })
    })

    it('should handle null value property', () => {
      const refLike = { value: null }
      
      const result = getWatchSourceValue(refLike)
      
      expect(result).toBeNull()
    })

    it('should handle array value property', () => {
      const refLike = { value: [1, 2, 3] }
      
      const result = getWatchSourceValue(refLike)
      
      expect(result).toEqual([1, 2, 3])
    })
  })
})
