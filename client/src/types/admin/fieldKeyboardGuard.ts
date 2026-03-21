import type { ComputedRef } from 'vue'

export type FieldKeyboardGuardType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'boolean'
  | 'icon'
  | 'date'

export interface UseFieldKeyboardGuardOptions {
  fieldType: FieldKeyboardGuardType
  isEditable: ComputedRef<boolean> | boolean
  onToggle?: (event: KeyboardEvent) => void
  onEnter?: (event: KeyboardEvent) => void
}

export interface UseFieldKeyboardGuardReturn {
  handleKeydown: (event: KeyboardEvent) => void
}
