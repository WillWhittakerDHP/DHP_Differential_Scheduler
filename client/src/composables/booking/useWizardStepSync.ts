/**
 * useWizardStepSync Composable
 * 
 * LEARNING: Syncs local step data and validation state to parent-provided refs
 * WHY: Extracts parent ref syncing logic from step components (reusable across all steps)
 * PATTERN: Composable that injects parent refs and sets up watchers for syncing
 */

import { watch, inject, type Ref } from 'vue'

/**
 * useWizardStepSync composable parameters
 */
export interface UseWizardStepSyncParams<TStepData> {
  /**
   * Local step data to sync to parent
   */
  stepData: Ref<TStepData>
  
  /**
   * Local form validity state to sync to parent
   */
  isFormValid: Ref<boolean>
  
  /**
   * Local validation function to assign to parent
   */
  validateForm: () => boolean
  
  /**
   * Step data key for injection (e.g., 'availabilityStepData', 'propertyDetailsStepData')
   */
  stepDataKey: string
  
  /**
   * Step valid key for injection (e.g., 'availabilityStepValid', 'propertyDetailsStepValid')
   */
  stepValidKey: string
  
  /**
   * Step validate key for injection (e.g., 'availabilityStepValidate', 'propertyDetailsStepValidate')
   */
  stepValidateKey: string
  
  /**
   * Optional field errors to sync to parent
   */
  fieldErrors?: Ref<Record<string, string>>
  
  /**
   * Optional field errors key for injection (e.g., 'propertyDetailsFieldErrors')
   */
  fieldErrorsKey?: string
}

/**
 * useWizardStepSync composable
 * 
 * LEARNING: Syncs local step data and validation state to parent-provided refs
 * WHY: Extracts parent ref syncing logic from step components
 * PATTERN: Composable that injects parent refs and sets up watchers
 */
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
  // WHY: Parent provides refs that children write to (provide/inject only works parent-to-child)
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

  // LEARNING: Sync local stepData to parent-provided ref
  // WHY: Enables BookingWizard to collect step data
  // PATTERN: Watch local stepData and update parent ref
  watch(stepData, (newData) => {
    if (parentStepData) {
      parentStepData.value = newData
    }
  }, { immediate: true, deep: true })

  // LEARNING: Sync local validation state to parent-provided refs
  // WHY: Enables BookingWizard to check step validity before navigation
  // PATTERN: Watch local validation state and update parent refs
  watch(isFormValid, (newValid) => {
    if (parentStepValid) {
      parentStepValid.value = newValid
    }
  }, { immediate: true })

  // LEARNING: Assign validateForm function directly to parent ref
  // WHY: validateForm is a function, not a ref, so we assign it directly
  // PATTERN: Assign function to parent ref (no watch needed)
  parentStepValidate.value = validateForm

  // LEARNING: Sync field errors to parent if provided
  // WHY: Enables BookingWizard to access field-level validation errors
  // PATTERN: Watch fieldErrors and update parent ref
  if (fieldErrors && parentFieldErrors) {
    watch(fieldErrors, (newErrors) => {
      if (parentFieldErrors) {
        parentFieldErrors.value = newErrors
      }
    }, { immediate: true, deep: true })
  }
}
