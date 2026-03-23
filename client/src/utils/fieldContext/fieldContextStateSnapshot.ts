import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { UseAdminReturn } from '@/composables/admin/useAdmin'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import type { useQueryClient } from '@tanstack/vue-query'
import type { FormContext } from 'vee-validate'
import type { FieldDisplayConfig, FieldValidationRules } from '@/composables/fieldContext/types'
import type { UseFieldContextStateReturn } from '@/types/fieldContext/fieldContextState'

export interface UseFieldContextStateSnapshotParts<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  fieldKey: FieldKey
  entityKey: GE
  entityId: GlobalEntityId
  isTempEntity: ComputedRef<boolean>
  adminComp: UseAdminReturn
  entity: ComputedRef<unknown>
  entityValue: ComputedRef<ValidAdminValue>
  composedEntityComposable: ComposedEntityLike | null
  formInstance: FormContext
  value: Ref<ValidAdminValue>
  error: ComputedRef<string | undefined>
  isValid: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>
  validateField: () => Promise<unknown>
  setValue: (value: ValidAdminValue) => void
  handleChange: (nextValue: ValidAdminValue) => void
  isValidating: Ref<boolean>
  isFocused: Ref<boolean>
  isDisabled: Ref<boolean>
  displayConfig: FieldDisplayConfig<GE, FieldKey>
  validationRules: FieldValidationRules
  queryClient: ReturnType<typeof useQueryClient>
  patchFieldAsync: UseFieldContextStateReturn<GE, FieldKey>['patchFieldAsync']
  toPlainValue: (raw: unknown) => unknown
}

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
