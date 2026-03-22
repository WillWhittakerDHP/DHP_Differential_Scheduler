import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldsByLocation } from '@/types/admin/conditionalFieldVisibility'

export interface UseFieldContextManagerOptions<GE extends GlobalEntityKey = GlobalEntityKey> {
  getFieldContext: (
    fieldKey: GlobalFieldKey<GE>
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined
  fieldsByLocation: ComputedRef<FieldsByLocation<GE>>
  isMetadataLoading: ComputedRef<boolean>
  isMetadataReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GE>[]>
}

export interface UseFieldContextManagerReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  getFieldContext: (
    fieldKey: GlobalFieldKey<GE>
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined
  fieldsMissingContexts: ComputedRef<GlobalFieldKey<GE>[]>
}
