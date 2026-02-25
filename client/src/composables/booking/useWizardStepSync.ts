/**
 * WHY: useWizardStepSync Composable

LEARNING: Syncs local step data and valida...
 */
import { watch, inject, type Ref } from 'vue'
import type { UseWizardStepSyncParams } from '@/types/booking/wizardStepSync'

export type { UseWizardStepSyncParams } from '@/types/booking/wizardStepSync'

export function useWizardStepSync<TStepData>(
  params: UseWizardStepSyncParams<TStepData>
): void {
  const {
    stepData,
    isFormValid,
    validateForm,
    stepDataKey,
    stepValidKey,
    stepValidateKey,
    fieldErrors,
    fieldErrorsKey
  } = params

  // LEARNING: Inject parent-provided refs for step data and validation state
  // PATTERN: Inject refs from parent, sync local state to them
  const parentStepData = inject<Ref<TStepData | null>>(stepDataKey)
  const parentStepValid = inject<Ref<boolean>>(stepValidKey)
  const parentStepValidate = inject<Ref<(() => boolean) | null>>(stepValidateKey)
  const parentFieldErrors = fieldErrorsKey && fieldErrors
    ? inject<Ref<Record<string, string>>>(fieldErrorsKey)
    : null

  if (!parentStepData || !parentStepValid || !parentStepValidate) {
    throw new Error(
      `Parent-provided refs not found. Make sure BookingWizard provides ${stepDataKey}, ${stepValidKey}, and ${stepValidateKey}.`
    )
  }

  // PATTERN: Watch local stepData and update parent ref
  watch(stepData, (newData) => {
    if (parentStepData) {
      parentStepData.value = newData
    }
  }, { immediate: true, deep: true })

  // LEARNING: Sync local validation state to parent-provided refs
  // PATTERN: Watch local validation state and update parent refs
  watch(isFormValid, (newValid) => {
    if (parentStepValid) {
      parentStepValid.value = newValid
    }
  }, { immediate: true })

  // PATTERN: Assign function to parent ref (no watch needed)
  parentStepValidate.value = validateForm

  // PATTERN: Watch fieldErrors and update parent ref
  if (fieldErrors && parentFieldErrors) {
    watch(fieldErrors, (newErrors) => {
      if (parentFieldErrors) {
        parentFieldErrors.value = newErrors
      }
    }, { immediate: true, deep: true })
  }
}
