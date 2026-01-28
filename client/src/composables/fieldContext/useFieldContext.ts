import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import type { FieldContextType } from './types'
import { useFieldContextState, type UseFieldContextStateOptions } from './useFieldContextState'
import { useFieldContextActions } from './useFieldContextActions'

/**
 * Field context composable (facade).
 *
 * PATTERN: query/state/actions separation
 * - state: `useFieldContextState` (vee-validate wiring + derived values)
 * - actions: `useFieldContextActions` (save/reset/relationship updates)
 *
 * NOTE: This keeps the public API stable; it’s a mechanical split of the old large file.
 */
export function useFieldContext<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldKey: FieldKey,
  entityKey: GE,
  entityId: GlobalEntityId,
  options?: UseFieldContextStateOptions<GE, FieldKey>
): FieldContextType<GE, FieldKey> {
  const state = useFieldContextState(fieldKey, entityKey, entityId, options)
  const actions = useFieldContextActions(state)

  return {
    fieldKey,
    entityKey,
    entityId,
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
    setFocus: actions.setFocus,
    validate: actions.validate,
    clearError: actions.clearError,
    save: actions.save,
    reset: actions.reset,
    getValue: actions.getValue,
    setValue: actions.setValue,
  }
}


