import type { Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'

export interface FieldDisplayConfig<GE extends GlobalEntityKey, _FieldKey extends GlobalFieldKey<GE>> {
  label: string
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  fieldType?: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select' | 'multiselect' | 'required' | 'relationshipCollection' | 'hidden'
  displayOrder?: number
}

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

  setFocus: (focused: boolean) => void
  validate: () => Promise<boolean>
  clearError: () => void
  save: () => Promise<void>
  reset: () => void
  getValue: () => ValidAdminValue
  setValue: (value: ValidAdminValue) => void
}


