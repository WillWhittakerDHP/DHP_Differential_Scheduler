import { ref, shallowRef, computed, getCurrentInstance, triggerRef, watchEffect } from 'vue'
import type { FormContext } from 'vee-validate'
import { categorizeFieldsByLayout as categorizeFieldsByLayoutPure } from '@/utils/forms/layoutFieldCategorization'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { UseFormFieldsOptions, UseFormFieldsReturn } from './types'
import { useFormFieldsStandardLayout } from './useFormFieldsStandardLayout'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalFieldKey } from '@/constants/primitives'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { buildFieldContextReturn } from '@/composables/fieldContext/buildFieldContextReturn'
import { useFieldContextState } from '@/composables/fieldContext/useFieldContextState'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useNotification } from '@/composables/useNotification'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { computeRenderAs } from '@shared/utils/metadataRenderAsUtils'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFormFields')

/**
 * Orchestrates form field setup for entity forms: options, context, and layout (inline/stacked).
 *
 * CONSUMERS (composable-health wave 3): useEntityCardFormSetup (→ EntityCard), EntityFormContent.vue,
 * DynamicForm.vue. Type UseFormFieldsReturn is consumed by entityCardFieldContextAndVisibility.ts.
 *
 * Generic GE matches the card’s entityKey so field contexts and cache entries share one entity type.
 */
