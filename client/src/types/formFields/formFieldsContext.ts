import type { Ref, ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { useAdminConfig } from '@/composables/useAdminConfig'

export interface UseFormFieldsContextReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  adminConfig: ReturnType<typeof useAdminConfig>
  formInstance: ComputedRef<FormContext | undefined>
  currentEntityId: ComputedRef<GlobalEntityId>
  isFormReady: ComputedRef<boolean>
  fieldContextCache: Ref<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GE>[]>
  getFieldContext: (
    fieldKey: GlobalFieldKey<GE>
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined
}
