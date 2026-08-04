/**
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { watch } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { useFieldContextManager } from '@/composables/admin/useFieldContextManager'
import { useConditionalFieldVisibility } from '@/composables/admin/useConditionalFieldVisibility'
import type {
  UseEntityCardFieldContextAndVisibilityParams,
  UseEntityCardFieldContextAndVisibilityReturn,
} from '@/types/admin/entityCardFieldContextAndVisibility'

export function useEntityCardFieldContextAndVisibility<GE extends GlobalEntityKey = GlobalEntityKey>(
  params: UseEntityCardFieldContextAndVisibilityParams<GE>
): UseEntityCardFieldContextAndVisibilityReturn<GE> {
  const {
    formFields,
    fieldLocation,
    isMetadataLoading,
    isMetadataReady,
    entityKey,
    isComposable,
    form,
    logger,
    blockInstanceSemanticType,
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

  const { getFieldContext, fieldsMissingContexts } = useFieldContextManager<GE>({
    getFieldContext: formFields.getFieldContext,
    fieldsByLocation: fieldLocation.fieldsByLocation,
    isMetadataLoading,
    isMetadataReady,
    fieldsNeedingContexts: formFields.fieldsNeedingContexts,
  })

  const { filteredFieldsByLocation } = useConditionalFieldVisibility<GE>({
    fieldsByLocation: fieldLocation.fieldsByLocation,
    entityKey,
    isComposable,
    form,
    blockInstanceSemanticType,
  })

  return { getFieldContext, fieldsMissingContexts, filteredFieldsByLocation }
}
