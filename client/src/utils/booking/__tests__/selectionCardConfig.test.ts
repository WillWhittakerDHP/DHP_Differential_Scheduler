/**
 * SELECTION CARD CONFIG TESTS
 * 
 * Unit tests for selectionCardConfig utility functions.
 * Tests config merging with default values.
 * 
 * What it covers:
 * - DEFAULT_SELECTION_CARD_CONFIG: Default configuration values
 * - mergeSelectionCardConfigWithDefaults: Merging user config with defaults
 * 
 * How it works:
 * - Tests default values are applied when no config provided
 * - Tests partial config merging preserves user values
 * - Tests edge cases (null, undefined, invalid input)
 * 
 * What it validates:
 * - Default config has all expected properties
 * - Merge function preserves user-provided values
 * - Missing values are filled from defaults
 * - Invalid input returns full defaults
 * 
 * Dependencies:
 * - vitest for testing
 * - SelectionCardConfig type
 */

import { describe, it, expect } from 'vitest'
import {
  DEFAULT_SELECTION_CARD_CONFIG,
  mergeSelectionCardConfigWithDefaults,
} from '../selectionCardConfig'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

describe('selectionCardConfig', () => {
  describe('DEFAULT_SELECTION_CARD_CONFIG', () => {
    it('should have selectionType as radio', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.selectionType).toBe('radio')
    })

    it('should have selectionComponent as VRadio', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.selectionComponent).toBe('VRadio')
    })

    it('should have selectionGroup as VRadioGroup', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.selectionGroup).toBe('VRadioGroup')
    })

    it('should have stateSource as local', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.stateSource).toBe('local')
    })

    it('should have empty statePlugins array', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.statePlugins).toEqual([])
    })

    it('should have layout as row', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.layout).toBe('row')
    })

    it('should have controlPosition as bottom', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.controlPosition).toBe('bottom')
    })

    it('should have gridColumns defined', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.gridColumns).toEqual({
        cols: '12',
        sm: '6',
        md: '4',
      })
    })

    it('should have appearance settings', () => {
      expect(DEFAULT_SELECTION_CARD_CONFIG.appearance).toEqual({
        showIcon: true,
        showDescription: true,
        showBorder: true,
        cardPadding: 'pa-6',
        minHeight: 'auto',
      })
    })
  })

  describe('mergeSelectionCardConfigWithDefaults', () => {
    it('should return defaults when config is undefined', () => {
      const result = mergeSelectionCardConfigWithDefaults(undefined)
      
      expect(result).toEqual(DEFAULT_SELECTION_CARD_CONFIG)
    })

    it('should return defaults when config is null', () => {
      const result = mergeSelectionCardConfigWithDefaults(null as unknown as SelectionCardConfig)
      
      expect(result).toEqual(DEFAULT_SELECTION_CARD_CONFIG)
    })

    it('should return defaults when config is not an object', () => {
      const result = mergeSelectionCardConfigWithDefaults('invalid' as unknown as SelectionCardConfig)
      
      expect(result).toEqual(DEFAULT_SELECTION_CARD_CONFIG)
    })

    it('should return defaults when config is an array', () => {
      const result = mergeSelectionCardConfigWithDefaults([] as unknown as SelectionCardConfig)
      
      expect(result).toEqual(DEFAULT_SELECTION_CARD_CONFIG)
    })

    it('should preserve user selectionType', () => {
      const userConfig: SelectionCardConfig = {
        selectionType: 'checkbox',
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.selectionType).toBe('checkbox')
    })

    it('should preserve user selectionComponent', () => {
      const userConfig: SelectionCardConfig = {
        selectionComponent: 'VCheckbox',
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.selectionComponent).toBe('VCheckbox')
    })

    it('should preserve user stateSource', () => {
      const userConfig: SelectionCardConfig = {
        stateSource: 'plugin',
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.stateSource).toBe('plugin')
    })

    it('should preserve user statePlugins', () => {
      const mockPlugins = [{ id: 'test', setValue: () => {} }]
      const userConfig: SelectionCardConfig = {
        statePlugins: mockPlugins,
      } as unknown as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.statePlugins).toBe(mockPlugins)
    })

    it('should use empty array for statePlugins when not provided', () => {
      const userConfig: SelectionCardConfig = {
        selectionType: 'radio',
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.statePlugins).toEqual([])
    })

    it('should preserve user layout', () => {
      const userConfig: SelectionCardConfig = {
        layout: 'column',
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.layout).toBe('column')
    })

    it('should preserve user controlPosition', () => {
      const userConfig: SelectionCardConfig = {
        controlPosition: 'top',
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.controlPosition).toBe('top')
    })

    it('should preserve user gridColumns', () => {
      const userConfig: SelectionCardConfig = {
        gridColumns: { cols: '6', sm: '4', md: '3' },
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.gridColumns).toEqual({ cols: '6', sm: '4', md: '3' })
    })

    it('should preserve user appearance', () => {
      const userAppearance = {
        showIcon: false,
        showDescription: false,
        showBorder: false,
        cardPadding: 'pa-2',
        minHeight: '100px',
      }
      const userConfig: SelectionCardConfig = {
        appearance: userAppearance,
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.appearance).toEqual(userAppearance)
    })

    it('should preserve user expansion config', () => {
      const userConfig: SelectionCardConfig = {
        expansion: { enabled: true, expandedByDefault: false },
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.expansion).toEqual({ enabled: true, expandedByDefault: false })
    })

    it('should fill missing values from defaults', () => {
      const userConfig: SelectionCardConfig = {
        selectionType: 'checkbox',
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.selectionType).toBe('checkbox') // User value
      expect(result.selectionComponent).toBe('VRadio') // Default
      expect(result.stateSource).toBe('local') // Default
      expect(result.layout).toBe('row') // Default
    })

    it('should handle partial config merge', () => {
      const userConfig: SelectionCardConfig = {
        selectionType: 'checkbox',
        layout: 'column',
        appearance: {
          showIcon: false,
          showDescription: true,
          showBorder: true,
          cardPadding: 'pa-4',
          minHeight: '50px',
        },
      } as SelectionCardConfig
      
      const result = mergeSelectionCardConfigWithDefaults(userConfig)
      
      expect(result.selectionType).toBe('checkbox')
      expect(result.layout).toBe('column')
      expect(result.appearance.showIcon).toBe(false)
      expect(result.selectionGroup).toBe('VRadioGroup')
      expect(result.controlPosition).toBe('bottom')
    })
  })
})
