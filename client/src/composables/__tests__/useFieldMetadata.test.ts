/**
 * USE FIELD METADATA TESTS
 * 
 * Unit tests for getFieldMetadata helper function.
 * Tests metadata extraction, caching, and field type derivation.
 * Phase 7: Form Field Composables
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getFieldMetadata, clearMetadataCache } from '../useFieldMetadata'
import { useAdminConfig } from '../useAdminConfig'
import { RelationshipSelectModeEnum, PrimitiveModeEnum, PrimitiveTypeEnum } from '@/types/entity/formDataEnums'

// Mock useAdminConfig
const mockAdminConfig = {
  getFormFieldConfig: vi.fn(() => ({
    value: null,
  })),
  getDisplayFieldConfig: vi.fn(() => ({
    value: null,
  })),
}

vi.mock('../useAdminConfig', () => ({
  useAdminConfig: vi.fn(() => mockAdminConfig),
}))

describe('getFieldMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear the metadata cache to ensure fresh mock data is used each test
    clearMetadataCache()
  })

  describe('field type derivation', () => {
    it('should derive multiselect from relationship select', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          relationshipSelect: {
            selectMode: RelationshipSelectModeEnum.Multiple,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          relationshipDisplay: {
            label: 'Test Field',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'activeParts')
      
      expect(metadata.fieldType).toBe('multiselect')
    })

    it('should derive select from single relationship select', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          relationshipSelect: {
            selectMode: RelationshipSelectModeEnum.Single,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          relationshipDisplay: {
            label: 'Test Field',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'blockShapeRef')
      
      expect(metadata.fieldType).toBe('select')
    })

    it('should derive text from primitive input', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
            primitiveType: PrimitiveTypeEnum.String,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Test Field',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata.fieldType).toBe('text')
    })

    it('should derive number from number primitive', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Number,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Test Field',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'baseSqFt')
      
      expect(metadata.fieldType).toBe('number')
    })

    it('should derive boolean from checkbox primitive', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Checkbox,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Test Field',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'active')
      
      expect(metadata.fieldType).toBe('boolean')
    })

    it('should derive textarea from textarea primitive', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.TextArea,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Test Field',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'description')
      
      expect(metadata.fieldType).toBe('textarea')
    })

    it('should derive date from date primitive', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
            primitiveType: PrimitiveTypeEnum.Date,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Test Field',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'createdAt')
      
      expect(metadata.fieldType).toBe('date')
    })

    it('should default to text when no config', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: null,
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: null,
      })
      
      const metadata = getFieldMetadata('blockInstance', 'unknownField')
      
      expect(metadata.fieldType).toBe('text')
    })
  })

  describe('display properties', () => {
    it('should extract label from display config', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Custom Label',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata.label).toBe('Custom Label')
    })

    it('should use field key as default label', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: null,
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: null,
      })
      
      const metadata = getFieldMetadata('blockInstance', 'customField')
      
      expect(metadata.label).toBe('customField')
    })

    it('should extract placeholder from display config', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            placeholder: 'Enter name',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata.placeholder).toBe('Enter name')
    })

    it('should generate default placeholder', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: null,
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: null,
      })
      
      const metadata = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata.placeholder).toBe('Enter name')
    })

    it('should extract helpText from display config', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            helpText: 'This is helpful text',
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata.helpText).toBe('This is helpful text')
    })

    it('should extract required from display config', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            required: true,
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata.required).toBe(true)
    })

    it('should extract disabled from display config', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            disabled: true,
          },
        },
      })
      
      const metadata = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata.disabled).toBe(true)
    })
  })

  describe('caching', () => {
    it('should cache metadata results', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Cached Label',
          },
        },
      })
      
      const metadata1 = getFieldMetadata('blockInstance', 'name')
      const metadata2 = getFieldMetadata('blockInstance', 'name')
      
      expect(metadata1).toBe(metadata2)
      expect(mockAdminConfig.getFormFieldConfig).toHaveBeenCalledTimes(1)
    })

    it('should cache separately for different fields', () => {
      mockAdminConfig.getFormFieldConfig.mockReturnValue({
        value: {
          primitiveInput: {
            primitiveMode: PrimitiveModeEnum.Input,
          },
        },
      })
      
      mockAdminConfig.getDisplayFieldConfig.mockReturnValue({
        value: {
          primitiveDisplay: {
            label: 'Test Label',
          },
        },
      })
      
      const metadata1 = getFieldMetadata('blockInstance', 'name')
      const metadata2 = getFieldMetadata('blockInstance', 'description')
      
      expect(metadata1).not.toBe(metadata2)
      expect(mockAdminConfig.getFormFieldConfig).toHaveBeenCalledTimes(2)
    })
  })
})






