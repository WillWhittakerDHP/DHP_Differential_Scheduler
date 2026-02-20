
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useFieldContext } from '../fieldContext/useFieldContext'
import { useAdmin } from '../useAdmin'
import { usePrimitiveMutation } from '../entityCrud/usePrimitiveMutation'
import { useQueryClient } from '@tanstack/vue-query'
import apiClient from '@/utils/api'

const { mockUseField, mockUseForm } = vi.hoisted(() => ({
  mockUseField: vi.fn(() => ({
    value: ref('initial'),
    errorMessage: ref(undefined),
    meta: {
      valid: true,
      dirty: false,
    },
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    validate: vi.fn().mockResolvedValue(true),
  })),
  mockUseForm: vi.fn(() => ({
    values: {},
  })),
}))

vi.mock('../useAdmin', () => ({
  useAdmin: vi.fn(() => ({
    getEntity: vi.fn(() => ({ id: 'block-1', name: 'Test Block' })),
    getEntities: vi.fn(() => [{ id: 'block-1', name: 'Test Block' }]),
  })),
}))

vi.mock('../useEntity', () => ({
  usePrimitiveMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}))

vi.mock('../useComponentEntity', () => ({
  useComponentEntity: vi.fn(() => ({
    getComponents: vi.fn(() => []),
    addToComponent: vi.fn(),
    removeFromComponent: vi.fn(),
  })),
}))

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  getEntityByIdEndpoint: vi.fn((key, id) => `/api/entities/${key}/${id}`),
  getRelationshipEndpoint: vi.fn((key) => `/api/relationships/${key}`),
  getRelationshipByParentChildEndpoint: vi.fn((key, parentId, childId) => 
    `/api/relationships/${key}/${parentId}/${childId}`
  ),
}))

// Mock Vee-Validate (uses hoisted mockUseField and mockUseForm)
vi.mock('vee-validate', () => ({
  useField: mockUseField,
  useForm: mockUseForm,
}))

describe('useFieldContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockUseField.mockReturnValue({
      value: ref('initial'),
      errorMessage: ref(undefined),
      meta: {
        valid: true,
        dirty: false,
      },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      validate: vi.fn().mockResolvedValue(true),
    })
  })

  describe('field state', () => {
    it('should provide field key, entity key, and entity ID', () => {
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      expect(context.fieldKey).toBe('name')
      expect(context.entityKey).toBe('blockInstance')
      expect(context.entityId).toBe('block-1')
    })

    it('should provide reactive value ref', () => {
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      expect(context.value).toBeDefined()
      expect(context.value.value).toBe('initial')
    })

    it('should provide error state', () => {
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref('Error message'),
        meta: { valid: false, dirty: true },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: vi.fn(),
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      expect(context.error.value).toBe('Error message')
      expect(context.isValid.value).toBe(false)
    })

    it('should provide dirty state', () => {
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: true },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: vi.fn(),
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      expect(context.isDirty.value).toBe(true)
    })
  })

  describe('display config', () => {
    it('should provide display configuration', () => {
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      expect(context.displayConfig).toBeDefined()
      // and falls back to simple defaults (no legacy config lookup).
      expect(context.displayConfig.label).toBe('name')
      expect(context.displayConfig.placeholder).toBe('Enter name')
    })

    it('should merge provided display config overrides', () => {
      const context = useFieldContext('name', 'blockInstance', 'block-1', {
        displayConfig: {
          label: 'Custom Label',
        },
      })
      
      expect(context.displayConfig.label).toBe('Custom Label')
    })
  })

  describe('validation', () => {
    it('should validate field', async () => {
      const mockValidate = vi.fn().mockResolvedValue(true)
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: false },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: mockValidate,
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      const result = await context.validate()
      
      expect(result).toBe(true)
      expect(mockValidate).toHaveBeenCalled()
    })

    it('should set isValidating during validation', async () => {
      const mockValidate = vi.fn(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: false },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: mockValidate,
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      const validatePromise = context.validate()
      
      expect(context.isValidating.value).toBe(true)
      
      await validatePromise
      
      expect(context.isValidating.value).toBe(false)
    })
  })

  describe('focus management', () => {
    it('should manage focus state', () => {
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      expect(context.isFocused.value).toBe(false)
      
      context.setFocus(true)
      
      expect(context.isFocused.value).toBe(true)
    })
  })

  describe('value operations', () => {
    it('should get current value', () => {
      mockUseField.mockReturnValue({
        value: ref('test value'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: false },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: vi.fn(),
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      expect(context.getValue()).toBe('test value')
    })

    it('should set value', () => {
      const mockHandleChange = vi.fn()
      mockUseField.mockReturnValue({
        value: ref('initial'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: false },
        handleChange: mockHandleChange,
        handleBlur: vi.fn(),
        validate: vi.fn(),
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      context.setValue('new value')
      
      expect(mockHandleChange).toHaveBeenCalledWith('new value')
    })
  })

  describe('reset', () => {
    it('should reset field to entity value', () => {
      const mockHandleChange = vi.fn()
      mockUseField.mockReturnValue({
        value: ref('modified'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: true },
        handleChange: mockHandleChange,
        handleBlur: vi.fn(),
        validate: vi.fn(),
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      context.reset()
      
      expect(mockHandleChange).toHaveBeenCalled()
    })
  })

  describe('save operation', () => {
    it('should skip save for temp entities', async () => {
      const mockMutateAsync = vi.fn()
      vi.mocked(usePrimitiveMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any)
      
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: true },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
      })
      
      const context = useFieldContext('name', 'blockInstance', 'new-123')
      
      await context.save()
      
      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should skip save when field is not dirty', async () => {
      const mockMutateAsync = vi.fn()
      vi.mocked(usePrimitiveMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any)
      
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: false },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
      })
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: { id: 'block-1' } })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      await context.save()
      
      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should save field when dirty and valid', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      vi.mocked(usePrimitiveMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any)
      
      mockUseField.mockReturnValue({
        value: ref('new value'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: true },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
      })
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: { id: 'block-1' } })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      await context.save()
      
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    it('should handle save errors', async () => {
      const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Save failed'))
      vi.mocked(usePrimitiveMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any)
      
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref(undefined),
        meta: { valid: true, dirty: true },
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
      })
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: { id: 'block-1' } })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      await expect(context.save()).rejects.toThrow('Save failed')
    })
  })

  describe('clearError', () => {
    it('should clear field error', () => {
      const mockHandleChange = vi.fn()
      mockUseField.mockReturnValue({
        value: ref('test'),
        errorMessage: ref('Error'),
        meta: { valid: false, dirty: true },
        handleChange: mockHandleChange,
        handleBlur: vi.fn(),
        validate: vi.fn(),
      })
      
      const context = useFieldContext('name', 'blockInstance', 'block-1')
      
      context.clearError()
      
      expect(mockHandleChange).toHaveBeenCalled()
    })
  })
})


