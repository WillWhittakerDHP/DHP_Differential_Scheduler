import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseFieldContextStateReturn } from '@/types/fieldContext/fieldContextState'

export type UseFieldContextStateSnapshotParts<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = UseFieldContextStateReturn<GE, FieldKey>

/**
 * Builds the flat state object expected by save helpers / grouped return.
 */
export function buildUseFieldContextStateSnapshot<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  parts: UseFieldContextStateSnapshotParts<GE, FieldKey>
): UseFieldContextStateReturn<GE, FieldKey> {
  return {
    fieldKey: parts.fieldKey,
    entityKey: parts.entityKey,
    entityId: parts.entityId,
    isTempEntity: parts.isTempEntity,
    adminComp: parts.adminComp,
    entity: parts.entity,
    entityValue: parts.entityValue,
    composedEntityComposable: parts.composedEntityComposable,
    formInstance: parts.formInstance,
    value: parts.value,
    error: parts.error,
    isValid: parts.isValid,
    isDirty: parts.isDirty,
    validateField: parts.validateField,
    setValue: parts.setValue,
    handleChange: parts.handleChange,
    isValidating: parts.isValidating,
    isFocused: parts.isFocused,
    isDisabled: parts.isDisabled,
    displayConfig: parts.displayConfig,
    validationRules: parts.validationRules,
    queryClient: parts.queryClient,
    patchFieldAsync: parts.patchFieldAsync,
    toPlainValue: parts.toPlainValue,
  }
}
