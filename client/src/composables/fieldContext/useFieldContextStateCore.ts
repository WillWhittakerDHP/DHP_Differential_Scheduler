import { computed, ref, toRaw, type ComputedRef } from 'vue'
import { useField, useForm, type FieldOptions } from 'vee-validate'
import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import { NULL_UUID } from '@shared/constants/globalConfigIds'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { usePrimitiveMutation } from '@/composables/entityCrud/usePrimitiveMutation'
import type { UseAdminReturn } from '@/composables/admin/useAdmin'
import { createLogger } from '@/utils/logger'
import { persistFieldContextAfterServerChecks } from '@/utils/fieldContext/fieldContextSaveOrchestration'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import { buildVeeValidationRulesObject } from '@/utils/fieldContext/buildVeeValidationRulesObject'
import {
  assertFieldContextDisplayConfigPresent,
  normalizeFieldDisplayConfigFromProvided,
} from '@/utils/fieldContext/fieldContextDisplayConfigGuard'
import { resolveInitialFieldContextValue } from '@/utils/fieldContext/fieldContextInitialValue'
import { shouldSkipFieldContextPersist } from '@/utils/fieldContext/fieldContextSaveGuards'
import { buildUseFieldContextStateSnapshot } from '@/utils/fieldContext/fieldContextStateSnapshot'
import type { FieldValidationRules } from './types'
import type {
  UseFieldContextStateOptions,
  UseFieldContextStateReturnGrouped,
} from '@/types/fieldContext/fieldContextState'

const logger = createLogger('useFieldContextStateCore')

export interface UseFieldContextStateCoreParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  fieldKey: FieldKey
  entityKey: GE
  entityId: GlobalEntityId
  resolvedOptions: UseFieldContextStateOptions<GE, FieldKey>
  entityValue: ComputedRef<ValidAdminValue>
  entity: ComputedRef<unknown>
  isTempEntity: ComputedRef<boolean>
  composedEntityComposable: ComposedEntityLike | null
  adminComp: UseAdminReturn
}

/**
 * Shared vee-validate + save wiring after entityValue is resolved (cache vs threaded metadata path).
 */
export function useFieldContextStateCore<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: UseFieldContextStateCoreParams<GE, FieldKey>
): UseFieldContextStateReturnGrouped<GE, FieldKey> {
  const {
    fieldKey,
    entityKey,
    entityId,
    resolvedOptions,
    entityValue,
    entity,
    isTempEntity,
    composedEntityComposable,
    adminComp,
  } = params

  const {
    form,
    displayConfig: providedDisplayConfig = {},
    validationRules: providedValidationRules = {},
    initialValue: explicitInitialValue,
  } = resolvedOptions

  const formInstance = form || useForm()

  const initialValue = resolveInitialFieldContextValue(
    explicitInitialValue,
    formInstance,
    fieldKey,
    entityValue.value
  )

  const validationRulesObject = buildVeeValidationRulesObject(providedValidationRules)

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

  assertFieldContextDisplayConfigPresent(providedDisplayConfig, entityKey, fieldKey, (message, metaArg) => {
    logger.error(message, metaArg)
  })

  const isDisabled = ref(providedDisplayConfig.disabled === true)

  const displayConfig = normalizeFieldDisplayConfigFromProvided(providedDisplayConfig)

  const validationRules: FieldValidationRules = {
    ...providedValidationRules,
  }

  const queryClient = useQueryClient()
  const { mutateAsync: patchFieldAsync } = usePrimitiveMutation(entityKey)

  const toPlainValue = (raw: unknown): unknown => toRaw(raw)

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

  const reset = (): void => {
    const currentEntityValue = entityValue.value
    handleChange(currentEntityValue)
  }

  const getValue = (): ValidAdminValue => value.value

  const setValueAction = (newValue: ValidAdminValue): void => {
    setFieldValue(newValue)
  }

  const stateForSaveHelpers = buildUseFieldContextStateSnapshot({
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
  })

  const save = async (): Promise<void> => {
    const entityIdString = String(entityId)
    if (
      shouldSkipFieldContextPersist(
        isDirty.value,
        entityIdString,
        TEMPORARY_ID_PATTERNS.NEW_PREFIX,
        NULL_UUID
      )
    ) {
      return
    }

    const currentEntity = entity.value as { id?: string; name?: string; entityKey?: string } | undefined

    await persistFieldContextAfterServerChecks({
      entityKey,
      entityIdString,
      entityId,
      queryClient,
      currentEntity,
      fieldKey,
      state: stateForSaveHelpers,
      validate,
      entityValue: entityValue.value,
      handleChange: (v) => handleChange(v),
    })
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
