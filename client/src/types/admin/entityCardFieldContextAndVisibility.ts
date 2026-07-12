import type { ComputedRef, Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseFormFieldsReturn } from '@/composables/useFormFields'
import type { UseFieldLocationReturn } from '@/types/admin/fieldLocation'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldsByLocation } from '@/types/admin/conditionalFieldVisibility'
import type { AppLogger } from '@/utils/logger'

export interface UseEntityCardFieldContextAndVisibilityParams<
  GE extends GlobalEntityKey = GlobalEntityKey,
> {
  formFields: UseFormFieldsReturn<GE>
  fieldLocation: UseFieldLocationReturn<GE>
  isMetadataLoading: ComputedRef<boolean>
  isMetadataReady: ComputedRef<boolean>
  entityKey: GE
  isComposable: ComputedRef<boolean>
  form: FormContext
  logger: AppLogger
  isUserSemanticBlockInstance?: ComputedRef<boolean> | Ref<boolean>
}

export interface UseEntityCardFieldContextAndVisibilityReturn<
  GE extends GlobalEntityKey = GlobalEntityKey,
> {
  getFieldContext: (
    fieldKey: GlobalFieldKey<GE>
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined
  fieldsMissingContexts: ComputedRef<GlobalFieldKey<GE>[]>
  filteredFieldsByLocation: ComputedRef<FieldsByLocation<GE>>
}
