/**
 * LEARNING: Index file provides centralized exports for input components
 * 
 * WHY: Makes imports cleaner and easier to manage
 * 
 * PATTERN: Barrel export pattern - re-exports all components from one file
 */

export { default as BaseInput } from './BaseInput.vue'
export { default as FieldRenderer } from './FieldRenderer.vue'
export { default as PrimitiveInputs } from './PrimitiveInputs.vue'
export { default as TextInput } from './TextInput.vue'
export { default as NumberInput } from './NumberInput.vue'
export { default as BooleanInput } from './BooleanInput.vue'
export { default as DateInput } from './DateInput.vue'
export { default as TextAreaInput } from './TextAreaInput.vue'
export { default as SelectInputs } from './SelectInputs.vue'

export type { FieldContextType, FieldDisplayConfig, FieldValidationRules } from '@/composables/useFieldContext'

