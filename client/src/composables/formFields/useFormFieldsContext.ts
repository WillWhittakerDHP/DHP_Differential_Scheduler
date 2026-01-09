import { computed, getCurrentInstance, ref, watch, type Ref, type ComputedRef } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import { useFieldContext, type FieldContextType } from '@/composables/useFieldContext'
import { getFieldMetadata } from '@/composables/useFieldMetadata'
import { useAdminConfig } from '@/composables/useAdminConfig'

type UseFormFieldsContextOptions = {
  entityKey: GlobalEntityKey
  entityId: Ref<GlobalEntityId>
  visibleFields: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
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
  const { entityKey, entityId, visibleFields, form: providedForm, adminConfig: providedAdminConfig } = options

  const adminConfig = providedAdminConfig || useAdminConfig()

  const formInstance = providedForm ? (providedForm.value || useForm()) : useForm()

  const fieldContextCache = ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>(new Map()) as unknown as Ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>

  const tempEntityId = ref<GlobalEntityId>(('new-' + Date.now()) as GlobalEntityId)

  const currentEntityId = computed(() => {
    return entityId.value || tempEntityId.value
  })

  const isFormReady = computed(() => {
    if (!formInstance) return false
    if (providedForm?.value) {
      return formInstance.values !== undefined && formInstance.values !== null && typeof formInstance.values === 'object'
    }
    return true
  })

  const fieldsNeedingContexts = computed<GlobalFieldKey<GlobalEntityKey>[]>(() => {
    if (!isFormReady.value) return []
    const fields = visibleFields.value || []
    return fields.filter((fieldKey) => !fieldContextCache.value.has(String(fieldKey)))
  })

  const createFieldContext = (fieldKey: string, entityIdValue: GlobalEntityId): void => {
    const cacheKey = String(fieldKey)
    if (fieldContextCache.value.has(cacheKey)) return

    const fieldMetadata = getFieldMetadata(entityKey, fieldKey as GlobalFieldKey<typeof entityKey>, adminConfig)

    const fieldContext = useFieldContext(
      fieldKey as GlobalFieldKey<typeof entityKey>,
      entityKey,
      entityIdValue,
      {
        form: formInstance,
        displayConfig: {
          label: fieldMetadata.label,
          placeholder: fieldMetadata.placeholder,
          fieldType: fieldMetadata.fieldType,
          required: fieldMetadata.required,
          disabled: fieldMetadata.disabled,
          readOnly: fieldMetadata.readOnly,
          helpText: fieldMetadata.helpText,
        },
        logger: undefined,
      }
    ) as unknown as FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>

    fieldContextCache.value.set(cacheKey, fieldContext)
  }

  const createContextsForFields = (): void => {
    if (!isFormReady.value) return

    const instance = getCurrentInstance()
    if (!instance) {
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

  createContextsForFields()

  watch([fieldsNeedingContexts, isFormReady], () => {
    createContextsForFields()
  })

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


