/**
 * SELECTIONCARDCHILDREN TESTS
 * 
 * Unit tests for selectionCardChildren utility.
 * Tests child item functions for selection cards.
 * 
 * What it covers:
 * - getVisibleSelectionCardChildren: Get visible children items
 * - shouldSelectionCardExpand: Determine if card should expand
 * 
 * How it works:
 * - Tests each function with various config and item inputs
 * 
 * Dependencies:
 * - vitest for testing
 */

import { describe, it, expect, vi } from 'vitest'
import {
  getVisibleSelectionCardChildren,
  shouldSelectionCardExpand,
} from '../selectionCardChildren'
import type { SelectionCardConfig, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

// Helper to create mock item
function createItem(id: string, options: Partial<SelectionCardItem> = {}): SelectionCardItem {
  return {
    id,
    name: `Item ${id}`,
    description: 'Test item',
    ...options,
  } as SelectionCardItem
}

// Helper to create mock config
function createConfig(overrides: Partial<SelectionCardConfig> = {}): SelectionCardConfig {
  return {
    selectionType: 'radio',
    selectionComponent: 'VRadio',
    selectionGroup: 'none',
    stateSource: 'local',
    statePlugins: [],
    layout: 'row',
    controlPosition: 'bottom',
    gridColumns: { cols: '12' },
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

describe('selectionCardChildren', () => {
  describe('getVisibleSelectionCardChildren', () => {
    it('should return empty array when expansion not enabled', () => {
      const item = createItem('item-1')
      const config = createConfig({ expansion: { enabled: false } })
      
      const result = getVisibleSelectionCardChildren({ item, config })
      
      expect(result).toEqual([])
    })

    it('should return empty array when expansion is undefined', () => {
      const item = createItem('item-1')
      const config = createConfig()
      
      const result = getVisibleSelectionCardChildren({ item, config })
      
      expect(result).toEqual([])
    })

    it('should use componentData function when provided', () => {
      const componentData = vi.fn(() => ({
        composite: true,
        visibleComponents: [
          { id: 'comp-1', name: 'Component 1' },
          { id: 'comp-2', name: 'Component 2' },
        ],
      }))
      const item = createItem('item-1')
      const config = createConfig({
        expansion: {
          enabled: true,
          componentData,
        },
      })
      
      const result = getVisibleSelectionCardChildren({ item, config })
      
      expect(componentData).toHaveBeenCalledWith(item)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('comp-1')
    })

    it('should return empty array when componentData returns non-composite', () => {
      const componentData = vi.fn(() => ({
        composite: false,
        visibleComponents: [],
      }))
      const item = createItem('item-1')
      const config = createConfig({
        expansion: {
          enabled: true,
          componentData,
        },
      })
      
      const result = getVisibleSelectionCardChildren({ item, config })
      
      expect(result).toEqual([])
    })

    it('should filter active instanceComponents when no componentData', () => {
      const item = createItem('item-1', {
        instanceComponents: [
          { id: 'comp-1', name: 'Active', active: true },
          { id: 'comp-2', name: 'Inactive', active: false },
          { id: 'comp-3', name: 'Also Active', active: true },
        ],
      })
      const config = createConfig({
        expansion: { enabled: true },
      })
      
      const result = getVisibleSelectionCardChildren({ item, config })
      
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Active')
      expect(result[1].name).toBe('Also Active')
    })

    it('should return empty array when no instanceComponents', () => {
      const item = createItem('item-1')
      const config = createConfig({
        expansion: { enabled: true },
      })
      
      const result = getVisibleSelectionCardChildren({ item, config })
      
      expect(result).toEqual([])
    })
  })

  describe('shouldSelectionCardExpand', () => {
    it('should return false when expansion not enabled', () => {
      const item = createItem('item-1', { composite: true })
      const config = createConfig({ expansion: { enabled: false } })
      
      const result = shouldSelectionCardExpand({ item, config })
      
      expect(result).toBe(false)
    })

    it('should return false when item is not composite', () => {
      const item = createItem('item-1', { composite: false })
      const config = createConfig({
        expansion: { enabled: true },
      })
      
      const result = shouldSelectionCardExpand({ item, config })
      
      expect(result).toBe(false)
    })

    it('should return false when no visible children', () => {
      const item = createItem('item-1', { composite: true })
      const config = createConfig({
        expansion: { enabled: true },
      })
      
      const result = shouldSelectionCardExpand({ item, config })
      
      expect(result).toBe(false)
    })

    it('should return true when composite with visible children', () => {
      const item = createItem('item-1', {
        composite: true,
        instanceComponents: [
          { id: 'comp-1', name: 'Active', active: true },
        ],
      })
      const config = createConfig({
        expansion: { enabled: true },
      })
      
      const result = shouldSelectionCardExpand({ item, config })
      
      expect(result).toBe(true)
    })
  })
})
