/**
 * USE FIELD VALUE TESTS
 * 
 * Unit tests for useFieldValue composable.
 * Tests unified field value access with Ref unwrapping handling.
 * Phase 7: Form Field Composables
 */

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useFieldValue } from '../useFieldValue'
import type { FieldContextType } from '../useFieldContext'
import type { ValidAdminValue } from '@/constants/primitives'

describe('useFieldValue', () => {
  describe('value access', () => {
    it('should return value from Ref', () => {
      const fieldContext: FieldContextType<'blockInstance', 'name'> = {
        fieldKey: 'name',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: ref('test value'),
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Name',
          placeholder: 'Enter name',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => 'test value'),
        setValue: vi.fn(),
      }
      
      const valueRef = useFieldValue(fieldContext)
      
      expect(valueRef.value).toBe('test value')
    })

    it('should handle unwrapped value (when Vue unwraps Ref)', () => {
      const fieldContext: FieldContextType<'blockInstance', 'name'> = {
        fieldKey: 'name',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: 'unwrapped value' as any, // Simulate Vue unwrapping
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Name',
          placeholder: 'Enter name',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => 'unwrapped value'),
        setValue: vi.fn(),
      }
      
      const valueRef = useFieldValue(fieldContext)
      
      expect(valueRef.value).toBe('unwrapped value')
    })

    it('should return empty string for undefined value', () => {
      const fieldContext: FieldContextType<'blockInstance', 'name'> = {
        fieldKey: 'name',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: ref(undefined as any),
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Name',
          placeholder: 'Enter name',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => ''),
        setValue: vi.fn(),
      }
      
      const valueRef = useFieldValue(fieldContext)
      
      expect(valueRef.value).toBe('')
    })

    it('should return empty string for null value', () => {
      const fieldContext: FieldContextType<'blockInstance', 'name'> = {
        fieldKey: 'name',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: ref(null as any),
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Name',
          placeholder: 'Enter name',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => ''),
        setValue: vi.fn(),
      }
      
      const valueRef = useFieldValue(fieldContext)
      
      expect(valueRef.value).toBe('')
    })

    it('should handle number values', () => {
      const fieldContext: FieldContextType<'blockInstance', 'baseSqFt'> = {
        fieldKey: 'baseSqFt',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: ref(1500),
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Base Sq Ft',
          placeholder: 'Enter square footage',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => 1500),
        setValue: vi.fn(),
      }
      
      const valueRef = useFieldValue(fieldContext)
      
      expect(valueRef.value).toBe(1500)
    })

    it('should handle boolean values', () => {
      const fieldContext: FieldContextType<'blockInstance', 'active'> = {
        fieldKey: 'active',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: ref(true),
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Active',
          placeholder: '',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => true),
        setValue: vi.fn(),
      }
      
      const valueRef = useFieldValue(fieldContext)
      
      expect(valueRef.value).toBe(true)
    })

    it('should handle array values', () => {
      const fieldContext: FieldContextType<'blockInstance', 'activeParts'> = {
        fieldKey: 'activeParts',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: ref(['part-1', 'part-2']),
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Active Parts',
          placeholder: '',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => ['part-1', 'part-2']),
        setValue: vi.fn(),
      }
      
      const valueRef = useFieldValue(fieldContext)
      
      expect(valueRef.value).toEqual(['part-1', 'part-2'])
    })

    it('should be reactive to value changes', () => {
      const valueRef = ref('initial')
      const fieldContext: FieldContextType<'blockInstance', 'name'> = {
        fieldKey: 'name',
        entityKey: 'blockInstance',
        entityId: 'block-1',
        value: valueRef,
        error: ref(undefined),
        isValidating: ref(false),
        isDirty: ref(false),
        isValid: ref(true),
        isDisabled: ref(false),
        isFocused: ref(false),
        displayConfig: {
          label: 'Name',
          placeholder: 'Enter name',
        },
        validationRules: {},
        setFocus: vi.fn(),
        validate: vi.fn().mockResolvedValue(true),
        clearError: vi.fn(),
        save: vi.fn().mockResolvedValue(undefined),
        reset: vi.fn(),
        getValue: vi.fn(() => valueRef.value),
        setValue: vi.fn(),
      }
      
      const unifiedValue = useFieldValue(fieldContext)
      
      expect(unifiedValue.value).toBe('initial')
      
      valueRef.value = 'updated'
      
      expect(unifiedValue.value).toBe('updated')
    })
  })
})


