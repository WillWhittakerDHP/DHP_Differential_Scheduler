import { computed, getCurrentInstance, ref, triggerRef, watchEffect, nextTick, type Ref, type ComputedRef } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import { toGlobalEntityId, type GlobalEntityId } from '@/types/entities'
import { useFieldContext, type FieldContextType } from '@/composables/useFieldContext'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useNotification } from '@/composables/useNotification'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFormFieldsContext')

type UseFormFieldsContextOptions = {
  entityKey: GlobalEntityKey
  entityId: Ref<GlobalEntityId>
  fieldKeys: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  /**
   * LEARNING: Metadata record for the current entity context
   * WHY: FieldContext displayConfig should be derived from `/admin-input-metadata`, not legacy formFieldConfig
   * PATTERN: Pass down the metadata fetched once by EntityCard
   */
  fieldMetadata?: Ref<Record<string, FieldMetadataEntry>> | ComputedRef<Record<string, FieldMetadataEntry>>
  form?: Ref<FormContext | undefined>
  adminConfig?: ReturnType<typeof useAdminConfig>
}

export type UseFormFieldsContextReturn = {
  adminConfig: ReturnType<typeof useAdminConfig>
  formInstance: FormContext
  currentEntityId: ComputedRef<GlobalEntityId>
  isFormReady: ComputedRef<boolean>
  fieldContextCache: Ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  getFieldContext: <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    fieldKey: FieldKey
  ) => FieldContextType<GE, FieldKey> | undefined
}

