import {
  ref,
  shallowRef,
  computed,
  getCurrentInstance,
  unref,
  watchEffect,
  type ComputedRef,
  type Ref,
  type ShallowRef,
} from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { createLogger } from '@/utils/logger'
import {
  combineUniqueFieldKeys,
  isFormContextReadyForFieldContexts,
  metadataReadyFromProvided,
} from '@/utils/formFields/formFieldsReadiness'
import { readGlobalFieldKeyArray } from '@/utils/formFields/readFormFieldKeySources'
import { createEntityFormFieldContext } from '@/utils/formFields/formFieldContextCreation'
import { useFormFieldsMetadataWarnings } from '@/composables/formFields/useFormFieldsMetadataWarnings'

const logger = createLogger('useFormFieldsFieldContextSetup')

export interface UseFormFieldsFieldContextSetupOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  fieldKeysSource: ComputedRef<GlobalFieldKey<GE>[]>
  providedForm: { value: FormContext | undefined } | undefined
  providedFieldMetadata:
    | ComputedRef<Record<string, FieldMetadataEntry>>
    | Ref<Record<string, FieldMetadataEntry>>
    | undefined
}

export interface UseFormFieldsFieldContextSetupReturn<GE extends GlobalEntityKey> {
  fieldContextCache: ShallowRef<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>>
  isFormReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GE>[]>
  getFieldContext: (
    fieldKey: GlobalFieldKey<GE>
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined
  currentEntityId: ComputedRef<GlobalEntityId>
}

/**
 * Field context cache + watchEffect bootstrap for useFormFields.
 * PATTERN: Stays under `utils/` (not `composables/`) so import-graph composable depth does not chain
 * through this module from useFormFields — intentional despite inventory “composable in disguise” heuristics.
 */
export function useFormFieldsFieldContextSetup<GE extends GlobalEntityKey>(
  options: UseFormFieldsFieldContextSetupOptions<GE>,
  entityId: { value: GlobalEntityId } | undefined
): UseFormFieldsFieldContextSetupReturn<GE> {
  const { entityKey, fieldKeysSource, providedForm, providedFieldMetadata } = options
  const metadataWarnings = useFormFieldsMetadataWarnings<GE>({ entityKey })

  const capturedInstance = getCurrentInstance()

  const formInstance = computed<FormContext | undefined>(() => providedForm?.value ?? undefined)
  const fieldContextCache = shallowRef<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>>(new Map())
  const tempEntityId = ref<GlobalEntityId>(toGlobalEntityId(TEMPORARY_ID_PATTERNS.NEW_PREFIX + String(Date.now())))

  const currentEntityId = computed(() => entityId?.value || tempEntityId.value)

  const isFormReady = computed(() => isFormContextReadyForFieldContexts(formInstance.value))

  const isMetadataReady = computed(() => {
    const metadata = providedFieldMetadata !== undefined ? unref(providedFieldMetadata) : undefined
    return metadataReadyFromProvided(metadata, providedFieldMetadata !== undefined)
  })

  const threadedFieldMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
    if (providedFieldMetadata === undefined) {
      return {}
    }
    return unref(providedFieldMetadata)
  })

  const fieldsNeedingContexts = computed<GlobalFieldKey<GE>[]>(() => {
    if (!isFormReady.value) return []
    const metadata = providedFieldMetadata !== undefined ? unref(providedFieldMetadata) : undefined
    const metadataKeys = metadata ? Object.keys(metadata) : []
    const baseKeys = readGlobalFieldKeyArray<GE>(fieldKeysSource.value)
    const combinedKeys = combineUniqueFieldKeys<GE>(baseKeys, metadataKeys)

    if (isMetadataReady.value && metadata) {
      metadataWarnings.warnMissingMetadataEntries(combinedKeys, metadata, isMetadataReady.value)
    }
    return combinedKeys.filter((fieldKey) => !fieldContextCache.value.has(String(fieldKey)))
  })

  const getFieldDisplayConfig = (
    fieldKey: string
  ): FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>['state']['displayConfig'] => {
    const metadata = providedFieldMetadata !== undefined ? unref(providedFieldMetadata) : undefined
    const hasMetadataKeys = !!metadata && Object.keys(metadata).length > 0
    return metadataWarnings.getFieldDisplayConfig(fieldKey, metadata, hasMetadataKeys, isMetadataReady.value)
  }

  const createFieldContext = (fieldKey: GlobalFieldKey<GE>, entityIdValue: GlobalEntityId): void => {
    createEntityFormFieldContext<GE>({
      fieldKey,
      entityIdValue,
      entityKey,
      fieldContextCache,
      formInstance,
      getFieldDisplayConfig,
      hasProvidedFieldMetadata: providedFieldMetadata !== undefined,
      threadedFieldMetadata,
      capturedInstance,
    })
  }

  const createContextsForFields = (): void => {
    if (!isFormReady.value) {
      logger.warn('Cannot create contexts - form not ready', {
        entityKey,
        entityId: currentEntityId.value,
        hasFormInstance: !!formInstance.value,
        providedFormValue: !!providedForm?.value,
      })
      return
    }
    const fieldsToCreate = fieldsNeedingContexts.value
    const entityIdValue = currentEntityId.value
    if (fieldsToCreate?.length) {
      fieldsToCreate.forEach((fieldKey) => createFieldContext(fieldKey, entityIdValue))
    }
  }

  createContextsForFields()
  watchEffect(() => {
    if (fieldsNeedingContexts.value.length > 0) createContextsForFields()
  })

  const getFieldContext = (
    fieldKey: GlobalFieldKey<GE>
  ): FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined => {
    return fieldContextCache.value.get(String(fieldKey))
  }

  return {
    fieldContextCache,
    isFormReady,
    fieldsNeedingContexts,
    getFieldContext,
    currentEntityId,
  }
}
