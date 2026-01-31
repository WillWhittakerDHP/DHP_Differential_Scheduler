import { computed, ref, toRaw, type Ref, type ComputedRef } from 'vue'
import { useField, useForm, type FieldOptions } from 'vee-validate'
import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId, GlobalEntity } from '@/types/entities'
import { usePrimitiveMutation } from '@/composables/useEntity'
import { useAdmin } from '@/composables/useAdmin'
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
  // Inputs
  fieldKey: FieldKey
  entityKey: GE
  entityId: GlobalEntityId

  // Derived identity/state
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

  // UI-ish state
  isValidating: Ref<boolean>
  isFocused: Ref<boolean>
  isDisabled: Ref<boolean>
  displayConfig: FieldDisplayConfig<GE, FieldKey>
  validationRules: FieldValidationRules

  // Mutations
  queryClient: ReturnType<typeof useQueryClient>
  patchFieldAsync: (payload: { admin: { key: string; value: ValidAdminValue }; dynamicId: string }) => Promise<unknown>

  // Utilities
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
    return String(entityId).startsWith('new-')
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

  // LEARNING: Get field metadata to check for globalField mapping
  // WHY: Some fields (like attendeeAssignments) use globalField to map to different property names (attendees)
  // PATTERN: Use useEntityMetadata to get inputConfig.globalField if available
  // LEARNING: Convert AdminObject to GlobalEntity for useEntityMetadata
  // WHY: useEntityMetadata expects GlobalEntity | null, but entity is AdminObject | undefined
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
  
  // LEARNING: Determine the actual property name to read from entity
  // WHY: Some fields use globalField in inputConfig to map to different property names
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
      const components = composedEntityComposable.getComponents(String(entityId))
      return components.map((ea) => ea.childId)
    }

    const currentEntity = entity.value as Record<string, unknown> | undefined
    if (!currentEntity) {
      return ''
    }

    // LEARNING: Use actualPropertyName instead of fieldKey to handle globalField mappings
    // WHY: attendeeAssignments field maps to 'attendees' property via globalField
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
    // WHY: If caller provides explicit initialValue, use it
    if (explicitInitialValue !== undefined) {
      return explicitInitialValue
    }

    // LEARNING: Read from form's values (per vee-validate best practices)
    // WHY: Fields should get initial values from form, not directly from entity
    //      When form.resetForm() is called, it updates form.values, and fields should read from there
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

    // LEARNING: Fallback to entityValue only if form doesn't have the value
    // WHY: This handles cases where field is created before form is initialized
    //      But form.resetForm() should update form.values, so this is just a fallback
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

  // LEARNING: NO FALLBACKS - displayConfig must be complete from metadata
  // WHY: Metadata is the single source of truth - missing config is a configuration error
  // PATTERN: Fail explicitly when required properties are missing
  const hasProvidedLabel = providedDisplayConfig.label !== undefined && providedDisplayConfig.label !== null
  const hasProvidedFieldType = providedDisplayConfig.fieldType !== undefined && providedDisplayConfig.fieldType !== null

  if (!hasProvidedLabel || !hasProvidedFieldType) {
    const error = new Error(
      `[useFieldContextState] Missing required displayConfig for ${String(entityKey)}.${String(fieldKey)}. ` +
      `Expected label and fieldType from metadata. Field must be configured in /admin-input-metadata.`
    )
    console.error(error)
    throw error
  }

  // LEARNING: NO DEFAULTS - use provided values directly
  // WHY: Metadata is authoritative - if property doesn't exist, it's undefined (not a default)
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

  // LEARNING: NO DEFAULTS - validation rules come from metadata or are undefined
  // WHY: Validation rules should be explicitly configured, not defaulted
  // PATTERN: Use providedValidationRules directly, no default required: false
  const validationRules: FieldValidationRules = {
    ...providedValidationRules,
  }

  const queryClient = useQueryClient()
  const { mutateAsync: patchFieldAsync } = usePrimitiveMutation(entityKey)

  const toPlainValue = (raw: unknown): unknown => toRaw(raw)

  // LEARNING: Field-level watch removed - use form-level methods instead
  // WHY: Vee-Validate automatically syncs useField() instances when resetForm() or setFieldValue() is called
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


