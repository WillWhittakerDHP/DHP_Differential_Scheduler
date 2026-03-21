/**
 * Form validation types. Matches Vuetify's validation rule pattern.
 */
export type ValidationRule = (value: unknown) => string | boolean

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}
