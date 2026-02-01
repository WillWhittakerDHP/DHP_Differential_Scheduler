
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { usePropertyTypeBlockConfig } from '../usePropertyTypeBlockConfig'
import type { SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

describe('usePropertyTypeBlockConfig', () => {
  describe('rowSelectionConfig', () => {
    it('should return config with radio selection type', () => {
      const selectedPropertyTypeBlocks = ref<unknown[]>([])
      
      const { rowSelectionConfig } = usePropertyTypeBlockConfig({
        selectedPropertyTypeBlocks,
        propertyTypeBlocksStatePlugin: null,
      })
      
      expect(rowSelectionConfig.value.selectionType).toBe('radio')
      expect(rowSelectionConfig.value.selectionComponent).toBe('VRadio')
    })

    it('should return config with row layout', () => {
      const selectedPropertyTypeBlocks = ref<unknown[]>([])
      
      const { rowSelectionConfig } = usePropertyTypeBlockConfig({
        selectedPropertyTypeBlocks,
        propertyTypeBlocksStatePlugin: null,
      })
      
      expect(rowSelectionConfig.value.layout).toBe('row')
    })

    it('should have expansion enabled', () => {
      const selectedPropertyTypeBlocks = ref<unknown[]>([])
      
      const { rowSelectionConfig } = usePropertyTypeBlockConfig({
        selectedPropertyTypeBlocks,
        propertyTypeBlocksStatePlugin: null,
      })
      
      expect(rowSelectionConfig.value.expansion.enabled).toBe(true)
    })

    it('should use local stateSource when no plugin provided', () => {
      const selectedPropertyTypeBlocks = ref<unknown[]>([])
      
      const { rowSelectionConfig } = usePropertyTypeBlockConfig({
        selectedPropertyTypeBlocks,
        propertyTypeBlocksStatePlugin: null,
      })
      
      expect(rowSelectionConfig.value.stateSource).toBe('local')
    })

    it('should use wizard stateSource when plugin provided', () => {
      const selectedPropertyTypeBlocks = ref<unknown[]>([])
      const mockPlugin = { id: 'test-plugin' }
      
      const { rowSelectionConfig } = usePropertyTypeBlockConfig({
        selectedPropertyTypeBlocks,
        propertyTypeBlocksStatePlugin: mockPlugin,
      })
      
      expect(rowSelectionConfig.value.stateSource).toBe('wizard')
      expect(rowSelectionConfig.value.statePlugins).toContain(mockPlugin)
    })
  })

  describe('expansion componentData', () => {
    it('should return null for non-composite items', () => {
      const selectedPropertyTypeBlocks = ref<unknown[]>([])
      
      const { rowSelectionConfig } = usePropertyTypeBlockConfig({
        selectedPropertyTypeBlocks,
        propertyTypeBlocksStatePlugin: null,
      })
      
      const item: SelectionCardItem = {
        id: 'item-1',
        name: 'Simple Item',
        composite: false,
      }
      
      const result = rowSelectionConfig.value.expansion.componentData(item)
      expect(result).toBeNull()
    })

    it('should return filtered components for composite items', () => {
      const selectedPropertyTypeBlocks = ref<unknown[]>([])
      
      const { rowSelectionConfig } = usePropertyTypeBlockConfig({
        selectedPropertyTypeBlocks,
        propertyTypeBlocksStatePlugin: null,
      })
      
      const item: SelectionCardItem = {
        id: 'item-1',
        name: 'Composite Item',
        composite: true,
        instanceComponents: [
          { id: 'comp-1', name: 'Active Comp', active: true },
          { id: 'comp-2', name: 'Inactive Comp', active: false },
          { id: 'comp-3', name: 'Another Active', active: true },
        ],
      }
      
      const result = rowSelectionConfig.value.expansion.componentData(item)
      
      expect(result).not.toBeNull()
      expect(result?.composite).toBe(true)
      expect(result?.visibleComponents).toHaveLength(2)
      expect(result?.visibleComponents[0].name).toBe('Active Comp')
      expect(result?.visibleComponents[1].name).toBe('Another Active')
    })
  })
})
