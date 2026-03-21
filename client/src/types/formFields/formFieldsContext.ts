import type { Ref, ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { useAdminConfig } from '@/composables/useAdminConfig'

export interface UseFormFieldsContextReturn {
  adminConfig: ReturnType<typeof useAdminConfig>
  formInstance: ComputedRef<FormContext | undefined>
  currentEntityId: ComputedRef<GlobalEntityId>
  isFormReady: ComputedRef<boolean>
  fieldContextCache: Ref<Map<string, FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  getFieldContext: <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    fieldKey: FieldKey
  ) => FieldContextTypeGrouped<GE, FieldKey> | undefined
}
