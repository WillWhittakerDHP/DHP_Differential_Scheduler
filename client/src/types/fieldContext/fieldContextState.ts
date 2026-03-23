import type { ComputedRef, Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldDisplayConfig, FieldValidationRules } from '@/composables/fieldContext/types'
import type { UseAdminReturn } from '@/composables/admin/useAdmin'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import type { useQueryClient } from '@tanstack/vue-query'
import type { UseFieldContextActionsReturn } from '@/types/fieldContext/fieldContextActions'

export type UseFieldContextStateOptions<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
  form?: FormContext
  displayConfig?: Partial<FieldDisplayConfig<GE, FieldKey>>
  validationRules?: FieldValidationRules
  initialValue?: ValidAdminValue
  /**
   * When set (e.g. from useFormFields + parent fieldMetadata), skips useEntityMetadata for this field
   * and reads entries from this ref — shortens composable chain / import-graph on the hot path.
   */
  fieldMetadata?: ComputedRef<Record<string, FieldMetadataEntry>>
}

export type UseFieldContextStateReturn<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
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
  handleChange: (value: ValidAdminValue) => void
  setValue: (value: ValidAdminValue) => void
  isValidating: Ref<boolean>
  isFocused: Ref<boolean>
  isDisabled: Ref<boolean>
  displayConfig: FieldDisplayConfig<GE, FieldKey>
  validationRules: FieldValidationRules
  queryClient: ReturnType<typeof useQueryClient>
  patchFieldAsync: (payload: { admin: { key: string; value: ValidAdminValue }; dynamicId: string }) => Promise<unknown>
  toPlainValue: (value: unknown) => unknown
}

/** Grouped return for composable-health (oversized-return repair). */
export type UseFieldContextStateReturnGrouped<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
  state: UseFieldContextStateReturn<GE, FieldKey>
  actions: UseFieldContextActionsReturn
}
