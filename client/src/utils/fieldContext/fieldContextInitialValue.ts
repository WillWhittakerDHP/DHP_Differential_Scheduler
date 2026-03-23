import type { FormContext } from 'vee-validate'
import type { ValidAdminValue } from '@/constants/primitives'

/**
 * Resolves vee field initial value: explicit override → form.values[fieldKey] → entity store value.
 */
export function resolveInitialFieldContextValue(
  explicitInitial: ValidAdminValue | undefined,
  formInstance: FormContext,
  fieldKey: string | number,
  entityValue: ValidAdminValue
): ValidAdminValue {
  if (explicitInitial !== undefined) {
    return explicitInitial
  }

  if (formInstance.values !== undefined && formInstance.values !== null && typeof formInstance.values === 'object') {
    const formValues = formInstance.values
    const formValue = (formValues as Record<string, unknown>)[String(fieldKey)]
    if (formValue !== undefined && formValue !== null) {
      return formValue as ValidAdminValue
    }
  }

  return entityValue
}
