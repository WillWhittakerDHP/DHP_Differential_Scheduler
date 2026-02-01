/**
 * SELECTION CARD ITEM DISPLAY TESTS
 * 
 * Unit tests for selectionCardItemDisplay utility functions.
 * Tests icon mapping and description transformation for booking instances.
 * 
 * What it covers:
 * - mapSelectionCardItemsWithIconAndDescription: Transforms instances with icons and descriptions
 * 
 * How it works:
 * - Mocks getIcon function to test icon mapping
 * - Tests description transformation with custom getFilteredDescription
 * - Tests with various input configurations
 * 
 * What it validates:
 * - Icons are mapped using getIcon utility
 * - Descriptions are transformed using provided function
 * - All other properties are preserved
 * - Empty arrays are handled
 * 
 * Dependencies:
 * - vitest for testing and mocking
 * - BookingBlockInstance types
 * - iconMapper (mocked)
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/iconMapper', () => ({
  getIcon: vi.fn((icon: string | null | undefined) => icon ? `mapped-${icon}` : 'default-icon')
}))

import { mapSelectionCardItemsWithIconAndDescription } from '../selectionCardItemDisplay'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

function createInstance(
  id: string,
  options: {
    icon?: string
    description?: string
    name?: string
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Instance ${id}`,
    description: options.description || 'Default description',
    icon: options.icon || 'home',
    baseSqFt: 1000,
    active: true,
    bookingMode: 'standalone',
    differential: false,
    orderIndex: 0,
    blockShape: 'Test Shape',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

describe('selectionCardItemDisplay', () => {
  describe('mapSelectionCardItemsWithIconAndDescription', () => {
    it('should map icons using getIcon utility', () => {
      const items = [
        createInstance('i1', { icon: 'custom-icon' }),
      ]
      
      const result = mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: (item) => item.description || '',
        userTypeBlockNameForDescription: null,
      })
      
      expect(result[0].icon).toBe('mapped-custom-icon')
    })

    it('should transform descriptions using provided function', () => {
      const items = [
        createInstance('i1', { description: 'Original' }),
      ]
      
      const result = mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: () => 'Transformed description',
        userTypeBlockNameForDescription: 'buyer',
      })
      
      expect(result[0].description).toBe('Transformed description')
    })

    it('should pass userTypeBlockName to getFilteredDescription', () => {
      const items = [createInstance('i1')]
      const mockGetDescription = vi.fn(() => 'description')
      
      mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: mockGetDescription,
        userTypeBlockNameForDescription: 'seller',
      })
      
      expect(mockGetDescription).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'i1' }),
        'seller'
      )
    })

    it('should preserve all other properties', () => {
      const items = [
        createInstance('i1', { name: 'Test Instance' }),
      ]
      
      const result = mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: () => 'Transformed',
        userTypeBlockNameForDescription: null,
      })
      
      expect(result[0].id).toBe('i1')
      expect(result[0].name).toBe('Test Instance')
      expect(result[0].baseSqFt).toBe(1000)
      expect(result[0].active).toBe(true)
    })

    it('should handle empty items array', () => {
      const result = mapSelectionCardItemsWithIconAndDescription({
        items: [],
        getFilteredDescription: () => 'description',
        userTypeBlockNameForDescription: null,
      })
      
      expect(result).toEqual([])
    })

    it('should handle multiple items', () => {
      const items = [
        createInstance('i1', { icon: 'icon1' }),
        createInstance('i2', { icon: 'icon2' }),
        createInstance('i3', { icon: 'icon3' }),
      ]
      
      const result = mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: (item) => `desc-${item.id}`,
        userTypeBlockNameForDescription: null,
      })
      
      expect(result).toHaveLength(3)
      expect(result[0].icon).toBe('mapped-icon1')
      expect(result[1].icon).toBe('mapped-icon2')
      expect(result[2].icon).toBe('mapped-icon3')
      expect(result[0].description).toBe('desc-i1')
      expect(result[1].description).toBe('desc-i2')
      expect(result[2].description).toBe('desc-i3')
    })

    it('should not mutate original items', () => {
      const original = createInstance('i1', { icon: 'original', description: 'original' })
      const items = [original]
      
      mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: () => 'modified',
        userTypeBlockNameForDescription: null,
      })
      
      expect(original.icon).toBe('original')
      expect(original.description).toBe('original')
    })

    it('should work with readonly items array', () => {
      const items: readonly BookingBlockInstance[] = [
        createInstance('i1'),
      ]
      
      const result = mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: () => 'description',
        userTypeBlockNameForDescription: null,
      })
      
      expect(result).toHaveLength(1)
    })

    it('should handle null userTypeBlockNameForDescription', () => {
      const items = [createInstance('i1')]
      const mockGetDescription = vi.fn(() => 'description')
      
      mapSelectionCardItemsWithIconAndDescription({
        items,
        getFilteredDescription: mockGetDescription,
        userTypeBlockNameForDescription: null,
      })
      
      expect(mockGetDescription).toHaveBeenCalledWith(
        expect.anything(),
        null
      )
    })
  })
})
