import { triggerRef, type ComponentInternalInstance, type ComputedRef, type ShallowRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { buildFieldContextReturn, type FieldContextTypeGrouped } from '@/composables/fieldContext/buildFieldContextReturn'
import { useFieldContextState } from '@/composables/fieldContext/useFieldContextState'
import { useFieldContextStateThreaded } from '@/composables/fieldContext/useFieldContextStateThreaded'
import { runWithVueAppContextIfAvailable } from '@/utils/vue/runWithVueAppContext'
import { createLogger } from '@/utils/logger'

const logger = createLogger('formFieldContextCreation')

interface CreateEntityFormFieldContextParams<GE extends GlobalEntityKey> {
  fieldKey: GlobalFieldKey<GE>
  entityIdValue: GlobalEntityId
  entityKey: GE
  fieldContextCache: ShallowRef<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>>
  formInstance: ComputedRef<FormContext | undefined>
  getFieldDisplayConfig: (
    fieldKey: string
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>['state']['displayConfig']
  hasProvidedFieldMetadata: boolean
  threadedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  capturedInstance: ComponentInternalInstance | null
}

/**
 * Creates and caches one field context inside Vue app context when available.
 */
export function createEntityFormFieldContext<GE extends GlobalEntityKey>(
  params: CreateEntityFormFieldContextParams<GE>
): void {
  const {
    fieldKey,
    entityIdValue,
    entityKey,
    fieldContextCache,
    formInstance,
    getFieldDisplayConfig,
    hasProvidedFieldMetadata,
    threadedFieldMetadata,
    capturedInstance,
  } = params

  const cacheKey = String(fieldKey)
  if (fieldContextCache.value.has(cacheKey)) {
    return
  }

  try {
    const buildContext = (): void => {
      const currentFormInstance = formInstance.value
      if (!currentFormInstance) {
        throw new Error(`[useFormFields] Form instance not ready for field ${fieldKey}`)
      }
      const commonOptions = {
        form: currentFormInstance as FormContext,
        displayConfig: getFieldDisplayConfig(String(fieldKey)),
        ...(hasProvidedFieldMetadata ? { fieldMetadata: threadedFieldMetadata } : {}),
      }
      const stateAndActions = hasProvidedFieldMetadata
        ? useFieldContextStateThreaded<GE, GlobalFieldKey<GE>>(fieldKey, entityKey, entityIdValue, commonOptions)
        : useFieldContextState<GE, GlobalFieldKey<GE>>(fieldKey, entityKey, entityIdValue, commonOptions)
      const fieldContext = buildFieldContextReturn(stateAndActions)
      fieldContextCache.value.set(cacheKey, fieldContext)
      triggerRef(fieldContextCache)
    }
    runWithVueAppContextIfAvailable(capturedInstance, buildContext)
  } catch (error) {
    logger.error('Error creating context for field', { entityKey, entityIdValue, fieldKey, error })
  }
}
