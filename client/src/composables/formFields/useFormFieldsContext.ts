import { computed, getCurrentInstance, ref, triggerRef, watchEffect, nextTick, type Ref, type ComputedRef } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import { useFieldContext, type FieldContextType } from '@/composables/useFieldContext'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useNotification } from '@/composables/useNotification'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

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

/**
 * State module: manages form instance + FieldContext cache creation.
 */
export function useFormFieldsContext(options: UseFormFieldsContextOptions): UseFormFieldsContextReturn {
  const { entityKey, entityId, fieldKeys, fieldMetadata: providedFieldMetadata, form: providedForm, adminConfig: providedAdminConfig } = options

  const adminConfig = providedAdminConfig || useAdminConfig()
  const { warning: showWarning } = useNotification()
  const appInstance = getCurrentInstance()?.appContext.app

  const formInstance = providedForm ? (providedForm.value || useForm()) : useForm()

  const fieldContextCache = ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>(new Map()) as unknown as Ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>

  // LEARNING: Track fields that have already shown warnings to avoid spam
  // WHY: Prevent duplicate warnings for the same missing metadata field
  // PATTERN: Set to track warned fields
  const warnedFields = ref<Set<string>>(new Set())

  // LEARNING: Removed effectScope tracking - useField requires component instance, not effect scope
  // WHY: effectScope() doesn't preserve component instance, which useField needs for lifecycle hooks
  // PATTERN: Verify component instance exists before calling useFieldContext

  const tempEntityId = ref<GlobalEntityId>(('new-' + Date.now()) as GlobalEntityId)

  const currentEntityId = computed(() => {
    return entityId.value || tempEntityId.value
  })

  const isFormReady = computed(() => {
    if (!formInstance) {
      console.warn(`[useFormFieldsContext] Form instance is null:`, { entityKey, entityId: currentEntityId.value })
      return false
    }
    if (providedForm?.value) {
      const hasValues = formInstance.values !== undefined && formInstance.values !== null && typeof formInstance.values === 'object'
      if (!hasValues) {
        console.warn(`[useFormFieldsContext] Form not ready - values not initialized:`, {
          entityKey,
          entityId: currentEntityId.value,
          hasFormInstance: !!formInstance,
          hasProvidedForm: !!providedForm?.value,
          formValuesType: typeof formInstance.values,
          formValues: formInstance.values
        })
      }
      return hasValues
    }
    return true
  })

  // LEARNING: Computed to check if metadata is ready (both input and relationship metadata loaded)
  // WHY: Gate warnings until metadata is fully loaded and can be meaningfully displayed
  // PATTERN: Check both metadata sources are loaded and merged metadata has keys
  const isMetadataReady = computed(() => {
    const metadata = providedFieldMetadata?.value
    const hasMetadata = !!metadata && Object.keys(metadata).length > 0
    // If metadata is provided via prop, assume it's ready (parent component handles loading)
    // Otherwise, check that we have some metadata keys (even if empty, that's still "ready")
    return hasMetadata || providedFieldMetadata !== undefined
  })

  const fieldsNeedingContexts = computed<GlobalFieldKey<GlobalEntityKey>[]>(() => {
    if (!isFormReady.value) return []
    const metadata = providedFieldMetadata?.value
    const metadataKeys = metadata ? Object.keys(metadata) : []
    const baseKeys = fieldKeys.value || []
    const combinedKeys = Array.from(new Set([...baseKeys, ...metadataKeys])) as GlobalFieldKey<GlobalEntityKey>[]

    // LEARNING: Only warn for missing metadata after metadata is ready
    // WHY: Suppress warnings during async loading - wait until metadata can be meaningfully displayed
    // PATTERN: Gate warnings on isMetadataReady
    if (isMetadataReady.value && metadata) {
      combinedKeys.forEach((fieldKey) => {
        const fieldKeyStr = String(fieldKey)
        if (!(fieldKeyStr in metadata) && !warnedFields.value.has(fieldKeyStr)) {
          const warningMessage = `Missing FieldMetadataEntry for ${entityKey}.${fieldKeyStr}. Field must be configured in /admin-input-metadata or /admin-relationship-metadata before rendering.`
          console.warn(`[useFormFieldsContext] ${warningMessage}`)
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
    // LEARNING: fieldType is about data type, not rendering
    // WHY: renderAs is handled by component dispatcher, not form field context
    // PATTERN: Base fieldType on dataType only
    
    // Select-like fields are not rendered by PrimitiveInputs, but we still set a sensible type for displayConfig
    if (meta.renderAs === 'multiselect') return 'multiselect'
    if (meta.renderAs === 'select' || meta.renderAs === 'reference') return 'select'

    // LEARNING: Base fieldType on dataType - component dispatcher handles renderAs
    // WHY: fieldType describes the data, renderAs describes how to render it
    // PATTERN: Check dataType to determine fieldType
    if (meta.dataType === 'boolean') return 'boolean'
    if (meta.dataType === 'number') return 'number'
    if (meta.dataType === 'date') return 'date'

    // Default to text for string/array/reference
    return 'text'
  }

  const getFieldDisplayConfig = (fieldKey: string): FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>['displayConfig'] => {
    const metadata = providedFieldMetadata?.value
    const hasMetadataKeys = !!metadata && Object.keys(metadata).length > 0
    
    // LEARNING: Only warn for empty metadata after metadata is ready
    // WHY: Suppress warnings during async loading - wait until metadata can be meaningfully displayed
    // PATTERN: Gate warnings on isMetadataReady
    if (!hasMetadataKeys && isMetadataReady.value) {
      const warningKey = `${entityKey}:metadata-empty`
      if (!warnedFields.value.has(warningKey)) {
        const warningMessage = `Missing fieldMetadata for ${entityKey}. Field metadata must be provided from /admin-input-metadata or /admin-relationship-metadata.`
        console.warn(`[useFormFieldsContext] ${warningMessage}`)
        showWarning(warningMessage, 6000)
        warnedFields.value.add(warningKey)
      }
      // Return fallback config to prevent crashes
      return {
        fieldType: 'text',
        label: fieldKey,
        placeholder: '',
        required: false,
        disabled: false,
      }
    }
    
    // LEARNING: Return fallback if metadata not ready yet (suppress warnings during loading)
    // WHY: Don't warn or crash while metadata is still loading
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

    // LEARNING: Only warn for missing field metadata after metadata is ready
    // WHY: Suppress warnings during async loading - wait until metadata can be meaningfully displayed
    // PATTERN: Gate warnings on isMetadataReady
    if (!meta && isMetadataReady.value) {
      const warningMessage = `Missing FieldMetadataEntry for ${entityKey}.${fieldKey}. Field must be configured in /admin-input-metadata or /admin-relationship-metadata before rendering.`
      console.warn(`[useFormFieldsContext] ${warningMessage}`)
      if (!warnedFields.value.has(fieldKey)) {
        showWarning(warningMessage, 6000)
        warnedFields.value.add(fieldKey)
      }
      // Return fallback config to prevent crashes
      return {
        fieldType: 'text',
        label: fieldKey,
        placeholder: '',
        required: false,
        disabled: false,
      }
    }

    // LEARNING: Return fallback if field metadata not found yet (suppress warnings during loading)
    // WHY: Don't warn or crash while metadata is still loading
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

    // LEARNING: Warn for missing label but don't throw - use fallback
    // WHY: User requested warnings instead of crashes
    // PATTERN: Warn and use fallback value
    if (!meta.label) {
      const warningMessage = `Missing label in FieldMetadataEntry for ${entityKey}.${fieldKey}. Metadata should include label property.`
      console.warn(`[useFormFieldsContext] ${warningMessage}`)
      if (!warnedFields.value.has(`${fieldKey}:label`)) {
        showWarning(warningMessage, 6000)
        warnedFields.value.add(`${fieldKey}:label`)
      }
    }

    // LEARNING: Use metadata values with fallbacks for missing properties
    // WHY: User requested warnings instead of crashes - provide sensible defaults
    // PATTERN: Use metadata properties with fallbacks for required fields
    return {
      label: meta.label || fieldKey, // Fallback to fieldKey if label missing
      placeholder: (meta as { placeholder?: string }).placeholder, // No default - undefined if not in metadata
      fieldType: getFieldTypeFromMetadata(meta),
      required: meta.isRequired === true, // Explicit boolean check, no default
      disabled: (meta as { disabled?: boolean }).disabled === true, // Explicit boolean check, no default
      readOnly: (meta as { readOnly?: boolean }).readOnly === true, // Explicit boolean check, no default
      helpText: (meta as { helpText?: string }).helpText, // No default - undefined if not in metadata
    }
  }

  const createFieldContext = (fieldKey: string, entityIdValue: GlobalEntityId): void => {
    const cacheKey = String(fieldKey)
    if (fieldContextCache.value.has(cacheKey)) {
      return
    }

    // LEARNING: Check for component instance BEFORE creating context
    // WHY: useField from vee-validate requires a component instance (uses lifecycle hooks like onMounted, provide)
    //      If no instance is available, defer creation to nextTick
    // PATTERN: Verify component instance exists, defer if not available
    const instance = getCurrentInstance()
    if (!instance) {
      // LEARNING: Defer context creation to nextTick if no component instance
      // WHY: watchEffect may run after setup completes, so we defer to ensure component instance is available
      // PATTERN: Use nextTick to defer context creation until component context is guaranteed
      nextTick(() => {
        createFieldContext(fieldKey, entityIdValue)
      })
      return
    }

    // LEARNING: Create field context directly without effectScope
    // WHY: useField requires component instance (for lifecycle hooks), not effect scope
    //      Component instance is verified above, so useField should work
    // PATTERN: Call useFieldContext directly when component instance is available
    try {
      const buildContext = () => {
        // LEARNING: Verify component instance is still available
        // WHY: getCurrentInstance() should work if we're still in component setup/watchEffect
        // PATTERN: Check instance before calling useFieldContext
        const currentInstance = getCurrentInstance()
        if (!currentInstance) {
          throw new Error(`[useFormFieldsContext] Lost component instance while creating context for ${fieldKey}`)
        }

        const fieldContext = useFieldContext(
          fieldKey as GlobalFieldKey<typeof entityKey>,
          entityKey,
          entityIdValue,
          {
            form: formInstance,
            displayConfig: getFieldDisplayConfig(fieldKey),
            logger: undefined,
          }
        ) as unknown as FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>

        fieldContextCache.value.set(cacheKey, fieldContext)
        // LEARNING: Map mutations aren't reactive by default
        // WHY: Vue doesn't track Map.set() for computed invalidation
        // PATTERN: triggerRef forces recompute for dependent computed values
        triggerRef(fieldContextCache)
      }

      if (appInstance?.runWithContext) {
        appInstance.runWithContext(buildContext)
      } else {
        buildContext()
      }
    } catch (error) {
      console.error(`[useFormFieldsContext] ${entityKey} ${entityIdValue} - Error creating context for ${fieldKey}:`, error)
      // LEARNING: Don't throw - let watchEffect retry on next reactive update
      // WHY: If metadata loads later, watchEffect will trigger again and retry context creation
      // PATTERN: Log error but don't crash - allow retry
    }
  }

  const createContextsForFields = (): void => {
    if (!isFormReady.value) {
      console.warn(`[useFormFieldsContext] Cannot create contexts - form not ready:`, {
        entityKey,
        entityId: currentEntityId.value,
        hasFormInstance: !!formInstance,
        providedFormValue: !!providedForm?.value,
        formValues: formInstance?.values
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

  // LEARNING: Create contexts once in setup, then watch for new fields
  // WHY: useFieldContext must run in setup/injection context (watchEffect runs in current context)
  // PATTERN: Eager creation from initial field keys, then watchEffect to catch async metadata loads
  createContextsForFields()
  
  // LEARNING: Watch for new fields that need contexts (e.g., when relationship metadata loads)
  // WHY: Relationship metadata loads asynchronously, so fieldKeys updates after initial setup
  // PATTERN: watchEffect runs in current injection context, so useFieldContext calls are valid
  watchEffect(() => {
    const fieldsToCreate = fieldsNeedingContexts.value
    if (fieldsToCreate && fieldsToCreate.length > 0) {
      createContextsForFields()
    }
  })

  // LEARNING: Removed effectScope cleanup - no longer using effectScope for field contexts
  // WHY: useField requires component instance, not effect scope, so no cleanup needed
  // PATTERN: Field contexts are cleaned up automatically when component unmounts

  const getFieldContext = <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    fieldKey: FieldKey
  ): FieldContextType<GE, FieldKey> | undefined => {
    const cacheKey = String(fieldKey)
    const context = fieldContextCache.value.get(cacheKey)

    if (!context) {
      return undefined
    }

    return context as unknown as FieldContextType<GE, FieldKey>
  }

  return {
    adminConfig,
    formInstance,
    currentEntityId,
    isFormReady,
    fieldContextCache,
    fieldsNeedingContexts,
    getFieldContext,
  }
}


