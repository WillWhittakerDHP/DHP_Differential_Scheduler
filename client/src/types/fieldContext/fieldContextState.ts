import type { ComputedRef, Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldDisplayConfig, FieldValidationRules } from '@/composables/fieldContext/types'
import type { useAdmin } from '@/composables/admin/useAdmin'
import type { useComponentEntity } from '@/composables/useComponentEntity'
import type { useQueryClient } from '@tanstack/vue-query'

export type UseFieldContextStateOptions<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
  form?: FormContext
  displayConfig?: Partial<FieldDisplayConfig<GE, FieldKey>>
  validationRules?: FieldValidationRules
  initialValue?: ValidAdminValue
}

export type UseFieldContextStateReturn<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
  fieldKey: FieldKey
  entityKey: GE
  entityId: GlobalEntityId
  isTempEntity: ComputedRef<boolean>
  adminComp: ReturnType<typeof useAdmin>
  entity: ComputedRef<unknown>
  entityValue: ComputedRef<ValidAdminValue>
  composedEntityComposable: ReturnType<typeof useComponentEntity> | null
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
