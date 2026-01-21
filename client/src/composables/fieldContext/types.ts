import type { Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'

/**
 * WHY: Field display configuration
 *
 * LEARNING: Display config defines how fields appear in forms
 * WHY: Separates presentation logic from data structure
 */
export interface FieldDisplayConfig<GE extends GlobalEntityKey, _FieldKey extends GlobalFieldKey<GE>> {
  label: string
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  fieldType?: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select' | 'multiselect' | 'required' | 'partsCollection' | 'hidden'
  displayOrder?: number
}

/**
 * Field validation rules
 *
 * LEARNING: Validation rules define field constraints
 * WHY: Type-safe validation configuration
 */
export interface FieldValidationRules {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp | string
  validate?: (value: ValidAdminValue) => boolean | string
}

/**
 * Field context type
 *
 * LEARNING: Provides all field-related state and operations
 * WHY: Single source of truth for field state
 */
export interface FieldContextType<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  // State
  fieldKey: FieldKey
  entityKey: GE
  entityId: GlobalEntityId
  formInstance?: FormContext
  value: Ref<ValidAdminValue>
  error: Ref<string | undefined>
  isValidating: Ref<boolean>
  isDirty: Ref<boolean>
  isValid: Ref<boolean>
  isDisabled: Ref<boolean>
  isFocused: Ref<boolean>
  displayConfig: FieldDisplayConfig<GE, FieldKey>
  validationRules: FieldValidationRules

  // Actions
  setFocus: (focused: boolean) => void
  validate: () => Promise<boolean>
  clearError: () => void
  save: () => Promise<void>
  reset: () => void
  getValue: () => ValidAdminValue
  setValue: (value: ValidAdminValue) => void
}


