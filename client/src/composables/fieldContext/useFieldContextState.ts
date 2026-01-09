import { computed, ref, toRaw, type Ref, type ComputedRef } from 'vue'
import { useField, useForm, type FieldOptions } from 'vee-validate'
import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import { usePrimitiveMutation } from '@/composables/useEntity'
import { useAdmin } from '@/composables/useAdmin'
import { getFieldMetadata } from '@/composables/useFieldMetadata'
import type { RenderLogger } from '@/utils/renderLogger'
import { useComponentEntity } from '@/composables/useComponentEntity'
import type { FieldDisplayConfig, FieldValidationRules } from './types'

export type UseFieldContextStateOptions<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
  form?: ReturnType<typeof useForm>
  displayConfig?: Partial<FieldDisplayConfig<GE, FieldKey>>
  validationRules?: FieldValidationRules
  initialValue?: ValidAdminValue
  logger?: RenderLogger
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
    logger,
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

    const fieldKeyString = String(fieldKey)
    if (Object.prototype.hasOwnProperty.call(currentEntity, fieldKeyString)) {
      const propValue = (currentEntity as Record<string, unknown>)[fieldKeyString]
      return (propValue as ValidAdminValue | undefined) ?? ''
    }
    return ''
  })

  const formInstance = form || useForm()

  const getInitialValue = (): ValidAdminValue => {
    if (explicitInitialValue !== undefined) {
      if (logger) {
        logger.logData(`Initial value resolution for ${String(fieldKey)}`, {
          source: 'explicitInitialValue',
          value: explicitInitialValue,
        })
      }
      return explicitInitialValue
    }

    if (formInstance && formInstance.values) {
      const formValues = formInstance.values
      if (formValues && typeof formValues === 'object') {
        const formValue = (formValues as Record<string, unknown>)[String(fieldKey)]
        if (formValue !== undefined && formValue !== null) {
          if (logger) {
            logger.logData(`Initial value resolution for ${String(fieldKey)}`, {
              source: 'form.values',
              formValue,
              entityValue: entityValue.value,
              using: 'formValue',
            })
          }
          return formValue as ValidAdminValue
        }
      }
    }

    const storeValue = entityValue.value
    
    if (logger) {
      logger.logData(`Initial value resolution for ${String(fieldKey)}`, {
        source: 'entityValue (store)',
        formValue:
          formInstance?.values && typeof formInstance.values === 'object'
            ? (formInstance.values as Record<string, ValidAdminValue>)[String(fieldKey)]
            : undefined,
        entityValue: storeValue,
        using: 'entityValue',
      })
    }
    return storeValue
  }

  const initialValue = getInitialValue()

  if (logger) {
    logger.logStep(`Initial value resolved for ${String(fieldKey)}`, {
      initialValue,
      hasForm: !!formInstance,
      formHasValue:
        formInstance?.values && typeof formInstance.values === 'object'
          ? (formInstance.values as Record<string, ValidAdminValue>)[String(fieldKey)] !== undefined
          : false,
    })
  }

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

  const { value, errorMessage, meta, handleChange, validate: validateField } = useField<ValidAdminValue>(
    fieldKey as string,
    rules,
    fieldOptions
  )

  if (logger) {
    logger.logStep(`useField created for ${String(fieldKey)}`, {
      initialValue: value.value,
      hasRules: hasRules,
      formProvided: !!formInstance,
      valueIsRef: value && typeof value === 'object' && 'value' in value,
      valueType: typeof value,
      valueKeys: value && typeof value === 'object' ? Object.keys(value) : [],
      valueValue: value?.value,
      valueValueType: typeof value?.value,
    })
  }

  const error = computed(() => errorMessage.value)
  const isValid = computed(() => meta.valid)
  const isDirty = computed(() => meta.dirty)
  const isValidating = ref(false)
  const isFocused = ref(false)

  const fieldMetadata = getFieldMetadata(entityKey, fieldKey)
  const isDisabled = ref(providedDisplayConfig.disabled ?? fieldMetadata.disabled ?? false)

  const displayConfig: FieldDisplayConfig<GE, FieldKey> = {
    label: providedDisplayConfig.label ?? fieldMetadata.label,
    placeholder: providedDisplayConfig.placeholder ?? fieldMetadata.placeholder,
    helpText: providedDisplayConfig.helpText ?? fieldMetadata.helpText,
    required: providedDisplayConfig.required ?? fieldMetadata.required ?? false,
    disabled: providedDisplayConfig.disabled ?? fieldMetadata.disabled ?? false,
    readOnly: providedDisplayConfig.readOnly ?? fieldMetadata.readOnly ?? false,
    fieldType: providedDisplayConfig.fieldType ?? fieldMetadata.fieldType,
    displayOrder: providedDisplayConfig.displayOrder ?? 0,
  }

  const validationRules: FieldValidationRules = {
    required: false,
    ...providedValidationRules,
  }

  const queryClient = useQueryClient()
  const { mutateAsync: patchFieldAsync } = usePrimitiveMutation(entityKey)

  const toPlainValue = (raw: unknown): unknown => toRaw(raw)

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


