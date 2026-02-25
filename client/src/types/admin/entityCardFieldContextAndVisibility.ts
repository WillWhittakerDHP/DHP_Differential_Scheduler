import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseFormFieldsReturn } from '@/composables/useFormFields'
import type { UseEntityCardFieldConfigurationReturn } from '@/types/admin/entityCardFieldConfiguration'
import type { AppLogger } from '@/utils/logger'

export interface UseEntityCardFieldContextAndVisibilityParams {
  formFields: UseFormFieldsReturn
  fieldLocation: UseEntityCardFieldConfigurationReturn['fieldLocation']
  isMetadataLoading: boolean
  isMetadataReady: boolean
  entityKey: GlobalEntityKey
  isComposable: boolean
  form: FormContext
  logger: AppLogger
}
