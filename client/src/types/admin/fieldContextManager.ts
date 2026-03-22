import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'

export interface UseFieldContextManagerOptions {
  getFieldContext: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  fieldsByLocation: ComputedRef<{
    directInline: GlobalFieldKey<GlobalEntityKey>[]
    directStacked: GlobalFieldKey<GlobalEntityKey>[]
    subPanels: {
      parts: GlobalFieldKey<GlobalEntityKey>[]
      relationships: GlobalFieldKey<GlobalEntityKey>[]
      annotations: GlobalFieldKey<GlobalEntityKey>[]
      events: GlobalFieldKey<GlobalEntityKey>[]
    }
  }>
  isMetadataLoading: ComputedRef<boolean>
  isMetadataReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

export interface UseFieldContextManagerReturn {
  getFieldContext: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  fieldsMissingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}
