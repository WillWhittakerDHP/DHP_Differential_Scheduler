import type { Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { FieldsByLayout } from '@/types/forms/layoutFieldCategorization'

export interface UseEntityCardLayoutOptions {
  entityKey: GlobalEntityKey
  formContentRef: Ref<{
    readyInlineFields?: Ref<Array<GlobalFieldKey<GlobalEntityKey>>>
    readyStackedFields?: Ref<Array<GlobalFieldKey<GlobalEntityKey>>>
    getFieldContext?: (
      fieldKey: GlobalFieldKey<GlobalEntityKey>
    ) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  } | null>
}

export interface UseEntityCardLayoutReturn {
  fields: Ref<FieldsByLayout<GlobalFieldKey<GlobalEntityKey>>>
  getFieldContext: (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  shouldRenderFields: Ref<boolean>
}
