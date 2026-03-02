import type { AxiosError } from 'axios'
import { computed, ref, toRaw } from 'vue'
import { useField, useForm, type FieldOptions } from 'vee-validate'
import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import { NULL_UUID } from '@shared/constants/globalConfigIds'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import { usePrimitiveMutation } from '@/composables/entityCrud/usePrimitiveMutation'
import { useAdmin } from '@/composables/admin/useAdmin'
import { createLogger } from '@/utils/logger'
import { asEmptyObject, asEmptyString } from '@/utils/safeDefaults'
import { getEntityByIdEndpoint } from '@/utils/api'
import apiClient from '@/utils/api'
import {
  saveComponentEntityField,
  saveRelationshipField,
  saveRegularField
} from '@/utils/fieldContext/fieldContextSaveHelpers'
import { useComponentEntity } from '@/composables/useComponentEntity'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import type { FieldDisplayConfig, FieldValidationRules } from './types'
import type {
  UseFieldContextStateOptions,
  UseFieldContextStateReturn,
  UseFieldContextStateReturnGrouped,
} from '@/types/fieldContext/fieldContextState'

const logger = createLogger('useFieldContextState')

/**
 * WHY: State + actions module for `useFieldContext` (single field context core).
 */
export function useFieldContextState<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldKey: FieldKey,
  entityKey: GE,
  entityId: GlobalEntityId,
  options?: UseFieldContextStateOptions<GE, FieldKey>
): UseFieldContextStateReturnGrouped<GE, FieldKey> {
  const resolvedOptions = asEmptyObject(options as Record<string, unknown> | null | undefined) as UseFieldContextStateOptions<GE, FieldKey>
  const {
    form,
    displayConfig: providedDisplayConfig = {},
    validationRules: providedValidationRules = {},
    initialValue: explicitInitialValue,
  } = resolvedOptions

  const isTempEntity = computed(() => {
    if (!entityId) return true
    return String(entityId).startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
  })

  const adminComp = useAdmin()

  const composedEntityComposable =
    String(fieldKey) === 'instanceComponents' && entityKey === 'blockInstance' ? useComponentEntity('blockInstance') : null

  const entity = computed(() => {
    if (isTempEntity.value) {
      return undefined
    }
    return adminComp.getEntity(entityKey, entityId)
  })

  // PATTERN: Use useEntityMetadata to get inputConfig.globalField if available
  // PATTERN: Map undefined to null and cast AdminObject to GlobalEntity (they're compatible)
  const entityForMetadata = computed(() => {
    const entityValue = entity.value
    if (!entityValue) return null
    return entityValue as GlobalEntity<GE>
  })
  const { fieldMetadata } = useEntityMetadata(entityKey, entityForMetadata)
  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldKey)]
  })
  
  // PATTERN: Check inputConfig.globalField first, fallback to fieldKey
  const actualPropertyName = computed(() => {
    const metadata = fieldMetadataEntry.value
    if (metadata?.inputConfig && typeof metadata.inputConfig === 'object') {
      const inputConfig = metadata.inputConfig as Record<string, unknown>
      if (inputConfig.globalField && typeof inputConfig.globalField === 'string') {
        return inputConfig.globalField
      }
    }
    return String(fieldKey)
  })

  const entityValue = computed<ValidAdminValue>(() => {
    if (isTempEntity.value) {
      return ''
    }

    if (composedEntityComposable) {
      const components = composedEntityComposable.data.getComponents(entityId)
      return components.map((ea) => ea.childId)
    }

    const currentEntity = entity.value as Record<string, unknown> | undefined
    if (!currentEntity) {
      return ''
    }

    // PATTERN: Read from actualPropertyName which checks inputConfig.globalField
    const propertyName = actualPropertyName.value
    if (Object.prototype.hasOwnProperty.call(currentEntity, propertyName)) {
      const propValue = (currentEntity as Record<string, unknown>)[propertyName]
      if (propValue == null) return '' as ValidAdminValue
      return asEmptyString(propValue as string) as ValidAdminValue
    }
    return ''
  })

  const formInstance = form || useForm()

  const getInitialValue = (): ValidAdminValue => {
    if (explicitInitialValue !== undefined) {
      return explicitInitialValue
    }

    // PATTERN: Check form.values first (form handles initial values via resetForm)
    if (formInstance && formInstance.values) {
      const formValues = formInstance.values
      if (formValues && typeof formValues === 'object') {
        const formValue = (formValues as Record<string, unknown>)[String(fieldKey)]
        if (formValue !== undefined && formValue !== null) {
          return formValue as ValidAdminValue
        }
      }
    }

    return entityValue.value
  }

  const initialValue = getInitialValue()

  const validationRulesObject = (() => {
    const rules: Partial<FieldValidationRules> = {}
    const { required, minLength, maxLength, min, max, pattern, validate } = providedValidationRules

    if (required !== undefined && required !== null) {
      rules.required = required
    }
    if (minLength !== undefined && minLength !== null) {
      rules.minLength = minLength
    }
    if (maxLength !== undefined && maxLength !== null) {
      rules.maxLength = maxLength
    }
    if (min !== undefined && min !== null) {
      rules.min = min
    }
    if (max !== undefined && max !== null) {
      rules.max = max
    }
    if (pattern !== undefined && pattern !== null) {
      rules.pattern = pattern instanceof RegExp ? pattern.source : pattern
    }
    if (validate !== undefined && validate !== null) {
      rules.validate = validate
    }

    return rules
  })()

  const hasRules = Object.keys(validationRulesObject).length > 0
  const rules = hasRules ? validationRulesObject : undefined

  const fieldOptions: FieldOptions<ValidAdminValue> = {
    form: formInstance,
    initialValue: (initialValue != null ? initialValue : '') as ValidAdminValue,
    validateOnValueUpdate: true,
  }

  const { value, errorMessage, meta, handleChange, setValue: setFieldValue, validate: validateField } = useField<ValidAdminValue>(
    fieldKey as string,
    rules,
    fieldOptions
  )

  const error = computed(() => errorMessage.value)
  const isValid = computed(() => meta.valid)
  const isDirty = computed(() => meta.dirty)
  const isValidating = ref(false)
  const isFocused = ref(false)

  // PATTERN: Fail explicitly when required properties are missing
  const hasProvidedLabel = providedDisplayConfig.label !== undefined && providedDisplayConfig.label !== null
  const hasProvidedFieldType = providedDisplayConfig.fieldType !== undefined && providedDisplayConfig.fieldType !== null

  if (!hasProvidedLabel || !hasProvidedFieldType) {
    const error = new Error(
      `[useFieldContextState] Missing required displayConfig for ${String(entityKey)}.${String(fieldKey)}. ` +
      `Expected label and fieldType from metadata. Field must be configured in /admin-metadata.`
    )
    logger.error('Missing required displayConfig', { entityKey, fieldKey, error })
    throw error
  }

  // PATTERN: Use providedDisplayConfig properties directly, no fallbacks
  const isDisabled = ref(providedDisplayConfig.disabled === true) // Explicit boolean, no default

  const displayConfig: FieldDisplayConfig<GE, FieldKey> = {
    label: providedDisplayConfig.label!,
    placeholder: providedDisplayConfig.placeholder ?? undefined, // No default - undefined if not provided
    helpText: providedDisplayConfig.helpText ?? undefined, // No default - undefined if not provided
    required: providedDisplayConfig.required === true, // Explicit boolean, no default
    disabled: providedDisplayConfig.disabled === true, // Explicit boolean, no default
    readOnly: providedDisplayConfig.readOnly === true, // Explicit boolean, no default
    fieldType: providedDisplayConfig.fieldType!,
    displayOrder: providedDisplayConfig.displayOrder, // No default - undefined if not provided
  }

  // PATTERN: Use providedValidationRules directly, no default required: false
  const validationRules: FieldValidationRules = {
    ...providedValidationRules,
  }

  const queryClient = useQueryClient()
  const { mutateAsync: patchFieldAsync } = usePrimitiveMutation(entityKey)

  const toPlainValue = (raw: unknown): unknown => toRaw(raw)

  // PATTERN: Actions (merged from useFieldContextActions) close over state
  const setFocus = (focused: boolean): void => {
    isFocused.value = focused
  }

  const validate = async (): Promise<boolean> => {
    isValidating.value = true
    try {
      await validateField()
      return isValid.value
    } finally {
      isValidating.value = false
    }
  }

  const clearError = (): void => {
    handleChange(value.value)
  }

  const save = async (): Promise<void> => {
    if (!isDirty.value) {
      return
    }

    const entityIdString = String(entityId)
    const isTempEntityId = entityIdString.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
    const isPlaceholderEntity = entityIdString === NULL_UUID

    if (isTempEntityId || isPlaceholderEntity) {
      return
    }

    const currentEntity = entity.value as { id?: string; name?: string; entityKey?: string } | undefined

    try {
      const verifyEndpoint = getEntityByIdEndpoint(entityKey, entityIdString)
      await apiClient.get(verifyEndpoint)
    } catch (verifyError: unknown) {
      logger.error('Entity verify failed', { error: verifyError })
      const axiosError = verifyError as AxiosError<{ error?: string; id?: string }>

      if (axiosError.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: [entityKey] })
        queryClient.invalidateQueries({ queryKey: ['globalData'] })
        throw new Error(
          `Entity ${entityKey} with ID ${entityId} does not exist on server. Cache will be refreshed.`
        )
      }
      throw axiosError
    }

    if (!currentEntity) {
      const errorMessage = `Cannot save field ${String(fieldKey)}: Entity ${entityKey} with ID ${entityId} not found in store`
      throw new Error(errorMessage)
    }

    if (!entityIdString || entityIdString.trim() === '') {
      const errorMessage = `Invalid entity ID: ${entityIdString}`
      throw new Error(errorMessage)
    }

    try {
      const isValidResult = await validate()
      if (!isValidResult) {
        throw new Error(`Validation failed for field ${String(fieldKey)}`)
      }

      const fieldKeyString = String(fieldKey)

      if (composedEntityComposable) {
        await saveComponentEntityField({
          state: stateForSaveHelpers,
          currentEntity
        })
        return
      }

      const isRelationshipField = fieldKeyString in RELATIONSHIP_KEYS

      if (isRelationshipField) {
        await saveRelationshipField({
          state: stateForSaveHelpers,
          currentEntity,
          fieldKeyString,
          queryClient
        })
      } else {
        await saveRegularField({
          state: stateForSaveHelpers,
          queryClient
        })
      }
    } catch (error) {
      logger.error('Field context save failed', { error })
      const errorMessage = error instanceof Error ? error.message : String(error)
      const is404Error = errorMessage.includes('404') || errorMessage.includes('not found')

      if (is404Error) {
        queryClient.invalidateQueries({ queryKey: [entityKey] })
        queryClient.invalidateQueries({ queryKey: ['globalData'] })

        const originalValue = entityValue.value
        handleChange(originalValue)

        throw new Error(`This ${entityKey} was deleted or no longer exists. The page will refresh automatically.`)
      }
      throw error
    }
  }

  const reset = (): void => {
    const currentEntityValue = entityValue.value
    handleChange(currentEntityValue)
  }

  const getValue = (): ValidAdminValue => value.value

  const setValueAction = (newValue: ValidAdminValue): void => {
    setFieldValue(newValue)
  }

  // Snapshot for save helpers (they expect UseFieldContextStateReturn shape)
  const stateForSaveHelpers: UseFieldContextStateReturn<GE, FieldKey> = {
    fieldKey,
    entityKey,
    entityId,
    isTempEntity,
    adminComp,
    entity,
    entityValue,
    composedEntityComposable,
    formInstance,
    value,
    error,
    isValid,
    isDirty,
    validateField,
    setValue: setFieldValue,
    handleChange: (nextValue: ValidAdminValue) => handleChange(nextValue),
    isValidating,
    isFocused,
    isDisabled,
    displayConfig,
    validationRules,
    queryClient,
    patchFieldAsync,
    toPlainValue,
  }

  return {
    state: stateForSaveHelpers,
    actions: {
      setFocus,
      validate,
      clearError,
      save,
      reset,
      getValue,
      setValue: setValueAction,
    },
  }
}
