import { computed, ref, toRaw, type Ref, type ComputedRef } from 'vue'
import { useField, useForm, type FieldOptions } from 'vee-validate'
import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId, GlobalEntity } from '@/types/entities'
import { usePrimitiveMutation } from '@/composables/useEntity'
import { useAdmin } from '@/composables/useAdmin'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFieldContextState')
import { useComponentEntity } from '@/composables/useComponentEntity'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import type { FieldDisplayConfig, FieldValidationRules } from './types'

export type UseFieldContextStateOptions<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
  form?: ReturnType<typeof useForm>
  displayConfig?: Partial<FieldDisplayConfig<GE, FieldKey>>
  validationRules?: FieldValidationRules
  initialValue?: ValidAdminValue
}

export type UseFieldContextStateReturn<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
  fieldKey: FieldKey
  entityKey: GE
  entityId: GlobalEntityId

  isTempEntity: ComputedRef<boolean>
  adminComp: ReturnType<typeof useAdmin>
  entity: ComputedRef<unknown>
  entityValue: ComputedRef<ValidAdminValue>
  composedEntityComposable: ReturnType<typeof useComponentEntity> | null

  // Vee-Validate field state
  formInstance: ReturnType<typeof useForm>
  value: Ref<ValidAdminValue>
  error: ComputedRef<string | undefined>
  isValid: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>
  validateField: () => Promise<unknown>
  handleChange: (value: ValidAdminValue) => void
  setValue: (value: ValidAdminValue) => void

  isValidating: Ref<boolean>
  isFocused: Ref<boolean>
  isDisabled: Ref<boolean>
  displayConfig: FieldDisplayConfig<GE, FieldKey>
  validationRules: FieldValidationRules

  queryClient: ReturnType<typeof useQueryClient>
  patchFieldAsync: (payload: { admin: { key: string; value: ValidAdminValue }; dynamicId: string }) => Promise<unknown>

  toPlainValue: (value: unknown) => unknown
}

/**
 * State module for `useFieldContext`.
 *
 * LEARNING: Holds all derived state + vee-validate wiring, but no save/relationship side effects.
 * WHY: Makes the facade composable smaller and easier to reason about.
 */
export function useFieldContextState<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldKey: FieldKey,
  entityKey: GE,
  entityId: GlobalEntityId,
  options?: UseFieldContextStateOptions<GE, FieldKey>
): UseFieldContextStateReturn<GE, FieldKey> {
  const {
    form,
    displayConfig: providedDisplayConfig = {},
    validationRules: providedValidationRules = {},
    initialValue: explicitInitialValue,
  } = options || {}

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
  // LEARNING: Convert AdminObject to GlobalEntity for useEntityMetadata
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
      const components = composedEntityComposable.getComponents(entityId)
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
      return (propValue as ValidAdminValue | undefined) ?? ''
    }
    return ''
  })

  const formInstance = form || useForm()

  const getInitialValue = (): ValidAdminValue => {
    // LEARNING: Explicit initialValue takes precedence (per vee-validate pattern)
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
    initialValue: (initialValue ?? '') as ValidAdminValue,
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
      `Expected label and fieldType from metadata. Field must be configured in /admin-input-metadata.`
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

  //      Form-level syncing in EntityCard handles all field updates using Vee-Validate's built-in API
  // PATTERN: Let form manage all field syncing, fields just react to form state

  return {
    fieldKey,
    entityKey,
    entityId,
    isTempEntity,
    adminComp,
    entity,
    entityValue,
    composedEntityComposable,
    formInstance,
    value: value as Ref<ValidAdminValue>,
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
}


