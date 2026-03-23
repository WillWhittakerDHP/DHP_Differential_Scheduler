/**
 * Pure helper: builds the public FieldContextTypeGrouped from useFieldContextState grouped return.
 * No composable calls — does not add to chain depth.
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from './types'
import type { UseFieldContextStateReturnGrouped } from '@/types/fieldContext/fieldContextState'

export type { FieldContextTypeGrouped } from './types'

export function buildFieldContextReturn<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  stateAndActions: UseFieldContextStateReturnGrouped<GE, FieldKey>
): FieldContextTypeGrouped<GE, FieldKey> {
  const { state, actions } = stateAndActions
  return {
    state: {
      fieldKey: state.fieldKey,
      entityKey: state.entityKey,
      entityId: state.entityId,
      formInstance: state.formInstance,
      value: state.value,
      error: state.error,
      isValidating: state.isValidating,
      isDirty: state.isDirty,
      isValid: state.isValid,
      isDisabled: state.isDisabled,
      isFocused: state.isFocused,
      displayConfig: state.displayConfig,
      validationRules: state.validationRules,
    },
    actions: {
      setFocus: actions.setFocus,
      validate: actions.validate,
      clearError: actions.clearError,
      save: actions.save,
      reset: actions.reset,
      getValue: actions.getValue,
      setValue: actions.setValue,
    },
  }
}
