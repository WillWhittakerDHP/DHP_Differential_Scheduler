/**
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { watch } from 'vue'
import { useFieldContextManager } from '@/composables/admin/useFieldContextManager'
import { useConditionalFieldVisibility } from '@/composables/admin/useConditionalFieldVisibility'
import type { UseEntityCardFieldContextAndVisibilityParams } from '@/types/admin/entityCardFieldContextAndVisibility'


export interface UseEntityCardFieldContextAndVisibilityReturn {
  getFieldContext: ReturnType<typeof useFieldContextManager>['getFieldContext']
  fieldsMissingContexts: ReturnType<typeof useFieldContextManager>['fieldsMissingContexts']
  filteredFieldsByLocation: ReturnType<typeof useConditionalFieldVisibility>['filteredFieldsByLocation']
}

export function useEntityCardFieldContextAndVisibility(
  params: UseEntityCardFieldContextAndVisibilityParams
): UseEntityCardFieldContextAndVisibilityReturn {
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
