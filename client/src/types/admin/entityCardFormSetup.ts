import type { ComputedRef, Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { useAdminConfig } from '@/composables/useAdminConfig'
import type { UseFormFieldsReturn } from '@/composables/formFields/types'
import type { UseEntityCardFieldConfigurationReturn } from '@/types/admin/entityCardFieldConfiguration'

export interface UseEntityCardFormSetupParams<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: GlobalEntity<GE>
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isMetadataLoading: ComputedRef<boolean>
  isExpanded: ComputedRef<boolean>
  filteredMetadata?: Record<string, FieldMetadataEntry>
  form: Ref<FormContext | undefined>
  adminConfig: ReturnType<typeof useAdminConfig>
}

export interface UseEntityCardFormSetupReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  formFields: UseFormFieldsReturn<GE>
  fieldKeys: ComputedRef<GlobalFieldKey<GE>[]>
  isMetadataReady: ComputedRef<boolean>
  entityName: ComputedRef<string>
  isComposable: ComputedRef<boolean>
  finalFieldKeys: ComputedRef<GlobalFieldKey<GE>[]>
  fieldLocation: UseEntityCardFieldConfigurationReturn<GE>['fieldLocation']
  inlineFieldsConfig: ComputedRef<GlobalFieldKey<GE>[]>
  stackedFieldsConfig: ComputedRef<GlobalFieldKey<GE>[]>
  isFormReady: ComputedRef<boolean>
}