export function useFormFieldsContext(options: UseFormFieldsContextOptions): UseFormFieldsContextReturn {
  const { entityKey, entityId, fieldKeys, fieldMetadata: providedFieldMetadata, form: providedForm, adminConfig: providedAdminConfig } = options

  const adminConfig = providedAdminConfig || useAdminConfig()
  const { warning: showWarning } = useNotification()
  const appInstance = getCurrentInstance()?.appContext.app

  // PATTERN: Use computed to reactively access provided form, create new form only if none provided
  const fallbackForm = providedForm ? undefined : useForm()
  const formInstance = computed<FormContext | undefined>(() => {
    if (providedForm) {
      return providedForm.value || undefined
    }
    return fallbackForm
  })

  const fieldContextCache = ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>(new Map())

  // PATTERN: Set to track warned fields
  const warnedFields = ref<Set<string>>(new Set())

  // LEARNING: Removed effectScope tracking - useField requires component instance, not effect scope
  // WHY: effectScope() doesn't preserve component instance, which useField needs for lifecycle hooks
  // PATTERN: Verify component instance exists before calling useFieldContext

  const tempEntityId = ref<GlobalEntityId>(toGlobalEntityId(TEMPORARY_ID_PATTERNS.NEW_PREFIX + String(Date.now())))

  const currentEntityId = computed(() => {
    return entityId.value || tempEntityId.value
  })

  const isFormReady = computed(() => {
    const currentFormInstance = formInstance.value
    if (!currentFormInstance) {
      return false
    }
    // PATTERN: Check if form has values object - it will be populated by resetForm
    const hasValuesObject = currentFormInstance.values !== undefined && 
                           currentFormInstance.values !== null && 
                           typeof currentFormInstance.values === 'object'
    return hasValuesObject
  })

  // PATTERN: Check both metadata sources are loaded and merged metadata has keys
  const isMetadataReady = computed(() => {
    const metadata = providedFieldMetadata?.value
    const hasMetadata = !!metadata && Object.keys(metadata).length > 0
    return hasMetadata || providedFieldMetadata !== undefined
  })

  const fieldsNeedingContexts = computed<GlobalFieldKey<GlobalEntityKey>[]>(() => {
    if (!isFormReady.value) return []
    const metadata = providedFieldMetadata?.value
    const metadataKeys = metadata ? Object.keys(metadata) : []
    const rawKeys = fieldKeys.value
    const baseKeys = rawKeys !== undefined && rawKeys !== null && Array.isArray(rawKeys) ? rawKeys : []
    const combinedKeys = Array.from(new Set([...baseKeys, ...metadataKeys])) as GlobalFieldKey<GlobalEntityKey>[]

    // PATTERN: Gate warnings on isMetadataReady
    if (isMetadataReady.value && metadata) {
      combinedKeys.forEach((fieldKey) => {
        const fieldKeyStr = String(fieldKey)
        if (!(fieldKeyStr in metadata) && !warnedFields.value.has(fieldKeyStr)) {
          const warningMessage = `Missing FieldMetadataEntry for ${entityKey}.${fieldKeyStr}. Field must be configured in /admin-input-metadata or /admin-relationship-metadata before rendering.`
          logger.warn(warningMessage)
          showWarning(warningMessage, 6000)
          warnedFields.value.add(fieldKeyStr)
        }
      })
    }

    return combinedKeys.filter((fieldKey) => !fieldContextCache.value.has(String(fieldKey)))
  })

  /**
   * LEARNING: Map unified metadata → FieldContext.displayConfig.fieldType
   * WHY: PrimitiveInputs uses displayConfig.fieldType to choose Text/Number/Boolean inputs
   * PATTERN: Derive from renderAs + dataType + inputConfig (metadata-only)
   */
  /**
   * LEARNING: fieldType should be based on dataType only, not renderAs
   * WHY: renderAs is checked by component dispatcher to determine which component to render
   *      fieldType is purely about the data type (text, number, boolean, date, textarea)
   * PATTERN: Use dataType to determine fieldType - component dispatcher handles renderAs
   * NOTE: Component dispatcher determines if PrimitiveInputs renders BooleanInput vs TextInput
   *       based on renderAs. fieldType here is just about the underlying data type.
   */
  const getFieldTypeFromMetadata = (meta: FieldMetadataEntry): FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>['displayConfig']['fieldType'] => {
    // PATTERN: Base fieldType on dataType only
    
    if (meta.renderAs === 'multiselect') return 'multiselect'
    if (meta.renderAs === 'select' || meta.renderAs === 'reference') return 'select'

    // PATTERN: Check dataType to determine fieldType
    if (meta.dataType === 'boolean') return 'boolean'
    if (meta.dataType === 'number') return 'number'

    return 'text'
  }

  const getFieldDisplayConfig = (fieldKey: string): FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>['displayConfig'] => {
    const metadata = providedFieldMetadata?.value
    const hasMetadataKeys = !!metadata && Object.keys(metadata).length > 0
    
    // PATTERN: Gate warnings on isMetadataReady
    if (!hasMetadataKeys && isMetadataReady.value) {
      const warningKey = `${entityKey}:metadata-empty`
      if (!warnedFields.value.has(warningKey)) {
        const warningMessage = `Missing fieldMetadata for ${entityKey}. Field metadata must be provided from /admin-input-metadata or /admin-relationship-metadata.`
        logger.warn(warningMessage, { entityKey })
        showWarning(warningMessage, 6000)
        warnedFields.value.add(warningKey)
      }
      return {
        fieldType: 'text',
        label: fieldKey,
        placeholder: '',
        required: false,
        disabled: false,
      }
    }
    
    // PATTERN: Return fallback config silently during loading
    if (!hasMetadataKeys) {
      return {
        fieldType: 'text',
        label: fieldKey,
        placeholder: '',
        required: false,
        disabled: false,
      }
    }
    
    const meta = metadata[fieldKey]

    // PATTERN: Gate warnings on isMetadataReady
    if (!meta && isMetadataReady.value) {
      const warningMessage = `Missing FieldMetadataEntry for ${entityKey}.${fieldKey}. Field must be configured in /admin-input-metadata or /admin-relationship-metadata before rendering.`
      logger.warn(warningMessage)
      if (!warnedFields.value.has(fieldKey)) {
        showWarning(warningMessage, 6000)
        warnedFields.value.add(fieldKey)
      }
      return {
        fieldType: 'text',
        label: fieldKey,
        placeholder: '',
        required: false,
        disabled: false,
      }
    }

    // PATTERN: Return fallback config silently during loading
    if (!meta) {
      return {
        fieldType: 'text',
        label: fieldKey,
        placeholder: '',
        required: false,
        disabled: false,
      }
    }

    // PATTERN: Warn and use fallback value
    if (!meta.label) {
      const warningMessage = `Missing label in FieldMetadataEntry for ${entityKey}.${fieldKey}. Metadata should include label property.`
      logger.warn(warningMessage, { entityKey, fieldKey })
      if (!warnedFields.value.has(`${fieldKey}:label`)) {
        showWarning(warningMessage, 6000)
        warnedFields.value.add(`${fieldKey}:label`)
      }
    }

    // PATTERN: Use metadata properties; use fieldKey when label missing (display only)
    const displayLabel = meta.label !== undefined && meta.label !== null && meta.label !== '' ? meta.label : fieldKey
    return {
      label: displayLabel,
      placeholder: (meta as { placeholder?: string }).placeholder ?? undefined, // No default - undefined if not in metadata
      fieldType: getFieldTypeFromMetadata(meta),
      required: meta.isRequired === true, // Explicit boolean check, no default
      disabled: (meta as { disabled?: boolean }).disabled === true, // Explicit boolean check, no default
      readOnly: (meta as { readOnly?: boolean }).readOnly === true, // Explicit boolean check, no default
      helpText: (meta as { helpText?: string }).helpText, // No default - undefined if not in metadata
    }
  }

  const createFieldContext = (fieldKey: GlobalFieldKey<GlobalEntityKey>, entityIdValue: GlobalEntityId): void => {
    const cacheKey = String(fieldKey)
    if (fieldContextCache.value.has(cacheKey)) {
      return
    }

    // WHY: useField from vee-validate requires a component instance (uses lifecycle hooks like onMounted, provide)
    // PATTERN: Verify component instance exists, defer if not available
    const instance = getCurrentInstance()
    if (!instance) {
      // PATTERN: Use nextTick to defer context creation until component context is guaranteed
      nextTick(() => {
        createFieldContext(fieldKey, entityIdValue)
      })
      return
    }

    // WHY: useField requires component instance (for lifecycle hooks), not effect scope
    // PATTERN: Call useFieldContext directly when component instance is available
    try {
      const buildContext = () => {
        // PATTERN: Check instance before calling useFieldContext
        const currentInstance = getCurrentInstance()
        if (!currentInstance) {
          throw new Error(`[useFormFieldsContext] Lost component instance while creating context for ${fieldKey}`)
        }

        const currentFormInstance = formInstance.value
        if (!currentFormInstance) {
          throw new Error(`[useFormFieldsContext] Form instance not ready for field ${fieldKey}`)
        }

        const fieldContext = useFieldContext(
          fieldKey as GlobalFieldKey<typeof entityKey>,
          entityKey,
          entityIdValue,
          {
            form: currentFormInstance,
            displayConfig: getFieldDisplayConfig(fieldKey),
          }
        ) as FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>

        fieldContextCache.value.set(cacheKey, fieldContext)
        // PATTERN: triggerRef forces recompute for dependent computed values
        triggerRef(fieldContextCache)
      }

      if (appInstance?.runWithContext) {
        appInstance.runWithContext(buildContext)
      } else {
        buildContext()
      }
    } catch (error) {
      logger.error('Error creating context for field', { entityKey, entityIdValue, fieldKey, error })
      // PATTERN: Log error but don't crash - allow retry
    }
  }

  const createContextsForFields = (): void => {
    if (!isFormReady.value) {
      const currentFormInstance = formInstance.value
      logger.warn('Cannot create contexts - form not ready', {
        entityKey,
        entityId: currentEntityId.value,
        hasFormInstance: !!currentFormInstance,
        providedFormValue: !!providedForm?.value,
        formValues: currentFormInstance?.values
      })
      return
    }

    const fieldsToCreate = fieldsNeedingContexts.value
    const entityIdValue = currentEntityId.value

    if (fieldsToCreate && fieldsToCreate.length > 0) {
      fieldsToCreate.forEach((fieldKey) => {
        createFieldContext(fieldKey, entityIdValue)
      })
    }
  }

  // PATTERN: Eager creation from initial field keys, then watchEffect to catch async metadata loads
  createContextsForFields()
  
  // PATTERN: watchEffect runs in current injection context, so useFieldContext calls are valid
  watchEffect(() => {
    const fieldsToCreate = fieldsNeedingContexts.value
    if (fieldsToCreate && fieldsToCreate.length > 0) {
      createContextsForFields()
    }
  })

  // PATTERN: Field contexts are cleaned up automatically when component unmounts

  const getFieldContext = <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    fieldKey: FieldKey
  ): FieldContextType<GE, FieldKey> | undefined => {
    const cacheKey = String(fieldKey)
    const context = fieldContextCache.value.get(cacheKey)

    if (!context) {
      return undefined
    }

    return context as FieldContextType<GE, FieldKey>
  }

  // PATTERN: Return the form instance (provided when ready, or fallback if none provided)
  return {
    adminConfig,
    formInstance: (formInstance.value || fallbackForm)!,
    currentEntityId,
    isFormReady,
    fieldContextCache,
    fieldsNeedingContexts,
    getFieldContext,
  }
}