export function useFormFields<GE extends GlobalEntityKey = GlobalEntityKey>(
  options: UseFormFieldsOptions<GE>
): UseFormFieldsReturn<GE> {
  const { entityKey, entityId, form: providedForm, fieldMetadata: providedFieldMetadata, adminConfig: providedAdminConfig } =
    options

  /* Read option refs inside computeds so we never assign generic `Ref<>` to a local (avoids UnwrapRef widening).
   * Narrow array elements to GlobalFieldKey<GE> — callers already pass that shape via UseFormFieldsOptions. */
  const fieldKeysSource = computed((): GlobalFieldKey<GE>[] => {
    const list = options.fieldKeys.value
    if (!Array.isArray(list)) return []
    return list as GlobalFieldKey<GE>[]
  })
  const inlineFieldsSource = computed((): GlobalFieldKey<GE>[] => {
    const cfg = options.inlineFieldsConfig
    if (cfg === undefined) return []
    const list = cfg.value
    if (!Array.isArray(list)) return []
    return list as GlobalFieldKey<GE>[]
  })
  const stackedFieldsSource = computed((): GlobalFieldKey<GE>[] => {
    const cfg = options.stackedFieldsConfig
    if (cfg === undefined) return []
    const list = cfg.value
    if (!Array.isArray(list)) return []
    return list as GlobalFieldKey<GE>[]
  })

  const _resolvedAdminConfig = providedAdminConfig ?? useAdminConfig()
  void _resolvedAdminConfig
  const { warning: showWarning } = useNotification()
  const capturedInstance = getCurrentInstance()
  const appInstance = capturedInstance?.appContext.app

  const formInstance = computed<FormContext | undefined>(() => providedForm?.value ?? undefined)
  /** shallowRef: avoid Vue deep UnwrapRef on stored FieldContextTypeGrouped (state holds Refs). */
  const fieldContextCache = shallowRef<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>>(new Map())
  const warnedFields = ref<Set<string>>(new Set())
  const tempEntityId = ref<GlobalEntityId>(toGlobalEntityId(TEMPORARY_ID_PATTERNS.NEW_PREFIX + String(Date.now())))

  const currentEntityId = computed(() => entityId?.value || tempEntityId.value)

  const isFormReady = computed(() => {
    const currentFormInstance = formInstance.value
    if (!currentFormInstance) return false
    const hasValuesObject = currentFormInstance.values !== undefined &&
      currentFormInstance.values !== null &&
      typeof currentFormInstance.values === 'object'
    return hasValuesObject
  })

  const isMetadataReady = computed(() => {
    const metadata = providedFieldMetadata?.value
    const hasMetadata = !!metadata && Object.keys(metadata).length > 0
    return hasMetadata || providedFieldMetadata !== undefined
  })

  const fieldsNeedingContexts = computed<GlobalFieldKey<GE>[]>(() => {
    if (!isFormReady.value) return []
    const metadata = providedFieldMetadata?.value
    const metadataKeys = metadata ? Object.keys(metadata) : []
    const rawKeys = fieldKeysSource.value
    const baseKeys = rawKeys !== undefined && rawKeys !== null && Array.isArray(rawKeys) ? rawKeys : []
    const combinedKeys = Array.from(new Set([...baseKeys, ...metadataKeys])) as GlobalFieldKey<GE>[]

    if (isMetadataReady.value && metadata) {
      combinedKeys.forEach((fieldKey) => {
        const fieldKeyStr = String(fieldKey)
        if (!(fieldKeyStr in metadata) && !warnedFields.value.has(fieldKeyStr)) {
          logger.warn(`Missing FieldMetadataEntry for ${entityKey}.${fieldKeyStr}. Field must be configured in /admin-metadata before rendering.`)
          showWarning(`Missing FieldMetadataEntry for ${entityKey}.${fieldKeyStr}. Field must be configured in /admin-metadata before rendering.`, 6000)
          warnedFields.value.add(fieldKeyStr)
        }
      })
    }
    return combinedKeys.filter((fieldKey) => !fieldContextCache.value.has(String(fieldKey)))
  })

  const getFieldTypeFromMetadata = (
    meta: FieldMetadataEntry,
    fieldKey: string
  ): FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>['state']['displayConfig']['fieldType'] => {
    const effective = computeRenderAs(meta.dataType, meta.inputConfig ?? null, fieldKey)
    if (effective === 'multiselect') return 'multiselect'
    if (effective === 'select' || effective === 'reference') return 'select'
    if (effective === 'number') return 'number'
    if (meta.dataType === 'boolean' || meta.dataType === 'ternary') return 'boolean'
    if (
      meta.inputConfig &&
      typeof meta.inputConfig === 'object' &&
      (meta.inputConfig as Record<string, unknown>).multiline === true
    ) {
      return 'textarea'
    }
    return 'text'
  }

  const getFieldDisplayConfig = (
    fieldKey: string
  ): FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>['state']['displayConfig'] => {
    const metadata = providedFieldMetadata?.value
    const hasMetadataKeys = !!metadata && Object.keys(metadata).length > 0

    if (!hasMetadataKeys && isMetadataReady.value) {
      const warningKey = `${entityKey}:metadata-empty`
      if (!warnedFields.value.has(warningKey)) {
        logger.warn(`Missing fieldMetadata for ${entityKey}. Field metadata must be provided from /admin-metadata.`, { entityKey })
        showWarning(`Missing fieldMetadata for ${entityKey}. Field metadata must be provided from /admin-metadata.`, 6000)
        warnedFields.value.add(warningKey)
      }
      return { fieldType: 'text', label: fieldKey, placeholder: '', required: false, disabled: false }
    }
    if (!hasMetadataKeys) {
      return { fieldType: 'text', label: fieldKey, placeholder: '', required: false, disabled: false }
    }

    const meta = metadata[fieldKey]
    if (!meta && isMetadataReady.value) {
      logger.warn(`Missing FieldMetadataEntry for ${entityKey}.${fieldKey}. Field must be configured in /admin-metadata before rendering.`)
      if (!warnedFields.value.has(fieldKey)) {
        showWarning(`Missing FieldMetadataEntry for ${entityKey}.${fieldKey}. Field must be configured in /admin-metadata before rendering.`, 6000)
        warnedFields.value.add(fieldKey)
      }
      return { fieldType: 'text', label: fieldKey, placeholder: '', required: false, disabled: false }
    }
    if (!meta) {
      return { fieldType: 'text', label: fieldKey, placeholder: '', required: false, disabled: false }
    }
    if (!meta.label && !warnedFields.value.has(`${fieldKey}:label`)) {
      logger.warn(`Missing label in FieldMetadataEntry for ${entityKey}.${fieldKey}. Metadata should include label property.`, { entityKey, fieldKey })
      showWarning(`Missing label in FieldMetadataEntry for ${entityKey}.${fieldKey}. Metadata should include label property.`, 6000)
      warnedFields.value.add(`${fieldKey}:label`)
    }
    const displayLabel = meta.label !== undefined && meta.label !== null && meta.label !== '' ? meta.label : fieldKey
    const hintFromInput =
      meta.inputConfig &&
      typeof meta.inputConfig === 'object' &&
      typeof (meta.inputConfig as Record<string, unknown>).hint === 'string'
        ? String((meta.inputConfig as Record<string, unknown>).hint)
        : undefined
    const metaHelp = (meta as { helpText?: string }).helpText
    return {
      label: displayLabel,
      placeholder: (meta as { placeholder?: string }).placeholder ?? undefined,
      fieldType: getFieldTypeFromMetadata(meta, fieldKey),
      required: meta.isRequired === true,
      disabled: (meta as { disabled?: boolean }).disabled === true,
      readOnly: (meta as { readOnly?: boolean }).readOnly === true,
      helpText: hintFromInput ?? metaHelp,
    }
  }

  const createFieldContext = (fieldKey: GlobalFieldKey<GE>, entityIdValue: GlobalEntityId): void => {
    const cacheKey = String(fieldKey)
    if (fieldContextCache.value.has(cacheKey)) return

    try {
      const buildContext = (): void => {
        const currentFormInstance = formInstance.value
        if (!currentFormInstance) {
          throw new Error(`[useFormFields] Form instance not ready for field ${fieldKey}`)
        }
        const stateAndActions = useFieldContextState<GE, GlobalFieldKey<GE>>(
          fieldKey,
          entityKey,
          entityIdValue,
          { form: currentFormInstance as FormContext, displayConfig: getFieldDisplayConfig(String(fieldKey)) }
        )
        const fieldContext = buildFieldContextReturn(stateAndActions)
        fieldContextCache.value.set(cacheKey, fieldContext)
        triggerRef(fieldContextCache)
      }
      if (capturedInstance && appInstance?.runWithContext) {
        appInstance.runWithContext(buildContext)
      } else {
        buildContext()
      }
    } catch (error) {
      logger.error('Error creating context for field', { entityKey, entityIdValue, fieldKey, error })
    }
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

  const context = {
    fieldContextCache,
    isFormReady,
    fieldsNeedingContexts,
    getFieldContext,
    currentEntityId,
  }

  const adminComp = useAdmin()

  const getReadyFields = (fields: GlobalFieldKey<GE>[]): GlobalFieldKey<GE>[] => {
    return fields.filter((fieldKey) => {
      const hasContext = !!context.getFieldContext(fieldKey)
      const fieldKeyStr = String(fieldKey)
      const hasMetadata = providedFieldMetadata?.value && fieldKeyStr in providedFieldMetadata.value
      return hasContext && hasMetadata
    })
  }

  const categorizeFieldsByLayout = (fields: GlobalFieldKey<GE>[]) => {
    return categorizeFieldsByLayoutPure(
      fields.map(String),
      asEmptyArray(inlineFieldsSource.value).map(String),
      asEmptyArray(stackedFieldsSource.value).map(String)
    )
  }

  const standardLayout = useFormFieldsStandardLayout<GE>({
    fieldKeys: fieldKeysSource,
    inlineFieldsConfig: inlineFieldsSource,
    stackedFieldsConfig: stackedFieldsSource,
    getReadyFields,
  })

  const getBlockShapeProperties = (): { composable: boolean; canHaveParts: boolean } => {
    if (entityKey !== 'blockInstance') return { composable: false, canHaveParts: false }
    const entityIdValue = context.currentEntityId.value
    const blockInstance = adminComp.getEntity('blockInstance', toGlobalEntityId(entityIdValue))
    if (!blockInstance) return { composable: false, canHaveParts: false }
    const blockShape = adminComp.getEntity('blockShape', toGlobalEntityId(blockInstance.blockShapeRef))
    if (!blockShape) return { composable: false, canHaveParts: false }
    return {
      composable: blockShape.composable === true,
      canHaveParts: blockShape.canHaveParts === true,
    }
  }

  const shouldShowPartInstances = computed(() => {
    if (entityKey !== 'blockInstance') return false
    return getBlockShapeProperties().canHaveParts
  })

  return {
    fieldContextCache: context.fieldContextCache,
    isFormReady: context.isFormReady,
    fieldsNeedingContexts: context.fieldsNeedingContexts,
    getFieldContext: context.getFieldContext,
    getBlockShapeProperties,
    shouldShowPartInstances,
    categorizeFieldsByLayout,
    getReadyFields,
    inlineFields: standardLayout.inlineFields,
    stackedFields: standardLayout.stackedFields,
    readyInlineFields: standardLayout.readyInlineFields,
    readyStackedFields: standardLayout.readyStackedFields,
  }
}
