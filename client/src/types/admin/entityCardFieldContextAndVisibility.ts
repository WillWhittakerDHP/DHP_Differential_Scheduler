import type { ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseFormFieldsReturn } from '@/composables/useFormFields'
import type { UseEntityCardFieldConfigurationReturn } from '@/types/admin/entityCardFieldConfiguration'
import type { AppLogger } from '@/utils/logger'

export interface UseEntityCardFieldContextAndVisibilityParams {
  formFields: UseFormFieldsReturn
  fieldLocation: UseEntityCardFieldConfigurationReturn['fieldLocation']
  isMetadataLoading: ComputedRef<boolean>
  isMetadataReady: ComputedRef<boolean>
  entityKey: GlobalEntityKey
  isComposable: ComputedRef<boolean>
  form: FormContext
  logger: AppLogger
}
