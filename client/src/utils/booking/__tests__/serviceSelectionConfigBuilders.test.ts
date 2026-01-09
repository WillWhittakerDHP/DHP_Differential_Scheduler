/**
 * SERVICESELECTIONCONFIGBUILDERS TESTS
 * 
 * Unit tests for serviceSelectionConfigBuilders utility.
 * Tests config builder functions for service selection.
 * 
 * What it covers:
 * - buildUserTypeBlockRowSelectionConfig: Build row selection config
 * - buildServicesStackSelectionConfig: Build stack selection config
 * 
 * How it works:
 * - Tests config structure with and without state plugin
 * - Tests expansion componentData function
 * 
 * Dependencies:
 * - vitest for testing
 */

import { describe, it, expect } from 'vitest'
import {
  buildUserTypeBlockRowSelectionConfig,
  buildServicesStackSelectionConfig,
} from '../serviceSelectionConfigBuilders'
import type { StatePlugin, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

// Mock state plugin
function createMockStatePlugin(): StatePlugin {
  return {
    id: 'test-plugin',
    getValue: () => false,
    setValue: () => {},
  }
}

describe('serviceSelectionConfigBuilders', () => {
  describe('buildUserTypeBlockRowSelectionConfig', () => {
    it('should return config with radio selection type', () => {
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: null })
      
      expect(result.selectionType).toBe('radio')
      expect(result.selectionComponent).toBe('VRadio')
    })

    it('should return config with row layout', () => {
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: null })
      
      expect(result.layout).toBe('row')
    })

    it('should have expansion enabled', () => {
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: null })
      
      expect(result.expansion?.enabled).toBe(true)
    })

    it('should use local stateSource when no plugin provided', () => {
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: null })
      
      expect(result.stateSource).toBe('local')
      expect(result.statePlugins).toBeUndefined()
    })

    it('should use wizard stateSource when plugin provided', () => {
      const plugin = createMockStatePlugin()
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: plugin })
      
      expect(result.stateSource).toBe('wizard')
      expect(result.statePlugins).toContain(plugin)
    })

    it('should have componentData function in expansion', () => {
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: null })
      
      expect(typeof result.expansion?.componentData).toBe('function')
    })

    it('componentData should return visible components for composite items', () => {
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: null })
      const item: SelectionCardItem = {
        id: 'item-1',
        name: 'Test Item',
        composite: true,
        instanceComponents: [
          { id: 'comp-1', name: 'Active', active: true },
          { id: 'comp-2', name: 'Inactive', active: false },
        ],
      }
      
      const componentData = result.expansion?.componentData?.(item)
      
      expect(componentData?.composite).toBe(true)
      expect(componentData?.visibleComponents).toHaveLength(1)
      expect(componentData?.visibleComponents?.[0].name).toBe('Active')
    })

    it('componentData should return null for non-composite items', () => {
      const result = buildUserTypeBlockRowSelectionConfig({ statePlugin: null })
      const item: SelectionCardItem = {
        id: 'item-1',
        name: 'Test Item',
        composite: false,
      }
      
      const componentData = result.expansion?.componentData?.(item)
      
      expect(componentData).toBeNull()
    })
  })

  describe('buildServicesStackSelectionConfig', () => {
    it('should return config with radio selection type', () => {
      const result = buildServicesStackSelectionConfig({ statePlugin: null })
      
      expect(result.selectionType).toBe('radio')
      expect(result.selectionComponent).toBe('VRadio')
    })

    it('should return config with stack layout', () => {
      const result = buildServicesStackSelectionConfig({ statePlugin: null })
      
      expect(result.layout).toBe('stack')
    })

    it('should have left control position', () => {
      const result = buildServicesStackSelectionConfig({ statePlugin: null })
      
      expect(result.controlPosition).toBe('left')
    })

    it('should use local stateSource when no plugin provided', () => {
      const result = buildServicesStackSelectionConfig({ statePlugin: null })
      
      expect(result.stateSource).toBe('local')
      expect(result.statePlugins).toBeUndefined()
    })

    it('should use wizard stateSource when plugin provided', () => {
      const plugin = createMockStatePlugin()
      const result = buildServicesStackSelectionConfig({ statePlugin: plugin })
      
      expect(result.stateSource).toBe('wizard')
      expect(result.statePlugins).toContain(plugin)
    })
  })
})
