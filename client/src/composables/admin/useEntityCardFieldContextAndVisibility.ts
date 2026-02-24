/**
 * PATTERN: Field context manager + conditional visibility + debug watch for EntityCard.
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { watch } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import { useFieldContextManager } from '@/composables/admin/useFieldContextManager'
import { useConditionalFieldVisibility } from '@/composables/admin/useConditionalFieldVisibility'
import type { UseFormFieldsReturn } from '@/composables/useFormFields'
import type { UseEntityCardFieldConfigurationReturn } from '@/composables/admin/useEntityCardFieldConfiguration'
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

export function useEntityCardFieldContextAndVisibility(
  params: UseEntityCardFieldContextAndVisibilityParams
) {
  const {
    formFields,
    fieldLocation,
    isMetadataLoading,
    isMetadataReady,
    entityKey,
    isComposable,
    form,
    logger,
  } = params

  watch(
    () => formFields.fieldsNeedingContexts.value,
    (fieldsNeedingContexts) => {
      if (fieldsNeedingContexts.length > 0) {
        logger.debug('Fields needing contexts', {
          entityKey,
          fieldsNeedingContexts: fieldsNeedingContexts.map(String),
        })
      }
    }
  )

  const { getFieldContext, fieldsMissingContexts } = useFieldContextManager({
    getFieldContext: formFields.getFieldContext,
    fieldsByLocation: fieldLocation.fieldsByLocation,
    isMetadataLoading,
    isMetadataReady,
    fieldsNeedingContexts: formFields.fieldsNeedingContexts,
  })

  const { filteredFieldsByLocation } = useConditionalFieldVisibility({
    fieldsByLocation: fieldLocation.fieldsByLocation,
    entityKey,
    isComposable,
    form,
  })

  return { getFieldContext, fieldsMissingContexts, filteredFieldsByLocation }
}
