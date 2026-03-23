import type { Ref } from 'vue'
import type { ISO8601Date } from '@shared/types/primitiveBrands'

export function applySelectedDateValidationToFieldErrors(
  fieldErrors: Ref<Record<string, string>>,
  dateString: ISO8601Date | null,
  dateNotInPastResult: string | boolean | undefined
): void {
  if (!dateString) {
    fieldErrors.value = {
      ...fieldErrors.value,
      selectedDate: 'Please select a date',
    }
    return
  }

  if (dateNotInPastResult === true) {
    if (fieldErrors.value.selectedDate) {
      const newErrors = { ...fieldErrors.value }
      delete newErrors.selectedDate
      fieldErrors.value = newErrors
    }
    return
  }

  const message = typeof dateNotInPastResult === 'string' ? dateNotInPastResult : 'Invalid date'
  fieldErrors.value = {
    ...fieldErrors.value,
    selectedDate: message,
  }
}
